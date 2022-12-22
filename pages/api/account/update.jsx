export default function UpdateAccount(req, res) {
	if (req.method === "PATCH") {
		console.log(req.body);
		res.status(200).json({ message: "Success" });
	}
}
