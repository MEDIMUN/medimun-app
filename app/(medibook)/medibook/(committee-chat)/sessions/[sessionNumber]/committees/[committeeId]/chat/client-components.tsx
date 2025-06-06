"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { loadMoreMessages } from "./actions";
import { cn } from "@/lib/cn";
import { Avatar } from "@heroui/avatar";
import { useSocket } from "@/contexts/socket";
import { Textarea } from "@heroui/input";
import { usePathname, useRouter } from "next/navigation";
import { Text } from "@/components/text";
import MediBookLogo from "@/public/assets/branding/logos/medichat-logo-red.svg";
import Image from "next/image";
import { Button as MButton } from "@/components/button";
import { useUpdateEffect } from "@/hooks/use-update-effect";
import { Badge } from "@/components/badge";
import { TopBar2 as TopBar, UserTooltip } from "@/app/(medibook)/medibook/client-components";
import { SelectedGroupProps } from "./page";
import { Session } from "next-auth";
import { ArrowRight, X } from "lucide-react";

export function ChatLayout({ selectedGroup, authSession }: { selectedGroup: SelectedGroupProps; authSession: Session }) {
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
	const [messages, setMessages] = useState(selectedGroup.CommitteeMessage);
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

	async function handleJoinGroup() {
		const isBrowser = typeof window !== "undefined";
		if (!isBrowser) return;
		if (!socket) return;
		await new Promise((resolve) => setTimeout(resolve, 1500));
		socket.emit("join:committee-chat", selectedGroup.id);
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
			socket.emit("leave-room", `committee-chat-${selectedGroup.id}`);
		};
	}, [socket, router, pathname]);

	useEffect(() => {
		if (!socket) return;
		socket.on("joined:committee-chat", async (groupId) => {
			if (groupId === selectedGroup.id) {
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
			socket.emit("update:committee-chat", {
				groupId: selectedGroup.id,
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
			socket.emit("update:committee-chat", {
				groupId: selectedGroup.id,
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
			socket.emit("update:committee-chat", {
				groupId: selectedGroup.id,
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
		socket.on("update:committee-chat", async (action, data) => {
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
		const moreMessages = await loadMoreMessages(selectedGroup.id, messages.length);
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
				<div className="flex gap-1 z-[99999] shadow-md md:shadow-none bg-white dark:bg-zinc-800 md:bg-zinc-100 p-2 !absolute top-0 left-0 right-0">
					<div className="w-full">
						<TopBar
							hideBackdrop
							className="max-w-5xl mx-auto z-[99999]"
							/* subheading={otherUserRole} */ title={"Committee Chat"}
							buttonText={selectedGroup.name}
							buttonHref={`/medibook/sessions/${selectedGroup.session.number}/committees/${selectedGroup.slug || selectedGroup.id}`}
							hideSearchBar></TopBar>
					</div>
				</div>
				<div className="w-full overflow-y-auto max-w-5xl mx-auto flex-col-reverse flex">
					{selectedMessageId && <div className="min-h-[50px]" />}

					<div className="flex-grow flex w-full mx-auto flex-col-reverse overflow-y-auto">
						<div className="min-h-32" />
						{messages.map((message, index) => {
							const isMyMessage = message?.user.id === authSession.user.id;
							let isAfterMyMessage, isBeforeMyMessage;
							const messageAfter = messages[index - 1] || {};

							if (index > 0) {
								isAfterMyMessage = messageAfter.user.id === authSession.user.id;
							}

							if (index < messages?.length - 1) {
								isBeforeMyMessage = messages[index + 1]?.user?.id === authSession.user.id;
							}

							//not time just date
							const isFirstMessageOfDay =
								index === messages.length - 1 ||
								new Date(message.createdAt).toLocaleDateString() !== new Date(messages[index + 1]?.createdAt).toLocaleDateString();

							const MessageDayDivider = () => (
								<Badge className="text-center text-xs mx-auto text-gray-500 mt-2">{new Date(message.createdAt).toLocaleDateString("en-GB")}</Badge>
							);

							if (isMyMessage && !message.replyTo) {
								return (
									<Fragment key={message.id}>
										<div
											onMouseDown={(e) => {
												e.preventDefault();
												setSelectedMessageId(message.id);
												setReplyToId("");
											}}
											className={cn("flex gap-2 justify-end group", !isBeforeMyMessage && "mt-2")}>
											<div className="flex gap-1">
												<div className="flex flex-col">
													<div className="flex gap-1">
														<span className="font-semibold">{message.user.displayName}</span>
													</div>
													<div
														className={cn(
															"max-w-[300px] md:max-w-[400px] mr-2 text-sm min-w-[35px] text-right",
															"bg-gray-100 dark:bg-zinc-600 p-2 hyphens-auto break-words overflow-hidden ml-auto rounded-lg",
															isAfterMyMessage && !messageAfter.replyTo && "rounded-br-none mb-[2px]",
															isBeforeMyMessage && "rounded-tr-none",
															messageAfter.replyTo && "mb-3",
															selectedMessageId === message.id && "bg-zinc-200 dark:bg-zinc-700 duration-200 shadow-md"
														)}>
														{message.markdown}
														<div className="mr-auto text-left text-xs text-zinc-500 mt-1">
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

							if (isMyMessage && message.replyTo) {
								const name = message.replyTo.user.displayName || `${message.replyTo.user.officialName} ${message.replyTo.user.officialSurname}`;
								return (
									<Fragment key={message.id}>
										<div
											onMouseDown={(e) => {
												e.preventDefault();
												setSelectedMessageId(message.id);
												setReplyToId("");
											}}
											className={cn("flex gap-2 justify-end group", !isBeforeMyMessage && "mt-2")}>
											<div className="flex gap-1">
												<div className="flex flex-col">
													<div className="flex flex-col gap-1 mb-1 max-w-[300px] mr-auto">
														<div className="flex gap-1">
															<Text className="!text-[9px] text-gray-500 mr-12 -mb-2">{name}</Text>
														</div>
														<div className="flex ml-auto gap-1">
															<div className="bg-gray-100/80 dark:bg-zinc-600/60 p-3 rounded-md overflow-hidden">
																<div className="text-xs w-full flex-1 my-auto line-clamp-2 break-words h-full truncate">
																	{message.replyTo.markdown}
																</div>
															</div>
															<Image alt="" src={`/assets/message-reply.svg`} width={40} height={40} />
														</div>
													</div>
													<div
														className={cn(
															"max-w-[300px] md:max-w-[400px] mr-2 text-sm min-w-[35px] text-right",
															"bg-gray-100 dark:bg-zinc-600 p-2 hyphens-auto break-words overflow-hidden ml-auto rounded-lg",
															isAfterMyMessage && !messageAfter.replyTo && "rounded-br-none mb-[2px]",
															isBeforeMyMessage && "rounded-tr-none",
															messageAfter.replyTo && "mb-3",
															selectedMessageId === message.id && "bg-zinc-200 duration-200 shadow-md"
														)}>
														{message.markdown}
														<div className="mr-auto text-left text-xs text-zinc-500 mt-1">
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

							if (!isMyMessage && !message.replyTo) {
								const isPreviousSamePersons = messages[index - 1]?.userId === message.userId;
								const isNextSamePersons = messages[index + 1]?.userId === message.userId;
								return (
									<Fragment key={message.id}>
										<div
											onMouseDown={(e) => {
												e.preventDefault();
												setSelectedMessageId(message.id);
												setReplyToId("");
											}}
											className={cn("flex gap-2", "justify-start group")}>
											<div className="flex gap-1 ml-2">
												{!isPreviousSamePersons ? (
													<UserTooltip userId={message.userId} className="w-8 mt-auto">
														<Avatar showFallback radius="sm" size="sm" className="w-8 mt-auto" src={`/api/users/${message.userId}/avatar`} />
													</UserTooltip>
												) : (
													<div className="w-8" />
												)}
												<div className="flex flex-col">
													<div
														className={cn(
															"max-w-[400px] break-words text-sm min-w-[35px] text-left",
															"bg-gray-100 dark:bg-zinc-600 p-2 rounded-lg",
															isPreviousSamePersons && !messageAfter.replyTo && "rounded-bl-none mb-[2px]",
															isNextSamePersons && "rounded-tl-none",
															selectedMessageId === message.id && "bg-zinc-200 duration-200 shadow-md"
														)}>
														{message.markdown}
														<div className="mr-auto text-right text-xs text-zinc-500 mt-1">
															{new Date(message.createdAt).toLocaleTimeString("en-GB").slice(0, 5)}
														</div>
													</div>
												</div>
											</div>
										</div>
										{!isNextSamePersons && <Text className="!text-[9px] text-gray-500 ml-12 -mb-1">{message.user.officialName}</Text>}
										{isFirstMessageOfDay && <MessageDayDivider />}
									</Fragment>
								);
							}

							if (!isMyMessage && message.replyTo) {
								const isPreviousSamePersons = messages[index - 1]?.userId === message.userId;
								const replyName = message.replyTo.user.displayName || `${message.replyTo.user.officialName} ${message.replyTo.user.officialSurname}`;
								return (
									<Fragment key={message.id}>
										<div
											onMouseDown={(e) => {
												e.preventDefault();
												setSelectedMessageId(message.id);
												setReplyToId("");
											}}
											className={cn("flex gap-2", "justify-start group")}>
											<div className="flex gap-1 ml-2">
												{!isPreviousSamePersons ? (
													<UserTooltip userId={message.userId} className="w-8 mt-auto">
														<Avatar showFallback radius="sm" size="sm" className="w-8 mt-auto" src={`/api/users/${message.userId}/avatar`} />
													</UserTooltip>
												) : (
													<div className="w-8" />
												)}
												<div className="flex flex-col">
													<div className="flex flex-col gap-1 mb-1 max-w-[300px] mr-auto">
														<div className="flex gap-1">
															<Text className="!text-[9px] text-gray-500 ml-12 -mb-2">{replyName}</Text>
														</div>
														<div className="flex mr-auto gap-1">
															<Image alt="" src={`/assets/message-reply.svg`} className="scale-x-[-1]" width={40} height={40} />
															<div className="bg-gray-100/80 dark:bg-zinc-600 p-3 rounded-md overflow-hidden">
																<div className="text-xs w-full flex-1 my-auto line-clamp-2 break-words h-full truncate">
																	{message.replyTo.markdown}
																</div>
															</div>
														</div>
													</div>
													<div className="flex gap-1">
														<span className="font-semibold">{message.user.displayName}</span>
													</div>
													<div
														className={cn(
															"max-w-[400px] break-words text-sm min-w-[35px] w-max text-left",
															"bg-gray-100 dark:bg-zinc-600 p-2 rounded-lg",
															isPreviousSamePersons && !messageAfter.replyTo && "rounded-bl-none mb-[2px]",
															messageAfter.replyTo && "mb-3",
															selectedMessageId === message.id && "bg-zinc-200 duration-200 shadow-md"
														)}>
														{message.markdown}
														<div className="mr-auto text-right text-xs text-zinc-500 mt-1">
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
						{(receivedFinalMessage || messages.length < 50) && (
							<div className="mx-auto p-10">
								<div className="p-12 text-center flex flex-col backdrop-blur-lg mt-6 shadow-md gap-6 rounded-2xl font-[montserrat] bg-zinc-100 dark:bg-zinc-800">
									<Image alt="MediChat Logo" className="mx-auto grayscale dark:grayscale-0" src={MediBookLogo} width={200} height={200} />
									<Text>
										Messages can be accessed by the management in case of a report.
										<br />
										Please be respectful in your messages.
										<br />
										<br />
										<i>Messages will be deleted at the start of the next Session of the conference.</i>
									</Text>
								</div>
							</div>
						)}
						{!receivedFinalMessage && messages.length > 49 && (
							<i onClick={handleLoadMoreMessages} className="z-[1000000] text-zinc-500 text-sm cursor-pointer text-center" ref={observerRef}>
								Click to load more messages...
							</i>
						)}
						<div className="min-h-[72px]" />
					</div>
				</div>
				<div className="flex flex-col gap-1 font-[montserrat] max-w-5xl mx-auto z-[9999999999] bg-white dark:bg-zinc-900 p-2 border-t !fixed bottom-0 left-0 right-0">
					{replyToId && messages.find((message) => message.id === replyToId) && (
						<div className="flex h-12 mb-1 w-full gap-1">
							<MButton
								onMouseDown={(e) => {
									e.preventDefault();
									setReplyToId("");
								}}
								plain
								className="aspect-square h-12 w-12">
								<X size={18} />
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
								<X size={18} />
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
									<X size={18} />
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
								className="w-full  !text-xl h-full  rounded-none rounded-tl-md"
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
