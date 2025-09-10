"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { TopBar2 as TopBar, UserTooltip } from "../../../client-components";
import { loadMoreMessages } from "./actions";
import { cn } from "@/lib/cn";
import { Avatar, AvatarGroup } from "@heroui/avatar";
import Link from "next/link";
import { useSocket } from "@/contexts/socket";
import { Textarea } from "@heroui/input";
import { usePathname, useRouter } from "next/navigation";
import { Text } from "@/components/text";
import MediBookLogo from "@/public/assets/branding/logos/medichat-logo-red.svg";
import Image from "next/image";
import { Button as MButton } from "@/components/button";
import { useUpdateEffect } from "@/hooks/use-update-effect";
import { Badge } from "@/components/badge";
import { ArrowRight, X } from "lucide-react";

export function ChatLayout({ group, authSession }) {
	const textareaRef = useRef(null);
	const [isMobile, setIsMobile] = useState();
	const [viewportHeight, setViewportHeight] = useState();
	const [scrollY, setScrollY] = useState(0); // Store scroll position
	const [isFocused, setIsFocused] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const observerRef = useRef(null);
	const { socket } = useSocket();
	const router = useRouter();
	const pathname = usePathname();
	const [inputValue, setInputValue] = useState("");
	const [messages, setMessages] = useState(group.Message);
	const [receivedFinalMessage, setReceivedFinalMessage] = useState(false);
	const [selectedMessageId, setSelectedMessageId] = useState("");
	const [replyToId, setReplyToId] = useState("");
	const [reacttToId, setReactToId] = useState("");
	const [isIos, setIsIos] = useState(false);
	const [editId, setEditId] = useState("");
	let groupName, otherUserRole;

	// Function to check if the current screen size is mobile
	const checkIsMobile = () => window.innerWidth < 768;

	useEffect(() => {
		setIsIos(/iPhone|iPod/.test(navigator.userAgent));
	}, []);

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

	if (group.GroupMember?.length == 2) {
		const otherUser = group.GroupMember.find((member) => member.userId !== authSession.user.id);
		const fullName = otherUser.user.displayName || `${otherUser.user.officialName} ${otherUser.user.officialSurname}`;
		otherUserRole = otherUser?.user.currentRoleNames?.[0];
		groupName = (
			<Link href={`/medibook/users/${otherUser?.user?.username || otherUser?.user?.id}`} className="flex cursor-pointer gap-1">
				<Avatar showFallback size="sm" radius="sm" className="w-6 my-auto h-6" src={`/api/users/${otherUser.user.id}/avatar`} /> {fullName}
			</Link>
		);
	}

	if (group.GroupMember?.length > 2) {
		const otherUsers = group.GroupMember.filter((member) => member.userId !== authSession.user.id);
		const allNnames =
			group.name ||
			otherUsers
				.map((member) => member.user.displayName || `${member.user.officialName} ${member.user.officialSurname}`)
				.join(", ")
				.slice(0, 75);

		groupName = (
			<div className="flex gap-2 ml-2">
				<AvatarGroup max={5} className="flex gap-1">
					{otherUsers.map((member) => (
						<UserTooltip userId={member.userId} key={member.userId}>
							<Avatar showFallback size="sm" radius="sm" className="w-6 my-auto h-6" src={`/api/users/${member.userId}/avatar`} />
						</UserTooltip>
					))}
				</AvatarGroup>
				<Text className="truncate line-clamp-1">{allNnames}</Text>
			</div>
		);
	}

	async function handleJoinGroup() {
		const isBrowser = typeof window !== "undefined";
		if (!isBrowser) return;
		if (!socket) return;
		await new Promise((resolve) => setTimeout(resolve, 1500));
		socket.emit("join:private-group", group.id);
	}

	useEffect(() => {
		setIsMounted(true);
		return () => setIsMounted(false);
	}, []);

	useEffect(() => {
		if (!socket) return;
		handleJoinGroup();
		socket.on("connect", () => {
			handleJoinGroup();
		});
		return () => {
			socket.emit("leave-room", `private-room-group.id-${group.id}`);
		};
	}, [socket, router, pathname]);

	useEffect(() => {
		if (!socket) return;
		socket.on("joined:private-group", async (groupId) => {
			if (groupId === group.id) {
				setIsLoading(false);
			}
		});
	}, [socket, router]);

	useEffect(() => {
		if (!socket) return;
		socket.on("disconnect", () => {
			setIsLoading(true);
		});
	}, [socket, router, pathname]);

	async function handleSendMessage(e) {
		if (e) e.preventDefault();
		if (!socket) return;
		if (isLoading) return;
		if (!inputValue || inputValue.length === 0) return;
		if (inputValue.length > 2000) return;
		if (textareaRef.current) textareaRef.current.focus();
		const isMessageOnlySpacesORLineBreaks = inputValue.replace(/\s/g, "").length === 0;
		if (isMessageOnlySpacesORLineBreaks) return;
		const heartsReplaced = inputValue.replace(/<3/g, "❤️");
		let newMessage;

		const tempId = Math.random().toString();

		if (editId) {
			socket.emit("update:private-message", {
				groupId: group.id,
				action: "EDIT",
				data: heartsReplaced,
				messageId: editId,
			});
			newMessage = {
				id: editId,
				markdown: heartsReplaced,
				userId: authSession.user.id,
				createdAt: new Date(),
				user: {
					id: authSession.user.id,
					officialName: authSession.user.officialName,
					officialSurname: authSession.user.officialSurname,
					displayName: authSession.user.displayName,
				},
			};
			setEditId("");
			setMessages((prev) => {
				const index = prev.findIndex((message) => message.id === editId);
				if (index === -1) return prev;
				const newMessages = [...prev];
				newMessages[index] = newMessage;
				return newMessages;
			});
			setInputValue("");
			return;
		}

		if (!replyToId) {
			socket.emit("update:private-message", {
				groupId: group.id,
				action: "NEW",
				data: heartsReplaced,
				clientId: tempId,
			});

			newMessage = {
				id: tempId,
				markdown: heartsReplaced,
				createdAt: new Date(),
				userId: authSession.user.id,
				user: {
					id: authSession.user.id,
					officialName: authSession.user.officialName,
					officialSurname: authSession.user.officialSurname,
					displayName: authSession.user.displayName,
				},
			};
		}
		if (replyToId) {
			socket.emit("update:private-message", {
				groupId: group.id,
				action: "REPLY",
				data: heartsReplaced,
				clientId: tempId,
				replyToId,
			});
			const selectedMessage = messages.find((message) => message.id === replyToId);
			newMessage = {
				id: tempId,
				markdown: heartsReplaced,
				userId: authSession.user.id,
				createdAt: new Date(),
				replyTo: selectedMessage,
				user: {
					id: authSession.user.id,
					officialName: authSession.user.officialName,
					officialSurname: authSession.user.officialSurname,
					displayName: authSession.user.displayName,
				},
			};
		}
		setReplyToId("");
		setMessages((prev) => [newMessage, ...prev]);
		setInputValue("");
	}

	useEffect(() => {
		if (!socket) return;
		socket.on("update:message-id", async (action, id, data) => {
			if (action === "UPDATE") {
				setMessages((prev) => {
					const index = prev.findIndex((message) => message.id === id);
					if (index === -1) return prev;
					const newMessages = [...prev];
					newMessages[index] = data;
					return newMessages;
				});
			}
		});
	}, [socket]);

	//liste for enter key
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Enter") {
				handleSendMessage(e);
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
				if (!messages.find((message) => message.id === data.id)) {
					setMessages((prev) => [data, ...prev]);
				}
			}
			if (action === "UPDATE") {
				setMessages((prev) => {
					const index = prev.findIndex((message) => message.id === data.id);
					if (index === -1) return prev;
					const newMessages = [...prev];
					newMessages[index] = data;
					return newMessages;
				});
			}
		});
	}, [socket]);

	useUpdateEffect(() => {
		if (!socket) return;
		socket.on("connect", () => {
			router.refresh();
		});
	}, [socket]);

	//load more messages using observer

	async function handleLoadMoreMessages() {
		if (isLoading) return;
		if (messages.length < 50) return;
		const moreMessages = await loadMoreMessages(group.id, messages.length);
		setIsLoading(false);
		if (!moreMessages?.data?.messages?.length) return setReceivedFinalMessage(true);
		setMessages((prev) => [...prev, ...moreMessages.data.messages]);
	}

	useEffect(() => {
		if (!observerRef.current) return;
		const observer = new IntersectionObserver((entries) => {
			if (entries?.[0]?.isIntersecting) {
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
				<div className="flex gap-1 z-99999 shadow-md md:shadow-none bg-white dark:bg-zinc-800 md:bg-zinc-100 p-2 absolute! top-0 left-0 right-0">
					<div className="w-full">
						<TopBar
							hideBackdrop
							className="max-w-5xl mx-auto z-99999"
							title={groupName}
							buttonText={isMobile && "Inboxes"}
							buttonHref="/medibook/messenger"
							hideSearchBar></TopBar>
					</div>
				</div>
				<div className="w-full overflow-y-auto max-w-5xl mx-auto dark:bg-zinc-900 flex-col-reverse flex">
					{selectedMessageId && <div className="min-h-[50px]" />}

					<div className="grow flex w-full px-2 mx-auto flex-col-reverse overflow-y-auto">
						<div className="min-h-32" />
						{messages.map((message, index) => {
							const isMyMessage = message?.userId === authSession.user.id;
							let isAfterMyMessage, isBeforeMyMessage;
							const messageAfter = messages[index - 1] || {};

							if (index > 0) {
								isAfterMyMessage = messageAfter.userId === authSession.user.id;
							}

							if (index < messages?.length - 1) {
								isBeforeMyMessage = messages[index + 1].userId === authSession.user.id;
							}

							//not time just date
							const isFirstMessageOfDay =
								index === messages.length - 1 ||
								new Date(message.createdAt).toLocaleDateString() !== new Date(messages[index + 1]?.createdAt).toLocaleDateString();

							const isLastMessageOfDay =
								index === 0 || new Date(message.createdAt).toLocaleDateString() !== new Date(messages[index - 1]?.createdAt).toLocaleDateString();

							const MessageDayDivider = () => (
								<Badge className="text-center rounded-full! text-xs mx-auto opacity-80 text-gray-500 mt-2">
									{new Date(message.createdAt).toLocaleDateString("en-GB")}
								</Badge>
							);

							const messageHasUrl = message.markdown.match(/(https?:\/\/[^\s]+)/g);
							const fullUrl = messageHasUrl?.[0];

							if (isMyMessage) {
								const isReplyTo = !!message.replyTo;
								const name = isReplyTo
									? message.replyTo.user.displayName || `${message.replyTo.user.officialName} ${message.replyTo.user.officialSurname}`
									: "";

								return (
									<Fragment key={message.id}>
										<div
											onMouseDown={(e) => {
												if (!messageHasUrl) e.preventDefault();
												setSelectedMessageId(message.id);
												setReplyToId("");
											}}
											className={cn("flex flex-col justify-end gap-2 group", !isBeforeMyMessage && "mt-2")}>
											{isReplyTo && (
												<div className="ml-auto flex gap-1 flex-col">
													<Text className="text-[9px]! text-right text-gray-500  mr-2 -mb-2">Replied to {name}</Text>
													<div className="text-xs px-2 py-3 pb-6 rounded-xl min-w-[80px] dark:text-black text-right ml-auto bg-gray-200/80 -mb-6 line-clamp-2 text-wrap truncate max-w-[300px]">
														{message.replyTo.markdown}
													</div>
												</div>
											)}
											<div className="flex gap-1 ml-auto">
												<div className="flex flex-col">
													<div
														className={cn(
															"min-w-[60px] duration-200",
															"max-w-[300px] md:max-w-[400px] text-sm min-w-[35px] text-right",
															"bg-blue-500 text-white px-2 py-1 hyphens-auto break-words overflow-hidden ml-auto rounded-xl",
															isAfterMyMessage && !messageAfter.replyTo && !isLastMessageOfDay && "rounded-br-none mb-[2px]",
															isBeforeMyMessage && !isFirstMessageOfDay && !isReplyTo && "rounded-tr-none",
															messageAfter.replyTo && "mb-3",
															selectedMessageId === message.id && "mr-4 bg-blue-500/80"
														)}>
														{messageHasUrl
															? message.markdown.split(fullUrl).map((part, index, array) => (
																	<Fragment key={index + "mymessagelink"}>
																		{part}
																		{index < array.length - 1 && (
																			<Link
																				onClick={() => setSelectedMessageId("")}
																				target="_blank"
																				className="underline text-primary"
																				href={fullUrl}>
																				{fullUrl}
																			</Link>
																		)}
																	</Fragment>
																))
															: message.markdown}
														<div className="text-right text-[10px] text-white">
															{new Date(message.createdAt).toLocaleTimeString("en-GB").slice(0, 5)}
														</div>
													</div>
												</div>
											</div>
										</div>
										{isFirstMessageOfDay && <MessageDayDivider />}
									</Fragment>
								);
							} else {
								const isPreviousSamePersons = messages[index - 1]?.userId === message.userId;
								const isNextSamePersons = messages[index + 1]?.userId === message.userId;
								const isReplyTo = !!message.replyTo;
								const name = isReplyTo
									? message.replyTo.user.displayName || `${message.replyTo.user.officialName} ${message.replyTo.user.officialSurname}`
									: "";
								const fullName = message.user.displayName || `${message.user.officialName} ${message.user.officialSurname}`;
								return (
									<Fragment key={message.id}>
										<div
											onMouseDown={(e) => {
												if (!messageHasUrl) e.preventDefault();
												setSelectedMessageId(message.id);
												setReplyToId("");
											}}
											className={cn("flex flex-col justify-start gap-2 group")}>
											{!isNextSamePersons && <Text className="text-[9px]! text-left text-gray-500 ml-11 -mb-2">{fullName}</Text>}

											{isReplyTo && (
												<div className="mr-auto ml-9 flex gap-1 flex-col">
													<Text className="text-[9px]! text-left text-gray-500 ml-2 -mb-2">
														{fullName == name ? `${fullName} replied to themselves` : `${fullName} Replied to ${name}`}
													</Text>
													<div className="text-xs px-2 py-3 pb-6 rounded-xl min-w-[80px] text-left mr-auto bg-gray-200/80 dark:bg-gray-600/80 -mb-6 line-clamp-2 text-wrap truncate max-w-[300px]">
														{message.replyTo.markdown}
													</div>
												</div>
											)}
											<div className="flex gap-1 mr-auto">
												{!isPreviousSamePersons || isLastMessageOfDay ? (
													<Avatar showFallback radius="sm" size="sm" className="w-8 mt-auto rounded-xl" src={`/api/users/${message.userId}/avatar`} />
												) : (
													<div className="w-8" />
												)}
												<div className="flex flex-col">
													<div
														className={cn(
															"min-w-[60px] duration-200",
															"max-w-[300px] md:max-w-[400px] text-sm text-left",
															"bg-gray-100 text-zinc-900 dark:bg-zinc-600 dark:text-white px-2 py-1 hyphens-auto break-words overflow-hidden mr-auto rounded-xl",
															isPreviousSamePersons && !messageAfter.replyTo && !isLastMessageOfDay && "rounded-bl-none mb-[2px]",
															isNextSamePersons && !isFirstMessageOfDay && !isReplyTo && "rounded-tl-none",
															selectedMessageId === message.id && "ml-4 bg-gray-100/80"
														)}>
														{messageHasUrl
															? message.markdown.split(fullUrl).map((part, index, array) => (
																	<Fragment key={index + "yourmessagelink"}>
																		{part}
																		{index < array.length - 1 && (
																			<Link
																				onClick={() => setSelectedMessageId("")}
																				target="_blank"
																				className="underline text-primary"
																				href={fullUrl}>
																				{fullUrl}
																			</Link>
																		)}
																	</Fragment>
																))
															: message.markdown}
														<div className="text-left text-[10px] text-black dark:text-white">
															{new Date(message.createdAt).toLocaleTimeString("en-GB").slice(0, 5)}
														</div>
													</div>
												</div>
											</div>
										</div>
										{isFirstMessageOfDay && <MessageDayDivider />}
									</Fragment>
								);
							}
						})}

						{!receivedFinalMessage && messages.length > 49 && (
							<i onClick={handleLoadMoreMessages} className="z-1000000 text-zinc-500 text-sm cursor-pointer text-center" ref={observerRef}>
								Click to load more messages...
							</i>
						)}
						<div className="min-h-[72px]" />
					</div>
				</div>
				<div className="flex flex-col gap-1 font-[montserrat] max-w-5xl mx-auto z-9999999999 bg-white dark:bg-zinc-900 p-2 border-t fixed! bottom-0 left-0 right-0">
					{replyToId && messages.find((message) => message.id === replyToId) && (
						<div className="flex h-12 mb-1 w-full gap-1">
							<MButton
								onMouseDown={(e) => {
									e.preventDefault();
									setReplyToId("");
								}}
								plain
								className="aspect-square h-12 w-12">
								<X size={16} />
							</MButton>
							<div className="bg-gray-100 p-2 rounded-lg overflow-hidden">
								<div className="flex gap-1 text-xs">
									<span className="font-semibold">
										{messages.find((message) => message.id === replyToId).displayName ||
											`${messages.find((message) => message.id === replyToId).user.officialName} ${messages.find((message) => message.id === replyToId).user.officialSurname}`}
									</span>
								</div>
								<div className="text-sm w-full flex-1 line-clamp-1 truncate">{messages.find((message) => message.id === replyToId).markdown}</div>
							</div>
						</div>
					)}
					{editId && messages.find((message) => message.id === editId) && (
						<div className="flex h-12 mb-1 w-full gap-1">
							<MButton
								onMouseDown={(e) => {
									e.preventDefault();
									setEditId("");
								}}
								plain
								className="aspect-square h-12 w-12">
								<X size={16} />
							</MButton>
							<div className="bg-gray-100 p-2 rounded-lg overflow-hidden">
								<div className="flex gap-1 text-xs">
									<span className="font-semibold">Editing</span>
								</div>
								<div className="text-sm w-full flex-1 line-clamp-1 truncate">{messages.find((message) => message.id === editId).markdown}</div>
							</div>
						</div>
					)}
					{selectedMessageId && (
						<div className="w-full mb-1 overflow-x-scroll">
							<div className="flex gap-1">
								<MButton
									onMouseDown={(e) => {
										e.preventDefault();
										setReplyToId("");
										setSelectedMessageId("");
									}}
									plain>
									<X size={16} />
								</MButton>
								<MButton
									onMouseDown={(e) => {
										e.preventDefault();
										setReplyToId(selectedMessageId);
										setSelectedMessageId("");
									}}
									plain>
									Reply
								</MButton>
								{messages.find((message) => message.id === selectedMessageId).userId === authSession.user.id && (
									<MButton
										onMouseDown={(e) => {
											e.preventDefault();
											setEditId(selectedMessageId);
											setSelectedMessageId("");
											setInputValue(messages.find((message) => message.id === selectedMessageId).markdown);
										}}
										plain>
										Edit
									</MButton>
								)}
								<MButton disabled plain>
									Delete
								</MButton>
								<MButton disabled plain>
									❤️
								</MButton>
								<MButton disabled plain>
									😂
								</MButton>
								<MButton disabled plain>
									🤪
								</MButton>
								<MButton disabled plain>
									😲
								</MButton>
								<MButton disabled plain>
									😔
								</MButton>
								<MButton disabled plain>
									😠
								</MButton>
								<MButton disabled plain>
									👍
								</MButton>
							</div>
						</div>
					)}
					<div className="w-full flex gap-1">
						<div className="w-full">
							<Textarea
								value={inputValue}
								onValueChange={(e) => setInputValue(e)}
								isDisabled={isLoading}
								autoComplete="off"
								ref={textareaRef}
								autoCorrect="off"
								onFocus={handleFocus}
								onBlur={handleBlur}
								role="presentation"
								maxRows={4}
								height="auto"
								enterKeyHint="send"
								classNames={{ input: "text-lg md:text-md", inputWrapper: "" }}
								className="w-full  text-xl! h-full  rounded-none rounded-tl-md"
							/>
						</div>
						<div className="w-[35px] md:w-[35px] h-[35px] md:h-[35px] mt-auto">
							<button
								onMouseDown={handleSendMessage}
								type="submit"
								disabled={isLoading}
								className={`w-full flex aspect-square h-full p-2 rounded-full 
		${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-zinc-800 hover:bg-zinc-600"} 
		${isLoading ? "bg-blue-500 cursor-wait" : ""}`}>
								<ArrowRight className={`w-full my-auto h-4 ${isLoading ? "text-gray-200" : "text-white"}`} />
							</button>
						</div>
					</div>
				</div>
			</div>
		);
}

export default ChatLayout;
