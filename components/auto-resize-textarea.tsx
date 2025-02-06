"use client";

import { useState, type ChangeEvent } from "react";
import { Textarea } from "./ui/textarea";

interface AutoResizeTextareaProps {
	name: string;
	id: string;
	placeholder?: string;
	required?: boolean;
	className?: string;
}

export default function AutoResizeTextarea({
	name,
	id,
	placeholder = "Your request...",
	required = false,
	className = "",
	...props
}: AutoResizeTextareaProps) {
	const [value, setValue] = useState("");

	const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setValue(e.target.value);
	};

	return (
		<div className={`relative ${className}`}>
			<div className="invisible whitespace-pre-wrap break-words overflow-hidden h-0 p-3.5" aria-hidden="true">
				{value + " "}
			</div>
			<Textarea
				{...props}
				className="absolute top-0 left-0 w-full h-full resize-none overflow-hidden text-sm text-slate-600 bg-slate-100 border border-transparent hover:border-slate-200 rounded px-3.5 py-2.5 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
				name={name}
				id={id}
				rows={1}
				onInput={handleInput}
				placeholder={placeholder}
				required={required}
				value={value}
				onChange={(e) => setValue(e.target.value)}
			/>
		</div>
	);
}
