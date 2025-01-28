"use client";
import { Button } from "@/components/button";
import { useSearchParams, useRouter, ReadonlyURLSearchParams, useParams, usePathname } from "next/navigation";
import { s, authorize } from "@/lib/authorize";
import { useSession } from "next-auth/react";
import { addSession } from "./actions";
import { toast } from "sonner";
import { useFlushState } from "@/hooks/use-flush-state";
import { removeSearchParams } from "@/lib/search-params";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Text } from "@/components/text";

function onClose(searchParams: ReadonlyURLSearchParams, router: any[] | AppRouterInstance) {
	if (searchParams.has("return")) {
		router.push(searchParams.get("return"));
	}
	removeSearchParams({ "create-session": "", "create-committee": true, "create-department": true }, router);
}

const allowedPathnames = ["/medibook/sessions"];

export function ModalCreateSession() {
	const { data: authSession, status } = useSession();

	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const params = useParams();

	const pageInteger = parseInt(searchParams.get("page"));

	const [isLoading, setIsLoading] = useFlushState(false);

	async function addSessionHandler() {
		if (isLoading) return;
		setIsLoading(true);
		const res = await addSession();
		if (res?.ok) {
			toast.success(res?.message);
			onClose(searchParams, router);
		} else {
			toast.error(res?.message);
		}
		router.refresh();
		setIsLoading(false);
	}

	const isOpen =
		searchParams.has("create-session") &&
		status === "authenticated" &&
		authorize(authSession, [s.sd, s.admins]) &&
		allowedPathnames.includes(pathname);

	return (
		<Dialog onClose={() => onClose(searchParams, router)} open={isOpen as boolean}>
			<DialogTitle>Create New Session</DialogTitle>
			<DialogDescription>Are you sure you want to create a new session?</DialogDescription>
			<DialogBody>
				<Text>
					The session will only be visible to the management until it&apos;s made current and visible. Creating a session will not have any impact on
					the current session.
				</Text>
			</DialogBody>
			<DialogActions>
				<Button plain onClick={() => onClose(searchParams, router)}>
					Cancel
				</Button>
				<Button loading={isLoading} onClick={addSessionHandler} disabled={isLoading}>
					Create
				</Button>
			</DialogActions>
		</Dialog>
	);
}
