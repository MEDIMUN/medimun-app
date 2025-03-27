"use client";

import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function VerifyForm() {
	const [cid, setCid] = useState("");
	const router = useRouter();

	return (
		<div className="font-[Montserrat] flex flex-col gap-4 bg-sidebar/80 max-w-lg mr-auto p-4 rounded-lg shadow-lg">
			<Field className="font-[Montserrat]">
				<Label>Certificate ID</Label>
				<Input maxLength={21} value={cid} onChange={(e) => setCid(e.target.value)} />
			</Field>
			<Button onClick={() => router.push(`/verify/${cid}`)} disabled={cid.length != 21}>
				Verify
			</Button>
		</div>
	);
}
