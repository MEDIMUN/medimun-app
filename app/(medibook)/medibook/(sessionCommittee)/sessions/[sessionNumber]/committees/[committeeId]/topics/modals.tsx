"use client";

import { drawerProps } from "@/data/constants";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { editTopics } from "./actions";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/modal";
import { removeSearchParams } from "@/lib/searchParams";
import { Textarea } from "@nextui-org/input";
import { toast } from "sonner";
import { Button } from "@/components/button";

export function EditTopicsModal({ committee, params }) {
	const { data: session, status } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [isLoading, setIsLoading] = useState(false);

	async function editTopicsHandler(formData: FormData) {
		setIsLoading(true);
		formData.append("committeeId", committee.id);
		const res = await editTopics(formData);
		if (res?.ok) {
			toast.success(res?.message);
			removeSearchParams({ edit: "" }, router);
			router.refresh();
		} else {
			toast.error(res?.message);
		}
		setIsLoading(false);
	}

	return (
		<Modal
			{...(drawerProps as any)}
			isOpen={searchParams.has("edit") && status === "authenticated" && authorize(session, [s.management])}
			onOpenChange={() => removeSearchParams({ edit: "" }, router)}>
			<ModalContent>
				<ModalHeader>Edit Topics</ModalHeader>
				<ModalBody as="form" action={editTopicsHandler} name="main">
					<div>
						<Textarea
							disableAutosize
							classNames={{ inputWrapper: "rounded-b-none" }}
							label="Topic 1 Name"
							size="lg"
							maxLength={250}
							defaultValue={committee.topic1}
							placeholder="Topic 1"
							name="topic1"
						/>
						<Textarea
							classNames={{ inputWrapper: "rounded-t-none" }}
							label="Description"
							size="lg"
							maxLength={50000}
							defaultValue={committee.topic1description}
							name="topic1description"
						/>
					</div>
					<div>
						<Textarea
							disableAutosize
							classNames={{ inputWrapper: "rounded-b-none" }}
							label="Topic 2 Name"
							size="lg"
							maxLength={250}
							defaultValue={committee.topic2}
							placeholder="Topic 2"
							name="topic2"
							className="col-span-3"
						/>
						<Textarea
							classNames={{ inputWrapper: "rounded-t-none" }}
							label="Description"
							size="lg"
							maxLength={50000}
							defaultValue={committee.topic2description}
							name="topic2description"
						/>
					</div>
					<div>
						<Textarea
							disableAutosize
							classNames={{ inputWrapper: "rounded-b-none" }}
							label="Topic 3 Name"
							size="lg"
							maxLength={250}
							defaultValue={committee.topic3}
							placeholder="Topic 3"
							name="topic3"
						/>
						<Textarea
							classNames={{ inputWrapper: "rounded-t-none" }}
							label="Description"
							size="lg"
							maxLength={50000}
							defaultValue={committee.topic2description}
							name="topic3description"
						/>
					</div>
				</ModalBody>
				<ModalFooter>
					<Button form="main" type="submit" disabled={isLoading}>
						Save
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
