import { MongoClient } from "mongodb";

export async function connectToDatabase() {
	const client = await MongoClient.connect("mongodb+srv://medimun:VqbP5mz9oF4R5vsD@cluster0.zngjyi1.mongodb.net/?retryWrites=true&w=majority");

	return client;
}
