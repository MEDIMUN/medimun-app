"use client";

import Icon from "@/components/icon";
import { updateSearchParams } from "@/lib/searchParams";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import { useRouter } from "next/navigation";

export function EditCommitteeButton({ committeeId }) {
	const router = useRouter();
	return (
		<Button isIconOnly as={Link} onPress={() => updateSearchParams({ edit: committeeId }, router)} fullWidth className="-border-small my-auto w-auto border-black/10 bg-black/10 shadow-md light:text-black dark:border-white/20 dark:bg-white/10">
			<Icon icon="solar:pen-outline" width={20} />
		</Button>
	);
}
