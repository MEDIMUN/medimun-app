import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";

const SocketHandler = (req, res) => {
	if (res?.socket?.server?.io) {
		console.log("Socket is already running");
	} else {
		console.log("Socket is initializing");

		// Initialize Socket.IO server
		const io = new Server(res.socket.server, {
			addTrailingSlash: false,
		});

		// Create Redis clients with ioredis for pub/sub
		const pubClient = new Redis(process.env.REDIS_URL);
		const subClient = pubClient.duplicate();

		pubClient.on("error", (error) => {
			console.error(error);
		});

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
