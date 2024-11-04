import { hash, compare } from "bcryptjs";

export async function hashPassword(password: String): Promise<string> {
	const hashedPassword = await hash(password, 12);
	return hashedPassword;
}

export async function verifyPassword(password: String, hashedPassword: String): Promise<Boolean> {
	try {
		const isValid = await compare(password, hashedPassword);
		return isValid;
	} catch (error) {
		return false;
	}
}
