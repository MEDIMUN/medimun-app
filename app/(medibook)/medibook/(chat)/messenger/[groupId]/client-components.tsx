"use client";

import { Fragment, useEffect, useRef, useState } from "react";
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
      <div className="h-10 w-full">
        <Link
          href={`/medibook/users/${otherUser?.user?.username || otherUser?.user?.id}`}
          className="flex cursor-pointer gap-1"
        >
          <Avatar
            showFallback
            size="sm"
            radius="sm"
            className="my-auto h-6 w-6"
            src={`/api/users/${otherUser.user.id}/avatar`}
          />{" "}
          {fullName}
        </Link>
      </div>
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
      <div className="ml-2 flex gap-2">
        <AvatarGroup max={5} className="flex gap-1">
          {otherUsers.map((member) => (
            <UserTooltip userId={member.userId} key={member.userId}>
              <Avatar
                showFallback
                size="sm"
                radius="sm"
                className="my-auto h-6 w-6"
                src={`/api/users/${member.userId}/avatar`}
              />
            </UserTooltip>
          ))}
        </AvatarGroup>
        <Text className="line-clamp-1 truncate">{allNnames}</Text>
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
        className={cn("flex h-full w-screen flex-col md:w-full")}
        style={{
          ...(isIos && isMobile && viewportHeight !== undefined ? { height: `${viewportHeight + scrollY}px` } : {}),
          ...(!isIos && isMobile ? { height: `${viewportHeight}px` } : {}),
          transform: `translateY(-${-1 * scrollY}px)`,
        }}
      >
        <div className="z-99999 absolute! left-0 right-0 top-0 flex gap-1 bg-white p-2 shadow-md md:bg-zinc-100 md:shadow-none dark:bg-zinc-800">
          <div className="w-full">{groupName}</div>
        </div>
        <div className="mx-auto flex w-full max-w-5xl flex-col-reverse overflow-y-auto dark:bg-zinc-900">
          {selectedMessageId && <div className="min-h-[50px]" />}

          <div className="mx-auto flex w-full grow flex-col-reverse overflow-y-auto px-2">
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
                new Date(message.createdAt).toLocaleDateString() !==
                  new Date(messages[index + 1]?.createdAt).toLocaleDateString();

              const isLastMessageOfDay =
                index === 0 ||
                new Date(message.createdAt).toLocaleDateString() !==
                  new Date(messages[index - 1]?.createdAt).toLocaleDateString();

              const MessageDayDivider = () => (
                <Badge className="rounded-full! mx-auto mt-2 text-center text-xs text-gray-500 opacity-80">
                  {new Date(message.createdAt).toLocaleDateString("en-GB")}
                </Badge>
              );

              const messageHasUrl = message.markdown.match(/(https?:\/\/[^\s]+)/g);
              const fullUrl = messageHasUrl?.[0];

              if (isMyMessage) {
                const isReplyTo = !!message.replyTo;
                const name = isReplyTo
                  ? message.replyTo.user.displayName ||
                    `${message.replyTo.user.officialName} ${message.replyTo.user.officialSurname}`
                  : "";

                return (
                  <Fragment key={message.id}>
                    <div
                      onMouseDown={(e) => {
                        if (!messageHasUrl) e.preventDefault();
                        setSelectedMessageId(message.id);
                        setReplyToId("");
                      }}
                      className={cn("group flex flex-col justify-end gap-2", !isBeforeMyMessage && "mt-2")}
                    >
                      {isReplyTo && (
                        <div className="ml-auto flex flex-col gap-1">
                          <Text className="text-[9px]! -mb-2 mr-2 text-right text-gray-500">Replied to {name}</Text>
                          <div className="-mb-6 ml-auto line-clamp-2 min-w-[80px] max-w-[300px] truncate text-wrap rounded-xl bg-gray-200/80 px-2 py-3 pb-6 text-right text-xs dark:text-black">
                            {message.replyTo.markdown}
                          </div>
                        </div>
                      )}
                      <div className="ml-auto flex gap-1">
                        <div className="flex flex-col">
                          <div
                            className={cn(
                              "min-w-[60px] duration-200",
                              "min-w-[35px] max-w-[300px] text-right text-sm md:max-w-[400px]",
                              "ml-auto overflow-hidden hyphens-auto break-words rounded-xl bg-blue-500 px-2 py-1 text-white",
                              isAfterMyMessage &&
                                !messageAfter.replyTo &&
                                !isLastMessageOfDay &&
                                "mb-[2px] rounded-br-none",
                              isBeforeMyMessage && !isFirstMessageOfDay && !isReplyTo && "rounded-tr-none",
                              messageAfter.replyTo && "mb-3",
                              selectedMessageId === message.id && "mr-4 bg-blue-500/80",
                            )}
                          >
                            {messageHasUrl
                              ? message.markdown.split(fullUrl).map((part, index, array) => (
                                  <Fragment key={index + "mymessagelink"}>
                                    {part}
                                    {index < array.length - 1 && (
                                      <Link
                                        onClick={() => setSelectedMessageId("")}
                                        target="_blank"
                                        className="text-primary underline"
                                        href={fullUrl}
                                      >
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
                  ? message.replyTo.user.displayName ||
                    `${message.replyTo.user.officialName} ${message.replyTo.user.officialSurname}`
                  : "";
                const fullName =
                  message.user.displayName || `${message.user.officialName} ${message.user.officialSurname}`;
                return (
                  <Fragment key={message.id}>
                    <div
                      onMouseDown={(e) => {
                        if (!messageHasUrl) e.preventDefault();
                        setSelectedMessageId(message.id);
                        setReplyToId("");
                      }}
                      className={cn("group flex flex-col justify-start gap-2")}
                    >
                      {!isNextSamePersons && (
                        <Text className="text-[9px]! -mb-2 ml-11 text-left text-gray-500">{fullName}</Text>
                      )}

                      {isReplyTo && (
                        <div className="ml-9 mr-auto flex flex-col gap-1">
                          <Text className="text-[9px]! -mb-2 ml-2 text-left text-gray-500">
                            {fullName == name ? `${fullName} replied to themselves` : `${fullName} Replied to ${name}`}
                          </Text>
                          <div className="-mb-6 mr-auto line-clamp-2 min-w-[80px] max-w-[300px] truncate text-wrap rounded-xl bg-gray-200/80 px-2 py-3 pb-6 text-left text-xs dark:bg-gray-600/80">
                            {message.replyTo.markdown}
                          </div>
                        </div>
                      )}
                      <div className="mr-auto flex gap-1">
                        {!isPreviousSamePersons || isLastMessageOfDay ? (
                          <Avatar
                            showFallback
                            radius="sm"
                            size="sm"
                            className="mt-auto w-8 rounded-xl"
                            src={`/api/users/${message.userId}/avatar`}
                          />
                        ) : (
                          <div className="w-8" />
                        )}
                        <div className="flex flex-col">
                          <div
                            className={cn(
                              "min-w-[60px] duration-200",
                              "max-w-[300px] text-left text-sm md:max-w-[400px]",
                              "mr-auto overflow-hidden hyphens-auto break-words rounded-xl bg-gray-100 px-2 py-1 text-zinc-900 dark:bg-zinc-600 dark:text-white",
                              isPreviousSamePersons &&
                                !messageAfter.replyTo &&
                                !isLastMessageOfDay &&
                                "mb-[2px] rounded-bl-none",
                              isNextSamePersons && !isFirstMessageOfDay && !isReplyTo && "rounded-tl-none",
                              selectedMessageId === message.id && "ml-4 bg-gray-100/80",
                            )}
                          >
                            {messageHasUrl
                              ? message.markdown.split(fullUrl).map((part, index, array) => (
                                  <Fragment key={index + "yourmessagelink"}>
                                    {part}
                                    {index < array.length - 1 && (
                                      <Link
                                        onClick={() => setSelectedMessageId("")}
                                        target="_blank"
                                        className="text-primary underline"
                                        href={fullUrl}
                                      >
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
              <i
                onClick={handleLoadMoreMessages}
                className="z-1000000 cursor-pointer text-center text-sm text-zinc-500"
                ref={observerRef}
              >
                Click to load more messages...
              </i>
            )}
            <div className="min-h-[72px]" />
          </div>
        </div>
        <div className="z-9999999999 fixed! bottom-0 left-0 right-0 mx-auto flex max-w-5xl flex-col gap-1 border-t bg-white p-2 font-[montserrat] dark:bg-zinc-900">
          {replyToId && messages.find((message) => message.id === replyToId) && (
            <div className="mb-1 flex h-12 w-full gap-1">
              <MButton
                onMouseDown={(e) => {
                  e.preventDefault();
                  setReplyToId("");
                }}
                plain
                className="aspect-square h-12 w-12"
              >
                <X size={16} />
              </MButton>
              <div className="overflow-hidden rounded-lg bg-gray-100 p-2">
                <div className="flex gap-1 text-xs">
                  <span className="font-semibold">
                    {messages.find((message) => message.id === replyToId).displayName ||
                      `${messages.find((message) => message.id === replyToId).user.officialName} ${messages.find((message) => message.id === replyToId).user.officialSurname}`}
                  </span>
                </div>
                <div className="line-clamp-1 w-full flex-1 truncate text-sm">
                  {messages.find((message) => message.id === replyToId).markdown}
                </div>
              </div>
            </div>
          )}
          {editId && messages.find((message) => message.id === editId) && (
            <div className="mb-1 flex h-12 w-full gap-1">
              <MButton
                onMouseDown={(e) => {
                  e.preventDefault();
                  setEditId("");
                }}
                plain
                className="aspect-square h-12 w-12"
              >
                <X size={16} />
              </MButton>
              <div className="overflow-hidden rounded-lg bg-gray-100 p-2">
                <div className="flex gap-1 text-xs">
                  <span className="font-semibold">Editing</span>
                </div>
                <div className="line-clamp-1 w-full flex-1 truncate text-sm">
                  {messages.find((message) => message.id === editId).markdown}
                </div>
              </div>
            </div>
          )}
          {selectedMessageId && (
            <div className="mb-1 w-full overflow-x-scroll">
              <div className="flex gap-1">
                <MButton
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setReplyToId("");
                    setSelectedMessageId("");
                  }}
                  plain
                >
                  <X size={16} />
                </MButton>
                <MButton
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setReplyToId(selectedMessageId);
                    setSelectedMessageId("");
                  }}
                  plain
                >
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
                    plain
                  >
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
          <div className="flex w-full gap-1">
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
                className="text-xl! h-full w-full rounded-none rounded-tl-md"
              />
            </div>
            <div className="mt-auto h-[35px] w-[35px] md:h-[35px] md:w-[35px]">
              <button
                onMouseDown={handleSendMessage}
                type="submit"
                disabled={isLoading}
                className={`flex aspect-square h-full w-full rounded-full p-2 ${isLoading ? "cursor-not-allowed bg-gray-400" : "bg-zinc-800 hover:bg-zinc-600"} ${isLoading ? "cursor-wait bg-blue-500" : ""}`}
              >
                <ArrowRight className={`my-auto h-4 w-full ${isLoading ? "text-gray-200" : "text-white"}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
}

export default ChatLayout;
