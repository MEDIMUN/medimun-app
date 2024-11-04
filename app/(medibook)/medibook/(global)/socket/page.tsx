"use client";

import React, { useEffect, useState } from "react";
import { useSocket } from "@/contexts/socket";

const InputUpdater = () => {
	const socket = useSocket();
	const [input, setInput] = useState("");

	useEffect(() => {
		if (!socket) return;

		// Listen for input updates
		socket.on("update-input", (msg) => {
			setInput(msg);
		});

		// Cleanup event listener on component unmount
		return () => {
			socket.off("update-input");
		};
	}, [socket]);

	const onChangeHandler = (e) => {
		setInput(e.target.value);
		if (socket) {
			socket.emit("input-change", e.target.value);
		}
	};

	return <input placeholder="Type something" value={input} onChange={onChangeHandler} />;
};

export default InputUpdater;
