"use client";

import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const Home = () => {
	const [input, setInput] = useState("");
	const socketRef = useRef(null); // useRef to persist socket between renders

	const socketInitializer = async () => {
		await fetch("/api/socket"); // Ensure that the server has started the socket

		// Initialize the socket connection
		socketRef.current = io({ transports: ["websocket"], path: "/api/socket" });

		// Handle connection event
		socketRef.current.on("connect", () => {
			console.log("connected");
		});

		// Listen for updates to input from the server
		socketRef.current.on("update-input", (msg) => {
			setInput(msg);
		});
	};

	useEffect(() => {
		// Initialize the socket connection on component mount
		socketInitializer();

		// Cleanup the socket connection when the component unmounts
		return () => {
			if (socketRef.current) {
				socketRef.current.disconnect();
			}
		};
	}, []);

	const onChangeHandler = (e) => {
		setInput(e.target.value);
		// Emit the input change to the server
		if (socketRef.current) {
			socketRef.current.emit("input-change", e.target.value);
		}
	};

	return <input placeholder="Type something" value={input} onChange={onChangeHandler} />;
};

export default Home;
