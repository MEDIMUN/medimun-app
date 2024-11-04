import redis from "redis";
const client = redis.createClient();
client.connect();

module.exports = class CacheHandler {
	// Retrieve data from Redis, returning JSON or null if not found
	async get(key) {
		try {
			const data = await client.get(key);
			return data ? JSON.parse(data) : null;
		} catch (err) {
			console.error("Error in get:", err);
			return null;
		}
	}

	// Store data in Redis after JSON stringification
	async set(key, data, ctx = {}) {
		try {
			const cacheData = JSON.stringify({
				value: data,
				lastModified: Date.now(),
				...ctx,
			});
			await client.set(key, cacheData);
		} catch (err) {
			console.error("Error in set:", err);
		}
	}

	// Delete cached entries with matching tags
	async revalidateTag(tags) {
		tags = Array.isArray(tags) ? tags : [tags];

		try {
			const keys = await client.keys("*");
			for (const key of keys) {
				const value = JSON.parse(await client.get(key));
				if (value?.tags?.some((tag) => tags.includes(tag))) {
					await client.del(key);
				}
			}
		} catch (err) {
			console.error("Error during revalidateTag:", err);
		}
	}
};
