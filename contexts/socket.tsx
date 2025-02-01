"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import io, { Socket } from "socket.io-client";

// Define a TypeScript interface for the context type
interface SocketContextType {
	socket: Socket | null;
}

// Create the SocketContext with a null default
const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Custom hook to use the socket context in other components
export const useSocket = (): Socket => {
	const context = useContext(SocketContext);
	if (context === undefined) {
		throw new Error("useSocket must be used within a SocketProvider");
	}

	return context.socket;
};

// Define the props for the provider
interface SocketProviderProps {
	children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
	const [socket, setSocket] = useState<Socket | null>(null);

	const socketInitializer = async () => {
		// Fetch the endpoint to initialize the socket
		await fetch("/api/socket");

		// Create a socket instance with the provided configuration
		const socketInstance: Socket = io({
			transports: ["websocket"],
			addTrailingSlash: false,
		});

		socketInstance.on("connect", () => {
			console.log("Connected to MEDIMUN Servers.");
		});

		setSocket(socketInstance); // Store socket in state

		// Cleanup the socket connection on component unmount
		return () => {
			socketInstance.disconnect();
		};
	};

	useEffect(() => {
		socketInitializer();
	}, []);

	return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};
