// pages/api/socket.js
import { initializeSocket } from "@/socket/server";
import { NextApiResponse } from "next";

export default function handler(req, res: NextApiResponse) {
	// Ensure Socket.IO is only initialized once
	if (!res.socket.server.io) {
		console.log("Initializing Socket.IO...");
		const io = initializeSocket(res.socket.server); // Initialize and attach to the server
		res.socket.server.io = io; // Attach to Next.js server object for persistence
	} else {
		console.log("Socket.IO is already running");
	}

	res.end();
}
