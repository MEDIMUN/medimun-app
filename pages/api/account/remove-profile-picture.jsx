import { getSession } from "next-auth/react";
import prisma from "../../../client";
var Minio = require("minio");

export default async function handler(req, res) {
	if (req.method !== "DELETE") {
		return;
	}
	const session = await getSession({ req: req });
	if (!session) {
		res.status(401).json({ message: "Not authenticated" });
		return;
	}

	const user = await prisma.user.findFirst({
		where: {
			userNumber: await session.user.userNumber,
		},
	});

	var minioClient = new Minio.Client({
		endPoint: "storage-s3.manage.beoz.org",
		useSSL: false,
		accessKey: "admin",
		secretKey: "BPbpMinio2006!",
	});

	minioClient.removeObject("profile-pictures", `${user.userNumber}`, function (err, etag) {
		if (err) {
			res
				.status(500)
				.json({ title: "Error", description: "An error occured while removing the profile picture", status: "error", duration: 5000, isClosable: true });
			return console.log(err, etag);
		}
	});
	res.status(200).json({ title: "Success", description: "Profile picture has been removed", status: "success", duration: 5000, isClosable: true });
}
