"use client";

import { Button, ButtonGroup } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addDepartment } from "./actions";
import { Textarea } from "@nextui-org/react";
import { RadioGroup, Radio } from "@nextui-org/react";

export default function Drawer({ props }) {
	const { data: session, status } = useSession();
	if (!status == "loading" && (!session || session.isDisabled)) redirect("/medibook/signout");

	const [slug, setSlug] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();
	const { toast } = useToast();

	const searchParams = useSearchParams();

	async function addDepartmentReceiver(data) {
		data.append("sessionNumber", props.sessionNumber);
		const res = await addDepartment(data);
		if (res) toast({ title: res?.title, description: res?.description, variant: res?.variant });
		if (res?.ok) {
			setSlug("");
			router.push(`/medibook/sessions/${props.sessionNumber}`);
			router.refresh();
		}
	}

	useEffect(() => {
		setIsOpen(searchParams.get("add") == "department" && status === "authenticated" && authorize(session, [s.management]));
	}, [searchParams, status, session]);

	return (
		<Sheet open={isOpen} onOpenChange={() => router.push(`/medibook/sessions/${props.sessionNumber}`)}>
			<SheetContent className="overflow-y-auto" position="right" size="content">
				<SheetHeader>
					<SheetTitle>Add Department to Session</SheetTitle>
				</SheetHeader>
				<form action={addDepartmentReceiver} id="main" name="main" className="flex flex-col gap-4 pb-2 pt-4">
					<Input labelPlacement="outside" isRequired label="Department Name" placeholder="e.g. Information Technology" name="name" />
					<Input labelPlacement="outside" label="Short Name" placeholder="e.g. IT" name="shortName" />
					<Textarea labelPlacement="outside" label="Department Description" name="description" maxLength={200} minLength={10} />
					<Input
						labelPlacement="outside"
						label="Link Slug"
						placeholder="e.g. information-technology"
						value={slug}
						onChange={(e) =>
							setSlug(
								e.target.value
									.replace(" ", "-")
									.replace(/[^a-zA-Z-]/g, "")
									.toLowerCase()
									.replace(/-+/g, "-")
									.replace(/^-/, "")
									.trim()
									.slice(0, 32)
							)
						}
						name="slug"
						maxLength={30}
						minLength={2}
					/>
					<RadioGroup size="sm" isRequired name="departmentType" label="Department Type">
						<Radio value="MEDINEWS">MediNews</Radio>
						<Radio value="IT">Information Technology (IT)</Radio>
						<Radio value="SALES">Sales</Radio>
						<Radio value="">Other</Radio>
					</RadioGroup>
				</form>
				<SheetFooter>
					<Button color="primary" form="main" type="submit">
						Add
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
