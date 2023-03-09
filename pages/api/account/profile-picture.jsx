import formidable from "formidable";
import { getSession } from "next-auth/react";
import prisma from "../../../prisma/client";
var Minio = require("minio");

export const config = {
	api: {
		bodyParser: false,
	},
};

export default async function (req, res) {
	const session = await getSession({ req: req });
	if (!session) {
		res.status(401).json({ message: "Not authenticated" });
		return;
	}

	var minioClient = new Minio.Client({
		endPoint: "storage-s3.manage.beoz.org",
		useSSL: false,
		accessKey: "admin",
		secretKey: "BPbpMinio2006!",
	});

	const user = await prisma.user.findFirst({
		where: {
			userNumber: await session.user.userNumber,
		},
	});

	const fs = require("fs");
	const form = new formidable.IncomingForm();
	const dir = `${process.cwd()}/tmp/profile-pictures`;

	minioClient.removeObject("profile-pictures", `${user.userNumber}`, function (err, etag) {
		if (err) return console.log(err, etag);
	});

	let filename = user.userNumber;

	form.keepExtensions = true;
	form.filename = filename;
	form.uploadDir = dir;
	form.on("file", function (name, file) {
		console.log(file.mimetype); // => string
		console.log(file.size); // => object

		if (file.size == 0) {
			minioClient.removeObject("profile-pictures", `${user.userNumber}`, function (err, etag) {
				if (err) return console.log(err, etag);
			});
			res
				.status(200)
				.json({
					title: "Success",
					description: "Profile picture has been removed",
					status: "success",
					duration: 5000,
					isClosable: true,
				});
			return;
		}

		if (
			file.mimetype !== "image/png" &&
			file.mimetype !== "image/jpeg" &&
			file.mimetype !== "image/jpg" &&
			file.mimetype !== "image/gif"
		) {
			console.log("ANANAIN AMI");
			fs.unlink(`${dir}/${user.userNumber}`, function (err) {
				if (err) {
					console.log("ERROR: " + err);
				}
			});
			res
				.status(500)
				.json({
					title: "Error",
					description: "Filetype is not supported",
					status: "error",
					duration: 5000,
					isClosable: true,
				});
			return;
		}

		if (file.size / (1024 * 1024) > 5) {
			fs.unlink(`${dir}/${user.userNumber}`, function (err) {
				if (err) {
					console.log("ERROR: " + err);
				}
			});
			res
				.status(500)
				.json({
					title: "Error",
					description: "File is not an image",
					status: "error",
					duration: 5000,
					isClosable: true,
				});
			return;
		}

		console.log(file.mimetype); // => string
		console.log(file.size); // => object
	});
	form.parse(req, (err, fields, files) => {
		fs.rename(`${dir}/${files.file.newFilename}`, `${dir}/${filename}`, function (err) {
			var file = `${dir}/${filename}`;
			var metaData = {
				"Content-Type": "application/octet-stream",
				"X-Amz-Meta-Testing": 1234,
				example: 5678,
			};
			const { size } = fs.statSync(file);
			if (size / (1024 * 1024) > 5) {
				fs.unlink(`${dir}/${user.userNumber}`, function (err) {
					if (err) {
						console.log("ERROR: " + err);
						return;
					}
				});
				res
					.status(500)
					.json({
						title: "Error",
						description: "File is too large",
						status: "error",
						duration: 1250,
						isClosable: true,
					});
				// file is larger than 5 MB
				return;
			}
			minioClient.fPutObject("profile-pictures", `${filename}`, file, metaData, function (err, etag) {
				if (err) {
					res
						.status(500)
						.json({
							title: "Error",
							description: "Please try again later",
							status: "error",
							duration: 1250,
							isClosable: true,
						});
					console.log(err, etag);
					return;
				}

				fs.unlink(`${dir}/${user.userNumber}`, function (err) {
					if (err) {
						res
							.status(500)
							.json({
								title: "Error",
								description: "Please try again later",
								status: "error",
								duration: 1250,
								isClosable: true,
							});
						console.log("ERROR: " + err);
						return;
					}
				});
				res
					.status(200)
					.json({
						title: "Success",
						description: "Profile picture updated",
						status: "success",
						duration: 1250,
						isClosable: true,
					});
			});
		});
	});

	// Instantiate the minio client with the endpoint
	// and access keys as shown below.

	// File that needs to be uploaded.

	// Make a bucket called europetrip.

	// Using fPutObject API upload your file to the bucket europetrip.
}
