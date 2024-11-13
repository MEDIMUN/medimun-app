"use client";

import { Button } from "@nextui-org/button";
import { Input } from "@/components/input";
import { arrayFromNumber } from "@/lib/array-from-number";
import { ArrowRightCircleIcon, ArrowRightIcon, EllipsisHorizontalCircleIcon } from "@heroicons/react/16/solid";
import React, { useEffect, useRef, useState } from "react";
import { TopBar, UserTooltip } from "../../../client-components";
import { loadMoreMessages } from "./actions";
import { cn } from "@/lib/cn";
import { Avatar } from "@nextui-org/avatar";
import Link from "next/link";
import { useSocket } from "@/contexts/socket";
import { Textarea } from "@nextui-org/input";
import { useRouter } from "next/navigation";
import { generateUserData } from "@/lib/user";
import { Text } from "@/components/text";

export function ChatLayout({ group, authSession }) {
	const textareaRef = useRef(null);
	const [isMobile, setIsMobile] = useState();
	const [viewportHeight, setViewportHeight] = useState();
	const [scrollY, setScrollY] = useState(0); // Store scroll position
	const [isFocused, setIsFocused] = useState(false);
	const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
	const [isMounted, setIsMounted] = useState(false);
	const [noOfMessages, setNoOfMessages] = useState(100);
	const [isLoading, setIsLoading] = useState(true);
	const observerRef = useRef(null);
	const socket = useSocket();
	const router = useRouter();
	const [inputValue, setInputValue] = useState("");
	const [messages, setMessages] = useState(group.Message);
	let groupName, otherUserRole;

	// Function to check if the current screen size is mobile
	const checkIsMobile = () => window.innerWidth < 768;

	useEffect(() => {
		// Update `isMobile` based on screen size in real-time
		const handleResize = () => {
			setIsMobile(checkIsMobile());
			const newViewportHeight = window.visualViewport?.height || window.innerHeight;
			setViewportHeight(newViewportHeight);
		};

		// Update viewport height and isMobile on resize
		handleResize();
		window.addEventListener("resize", handleResize);
		window.visualViewport?.addEventListener("resize", handleResize);

		// Cleanup on component unmount
		return () => {
			window.removeEventListener("resize", handleResize);
			window.visualViewport?.removeEventListener("resize", handleResize);
		};
	}, []);

	const handleScroll = () => {
		setScrollY(window.scrollY);
		if (window.scrollY > 230) {
			window.scrollTo(0, window.scrollY - 180);
		}
	};

	useEffect(() => {
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleFocus = () => {
		setIsFocused(true);
		if (isMobile) {
			window.scrollTo(0, 0);
			setScrollY(window.scrollY);
			//disable scroll
			document.body.style.overflow = "hidden";
			document.body.style.position = "fixed";
		}
	};

	const handleBlur = () => {
		setIsFocused(false);
		window.scrollTo(0, scrollY);
		//enable scroll
		document.body.style.overflow = "auto";
		document.body.style.position = "relative";
	};

	useEffect(() => {
		if (!isMobile || !isFocused) return;
		const interval = setInterval(() => {
			window.scrollTo(0, 0);
		}, 100);
		return () => clearInterval(interval);
	}, [scrollY]);

	if (group.GroupMember.length == 2) {
		const otherUser = group.GroupMember.find((member) => member.userId !== authSession.user.id);
		const fullName = otherUser.user.displayName || `${otherUser.user.officialName} ${otherUser.user.officialSurname}`;
		otherUserRole = otherUser?.user.currentRoleNames[0];
		groupName = (
			<Link href={`/medibook/users/${otherUser?.user?.username || otherUser?.user?.id}`} className="flex cursor-pointer gap-1">
				<Avatar showFallback size="sm" className="w-6 my-auto h-6" src={`/api/users/${otherUser.user.id}/avatar`} /> {fullName}
			</Link>
		);
	}

	if (group.GroupMember.length > 2) {
		const otherUsers = group.GroupMember.filter((member) => member.userId !== authSession.user.id);
		groupName =
			group.name || otherUsers.map((member) => member.user.displayName || `${member.user.officialName} ${member.user.officialSurname}`).join(", ");
	}

	//when in view add 100 more messages

	//join the group

	async function handleJoinGroup() {
		const isBrowser = typeof window !== "undefined";
		if (!isBrowser) return;
		if (!socket) return;
		socket.on("connect", async () => {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			socket.emit("join:private-group", group.id);
		});
	}

	useEffect(() => {
		setIsMounted(true);
		return () => setIsMounted(false);
	}, []);

	useEffect(() => {
		if (!socket) return;
		handleJoinGroup();
		return () => {
			socket.emit("leave-room", `private-room-group.id-${group.id}`);
		};
	}, [socket, router]);

	useEffect(() => {
		if (!socket) return;
		socket.on("joined:private-group", async (groupId) => {
			if (groupId === group.id) {
				setIsLoading(false);
			}
		});
	}, [socket, router]);

	//on diconnext set loading to true
	useEffect(() => {
		if (!socket) return;
		socket.on("disconnect", () => {
			setIsLoading(true);
		});
	}, [socket, router]);

	async function handleSendMessage() {
		if (!socket) return;
		if (isLoading) return;
		if (!inputValue || inputValue.length === 0) return;
		if (inputValue.length > 2000) return;
		if (textareaRef.current) textareaRef.current.focus();
		const isMessageOnlySpacesORLineBreaks = inputValue.replace(/\s/g, "").length === 0;
		if (isMessageOnlySpacesORLineBreaks) return;
		const heartsReplaced = inputValue.replace(/<3/g, "❤️");
		socket.emit("update:private-message", {
			groupId: group.id,
			action: "NEW",
			data: heartsReplaced,
		});
		setInputValue("");
		//update messages

		const newMessage = {
			id: Math.random(),
			markdown: heartsReplaced,
			userId: authSession.user.id,
			user: {
				id: authSession.user.id,
				officialName: authSession.user.officialName,
				officialSurname: authSession.user.officialSurname,
				displayName: authSession.user.displayName,
			},
		};
		setMessages((prev) => [newMessage, ...prev]);
	}

	//liste for enter key
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Enter") {
				handleSendMessage();
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [inputValue]);

	//listen for new messages
	useEffect(() => {
		if (!socket) return;
		socket.on("update:private-message", async (action, data) => {
			if (action === "NEW") {
				setMessages((prev) => [data, ...prev]);
			}
		});
	}, [socket]);

	//load more messages using observer

	async function handleLoadMoreMessages() {
		if (isLoading) return;
		if (messages.length < 50) return;
		const moreMessages = await loadMoreMessages(group.id, messages.length);
		if (!moreMessages) return;
		setMessages((prev) => [...prev, ...moreMessages.data.messages]);
		setIsLoading(false);
	}

	useEffect(() => {
		if (!observerRef.current) return;
		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) {
				handleLoadMoreMessages();
			}
		});
		observer.observe(observerRef.current);
		return () => observer.disconnect();
	}, [observerRef.current]);

	if (isMounted)
		return (
			<div
				className={cn("flex flex-col md:w-full h-full w-screen")}
				style={{
					...(isIos && isMobile && viewportHeight !== undefined ? { height: `${viewportHeight + scrollY}px` } : {}),
					...(!isIos && isMobile ? { height: `${viewportHeight}px` } : {}),
					transform: `translateY(-${-1 * scrollY}px)`,
				}}>
				<div className="flex gap-1 z-[9999999999999999999999999999999] shadow-md md:shadow-none bg-white md:bg-zinc-100 p-2 !absolute top-0 left-0 right-0">
					<TopBar /* subheading={otherUserRole} */ title={groupName} buttonText={"Inboxes"} buttonHref="/medibook/messenger" hideSearchBar></TopBar>
				</div>
				<div className="w-full overflow-y-auto max-w-5xl mx-auto flex-col-reverse flex">
					<div className="flex-grow flex w-full mx-auto flex-col-reverse overflow-y-auto">
						<div className="min-h-32" />
						{messages.map((message, index) => {
							const isMyMessage = message.userId === authSession.user.id;
							let isAfterMyMessage, isBeforeMyMessage;
							if (index > 0) {
								isAfterMyMessage = messages[index - 1].userId === authSession.user.id;
							}
							if (index < messages.length - 1) {
								isBeforeMyMessage = messages[index + 1].userId === authSession.user.id;
							}

							if (isMyMessage) {
								return (
									<div key={`${message.id}-${Math.random()}`} className={cn("flex gap-2", "justify-end")}>
										<div className="flex gap-1">
											<div className="ml-5 my-auto">
												<ArrowRightCircleIcon className="w-4 h-4 text-gray-500" />
											</div>
											<div className="flex flex-col">
												<div className="flex gap-1">
													<span className="font-semibold">{message.user.displayName}</span>
												</div>
												<div
													className={cn(
														"max-w-[400px] mr-2 text-sm min-w-[35px] text-right",
														"bg-gray-100 p-2 rounded-lg",
														isAfterMyMessage && "rounded-br-none mb-[2px]",
														isBeforeMyMessage && "rounded-tr-none"
													)}>
													{message.markdown}
												</div>
											</div>
										</div>
									</div>
								);
							} else {
								const isPreviousSamePersons = messages[index - 1]?.userId === message.userId;
								const isNextSamePersons = messages[index + 1]?.userId === message.userId;
								return (
									<>
										<div key={message.id} className={cn("flex gap-2", "justify-start")}>
											<div className="flex gap-1 ml-2">
												{!isPreviousSamePersons ? (
													<UserTooltip userId={message.userId} className="w-8 mt-auto">
														<Avatar showFallback radius="sm" size="sm" className="w-8 mt-auto" src={`/api/users/${message.userId}/avatar`} />
													</UserTooltip>
												) : (
													<div className="w-8" />
												)}
												<div className="flex flex-col">
													<div className="flex gap-1">
														<span className="font-semibold">{message.user.displayName}</span>
													</div>
													<div
														className={cn(
															"max-w-[400px] text-sm min-w-[35px] text-left mr-5",
															"bg-gray-100 p-2 rounded-lg",
															isPreviousSamePersons && "rounded-bl-none mb-[2px]",
															isNextSamePersons && "rounded-tl-none"
														)}>
														{message.markdown}
													</div>
												</div>
											</div>
										</div>
										{!isNextSamePersons && <Text className="!text-[9px] text-gray-500 ml-12 -mb-1">{message.user.officialName}</Text>}
									</>
								);
							}
						})}
						<div className="mx-auto">Messages are monitored</div>
						{messages.length > 50 && (
							<i onClick={handleLoadMoreMessages} className="z-[1000000] text-zinc-500 text-sm cursor-pointer text-center" ref={observerRef}>
								Click to load more messages...
							</i>
						)}
						<div className="min-h-[72px]" />
					</div>
				</div>
				<div className="flex gap-1 max-w-5xl mx-auto z-[9999999999] bg-white p-2 border-t !fixed bottom-0 left-0 right-0">
					<div className="w-full">
						<Textarea
							value={inputValue}
							onValueChange={(e) => setInputValue(e)}
							isDisabled={isLoading}
							autoComplete="off"
							ref={textareaRef}
							onFocus={handleFocus}
							onBlur={handleBlur}
							role="presentation"
							height="auto"
							classNames={{ input: "text-lg md:text-md", inputWrapper: "!rounded-br-none" }}
							className="w-full  !text-xl h-full  rounded-none rounded-tl-md"
						/>
					</div>
					<div className="w-[45px] md:w-[35px] h-[45px] md:h-[35px] mt-auto">
						<Button
							isIconOnly
							onPress={() => handleSendMessage()}
							isDisabled={isLoading}
							isLoading={isLoading}
							className="w-full aspect-square h-full bg-zinc-800 !rounded-bl-lg hover:bg-zinc-600 p-2 rounded-lg">
							<ArrowRightIcon color="white" className="text-white w-4  h-4" />
						</Button>
					</div>
				</div>
			</div>
		);
}

