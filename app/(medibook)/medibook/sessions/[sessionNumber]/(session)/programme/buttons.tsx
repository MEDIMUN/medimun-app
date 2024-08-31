"use client";

import Icon from "@/components/icon";
import { updateSearchParams } from "@/lib/searchParams";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";
import { Link } from "@nextui-org/link";

export function EditCommitteeButton({ committeeId, className }) {
	const router = useRouter();
	return (
		<Button className={className} isIconOnly as={Link} onPress={() => updateSearchParams({ edit: committeeId }, router)} fullWidth>
			<Icon icon="solar:pen-outline" width={20} />
		</Button>
	);
}
