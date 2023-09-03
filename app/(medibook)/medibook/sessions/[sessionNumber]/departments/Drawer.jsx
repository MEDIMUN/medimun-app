"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addDepartment } from "./add-department.server";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
export default function Drawer({ props }) {
	const { data: session, status } = useSession();
	if (!status == "loading" && (!session || session.isDisabled)) redirect("/medibook/signout");

	const [slug, setSlug] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();
	const { toast } = useToast();

	const searchParams = useSearchParams();

	async function addDepartmentReceiver(data) {
		const res = await addDepartment(data);
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant,
			});
		if (res?.ok) {
			setSlug("");
			router.push(`/medibook/sessions/${props.sessionNumber}/departments#`);
			router.refresh();
		}
	}

	useEffect(() => {
		setIsOpen(searchParams.get("add") == "" && status === "authenticated" && authorize(session, [s.admins, s.sd, s.sec]));
	}, [searchParams, status, session]);

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	return (
		<Sheet open={isOpen} onOpenChange={() => router.push(`/medibook/sessions/${props.sessionNumber}/departments`)}>
			<SheetContent className="overflow-y-auto" position="right" size="content">
				<SheetHeader>
					<SheetTitle>Add Department to Session</SheetTitle>
					<SheetDescription>You can edit the department and assign members and managers later by editig the department</SheetDescription>
				</SheetHeader>
				<form action={addDepartmentReceiver} id="main" name="main" className="flex flex-col gap-4 pb-2 pt-4">
					<Input required type="hidden" value={props.sessionNumber} min={1} id="sessionNumber" name="sessionNumber" className="col-span-3" />
					<Label htmlFor="name">Department Name (Required)</Label>
					<Input required placeholder="Information Technology" id="name" name="name" className="col-span-3" />
					<Label htmlFor="description">Department Description (Required)</Label>
					<Textarea
						required
						placeholder="The IT dept. does awesome stuff such as making this app and doing a livestream."
						id="description"
						name="description"
						className="col-span-3"
						maxLength={200}
						minLength={10}
					/>
					<Label htmlFor="shortName">Short Name</Label>
					<Input placeholder="IT" id="shortName" name="shortName" className="col-span-3" />
					<Label htmlFor="slug">Link Slug</Label>
					<Input
						placeholder="information_technology"
						value={slug}
						onChange={(e) => setSlug(e.target.value.replace(" ", "").trim().toLowerCase())}
						id="slug"
						name="slug"
						maxLength={30}
						minLength={2}
						className="col-span-3"
					/>
					<Label>Department Type</Label>
					<RadioGroup name="departmentType" required defaultValue="isOther">
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="isMedinews" id="r1" />
							<Label htmlFor="isMedinews">MediNews</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="isIt" id="r2" />
							<Label htmlFor="isIt">Information Technology (IT)</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="isShop" id="r3" />
							<Label htmlFor="isShop">Sales</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="isOther" id="r3" />
							<Label htmlFor="isOther">Other</Label>
						</div>
					</RadioGroup>
				</form>
				<SheetFooter>
					<Button form="main" className="mt-4 flex w-auto" type="submit">
						Save
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
