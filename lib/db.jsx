import { MongoClient } from "mongodb";

export async function connectToDatabase() {
	const client = await MongoClient.connect(
		"mongodb+srv://nextberzan:nextberzan@cluster0.nixi35n.mongodb.net/auth?retryWrites=true&w=majority"
	);

	return client;
}
