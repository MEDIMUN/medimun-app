var Minio = require("minio");

const use_ssl = process.env.MINIO_USE_SSL === "true" ? true : false;
let minioClient: any;
exports.minio = function () {
	let client = (minioClient = new Minio.Client({
		endPoint: process.env.MINIO_END_POINT,
		port: parseInt(process.env.MINIO_PORT),
		useSSL: use_ssl,
		accessKey: process.env.MINIO_ACCESS_KEY,
		secretKey: process.env.MINIO_SECRET_KEY,
	}));
	return client;
};
