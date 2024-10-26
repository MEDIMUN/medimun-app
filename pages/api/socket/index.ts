import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const SocketHandler = async (req, res) => {
	if (res?.socket?.server?.io) {
		console.log("Socket is already running");
	} else {
		console.log("Socket is initializing");

		// Initialize Socket.IO server
		const io = new Server(res.socket.server, {
			addTrailingSlash: false,
		});

		// Redis clients for pub/sub
		const pubClient = createClient({ url: process.env.REDIS_URL });
		const subClient = pubClient.duplicate();

		await pubClient.connect();
		await subClient.connect();

		// Set up the Redis adapter with the clients
		io.adapter(createAdapter(pubClient, subClient));

		// Attach the socket instance to the server
		res.socket.server.io = io;

		io.on("connection", (socket) => {
			socket.on("input-change", (msg) => {
				socket.broadcast.emit("update-input", msg);
			});
		});
	}
	res.end();
};

export default SocketHandler;
