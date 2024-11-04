import { auth } from "@/auth";
import { Socket } from "socket.io";

export async function socketAuth(socket: Socket) {
	return await auth({ headers: { cookie: socket.handshake.headers.cookie } } as any, { appendHeader: () => {} } as any);
}