export default ChatLayout;

/* 	socket.on("update:private-message", async ({ groupId, messageId, action, data, replyToId }) => {
		const authSession = await socketAuth(socket);
		if (!authSession) return socket.emit("error", "Unauthorized");

		if (action === "DELETE") {
			const selectedMessage = await prisma.message.update({
				where: { id: messageId, userId: authSession.user.id },
				include: { user: true },
				data: { isDeleted: true },
			});
			socket.to(`room:private-group-${groupId}`).emit("update:private-message", "UPDATE", selectedMessage);
		}
		if (action === "EDIT") {
			const selectedMessage = await prisma.message.update({
				where: { id: messageId, userId: authSession.user.id },
				include: { user: true },
				data: { markdown: data },
			});
			socket.to(`room:private-group-${groupId}`).emit("update:private-message", "UPDATE", selectedMessage);
		}
		if (action === "REPLY") {
			const selectedMessage = await prisma.message.findFirst({
				where: { id: replyToId },
				include: {
					group: true,
					user: {
						select: {
							id: true,
							officialName: true,
							officialSurname: true,
							displayName: true,
						},
					},
					MessageReaction: {
						include: {
							user: {
								select: {
									id: true,
									officialName: true,
									officialSurname: true,
									displayName: true,
								},
							},
						},
					},
				},
			});

			if (!selectedMessage) {
				socket.emit("error", "Message not found");
				return;
			}

			const newMessage = await prisma.message.create({
				data: {
					groupId: selectedMessage.groupId,
					replyToId,
					userId: authSession.user.id,
					markdown: data,
					isDeleted: false,
				},
				include: { user: true },
			});
			socket.to(`room:private-group-${groupId}`).emit("update:private-message", "NEW", newMessage);
		}
		if (action === "NEW") {
			const selectedGroup = await prisma.group.findUnique({
				where: { id: groupId, GroupMember: { some: { userId: authSession.user.id } } },
			});
			if (!selectedGroup) return socket.emit("error", "Group not found");
			const newMessage = await prisma.message.create({
				data: {
					groupId: selectedGroup.id,
					userId: authSession.user.id,
					markdown: data,
					isDeleted: false,
				},
				include: {
					user: {
						select: {
							id: true,
							officialName: true,
							officialSurname: true,
							displayName: true,
						},
					},
					MessageReaction: {
						include: {
							user: {
								select: {
									id: true,
									officialName: true,
									officialSurname: true,
									displayName: true,
								},
							},
						},
					},
				},
			});
			socket.to(`room:private-group-${groupId}`).emit("update:private-message", "NEW", newMessage);
		}
		if (action === "REACTION") {
			const selectedMessage = await prisma.message.findFirst({
				where: {
					id: messageId,
					group: {
						GroupMember: { some: { userId: authSession.user.id } },
					},
				},
			});

			if (!selectedMessage) {
				socket.emit("error", "Message not found");
				return;
			}

			if (data === null) {
				await prisma.messageReaction.delete({
					where: {
						userId_messageId: {
							userId: authSession.user.id,
							messageId,
						},
					},
				});
			}
			const newReaction = await prisma.messageReaction.upsert({
				where: {
					userId_messageId: {
						userId: authSession.user.id,
						messageId,
					},
				},
				include: { user: true },
				update: { reaction: data },
				create: {
					userId: authSession.user.id,
					messageId,
					reaction: data,
				},
			});

			const finalMessage = await prisma.message.findFirst({
				where: { id: messageId },
				include: {
					user: {
						select: {
							id: true,
							officialName: true,
							officialSurname: true,
							displayName: true,
						},
					},
					MessageReaction: {
						include: {
							user: {
								select: {
									id: true,
									officialName: true,
									officialSurname: true,
									displayName: true,
								},
							},
						},
					},
				},
			});
			socket.to(`room:private-group-${groupId}`).emit("update:private-message", "UPDATE", finalMessage);
			//typing
			if (action === "TYPING") {
				socket.to(`room:private-group-${groupId}`).emit("update:private-message", "TYPING", authSession.user.id);
			}
		}
	}); */
