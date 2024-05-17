"use client";

import { Input } from "@nextui-org/input";
import { useEffect, useState } from "react";

export function SlugInput({ value, separator = "-", ...props }: { value: string }) {
	const [slug, setSlug] = useState(value);

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const value = e.target.value;
		const regexSafeSeparator = separator.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"); // Escape regex special characters
		const slug = value
			.toLowerCase()
			.replace(new RegExp(`\\s+`, "g"), separator)
			.replace(new RegExp(`[^a-z0-9${regexSafeSeparator}]`, "g"), "")
			.replace(new RegExp(`${regexSafeSeparator}+`, "g"), separator);
		setSlug(slug);
	}

	function handleBlur() {
		const regexSafeSeparator = separator.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"); // Escape regex special characters
		const trimRegex = new RegExp(`^${regexSafeSeparator}+|${regexSafeSeparator}+$`, "g");
		setSlug(slug?.replace(trimRegex, ""));
	}

	return <Input minLength={2} maxLength={32} size="lg" {...props} value={slug} onChange={handleChange} onBlur={handleBlur} />;
}
