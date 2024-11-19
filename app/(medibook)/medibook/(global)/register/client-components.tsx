"use client";

import { useSocket } from "@/contexts/socket";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Progress } from "@nextui-org/progress";
import { Scanner } from "@yudiel/react-qr-scanner";
import { changeRegMorning, deleteRegUser } from "./actions";
import { Button } from "@/components/button";
import { Text } from "@/components/text";
import { SearchBar } from "../../client-components";
import { Heading } from "@/components/heading";
import { Description, Field, Label } from "@/components/fieldset";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Avatar } from "@nextui-org/avatar";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { EllipsisVerticalIcon } from "@heroicons/react/16/solid";
import { toast } from "sonner";

export function RegisterQRCodeBox({ code }) {
	const router = useRouter();
	const socket = useSocket();

	const refreshEvery = 10; // in seconds
	const [progress, setProgress] = useState(0);

	// Progress bar update logic
	useEffect(() => {
		const progressInterval = setInterval(() => {
			setProgress((prev) => (prev >= 100 ? 0 : prev + 100 / (refreshEvery * 10)));
		}, 100); // Smooth progress update every 100ms

		return () => clearInterval(progressInterval); // Clean up interval on component unmount
	}, []);

	// Refresh logic triggered only when progress reaches 100
	useEffect(() => {
		if (progress >= 100) {
			router.refresh();
		}
	}, [progress, router]);

	return (
		<div className="border shadow-lg shadow-content1 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] relative z-[10000] animate-shimmer bg-[length:200%_100%] p-4 rounded-xl bg-content1/60 flex flex-col gap-1 text-center">
			<div className="flex gap-4 flex-col my-4">
				<div className="mx-auto bg-white p-2 rounded-lg">
					<QRCode size={undefined} value={code} className="mx-auto min-w-full rounded-md" />
					<div className="mt-2 bg-zinc-300 rounded-full h-3">
						{!!progress && <Progress aria-label="Code expiry time" size="md" maxValue={100} minValue={0} value={progress} />}
					</div>
				</div>
			</div>
			<i className="text-white mb-2">Do not share this code with other delegates.</i>
		</div>
	);
}

export function QRReader({ delegates }) {
	const socket = useSocket();
	const router = useRouter();

	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	async function handleScan(code) {
		if (code) {
			socket.emit("morning-register", code[0].rawValue);
		}
	}

	async function changeRegMorningHandler(id) {
		if (isLoading) return;
		setIsLoading(true);
		const res = await changeRegMorning(id);
		if (res?.ok) {
			toast.success(...(res?.message || []));
			router.refresh();
		} else {
			toast.error(...(res?.message || []));
		}
		setIsLoading(false);
	}

	return (
		<>
			<div className="border shadow-lg shadow-content1 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] relative z-[10000] animate-shimmer bg-[length:200%_100%] md:p-4 rounded-xl bg-content1/60 flex flex-col gap-1 text-center">
				{error ? (
					<div className="w-full  md:w-64 flex flex-col gap-2 p-4 mx-auto rounded-lg overflow-hidden">
						<Text className="!text-white !text-lg">We couldn&apos;t access your camera. Please make sure you have granted camera permissions.</Text>
						<Text className="text-zinc-200 !text-xs">
							<i>Check your settings and try again.</i>
						</Text>
						<Button onClick={() => window.location.reload()} className="mt-2" color="primary">
							Try Again
						</Button>
					</div>
				) : (
					<div className="w-full md:w-64 mx-auto rounded-lg overflow-hidden">
						<Scanner
							onError={(error) => setError(error)}
							components={{ audio: false, zoom: false, finder: false }}
							scanDelay={0}
							formats={["qr_code"]}
							onScan={(data) => handleScan(data)}
						/>
					</div>
				)}
			</div>
			<Field>
				<Label>Manually Register</Label>
				<Description>Search by Name, Surname, User ID or School.</Description>
				<SearchBar className="!w-[500px] flex-1" />
			</Field>
			{!!delegates.length && (
				<Table>
					<TableHead>
						<TableRow>
							<TableHeader>
								<span className="sr-only">Actions</span>
							</TableHeader>
							<TableHeader>
								<span className="sr-only">Profile Picture</span>
							</TableHeader>
							<TableHeader>User ID</TableHeader>
							<TableHeader>Official Name</TableHeader>
							<TableHeader>Official Surname</TableHeader>
							<TableHeader>Display Name</TableHeader>
							<TableHeader>School</TableHeader>
							<TableHeader>Committee</TableHeader>
						</TableRow>
					</TableHead>
					<TableBody>
						{delegates.map((delegate) => {
							return (
								<TableRow key={delegate.id}>
									<TableCell>
										<Dropdown>
											<DropdownButton plain>
												<EllipsisVerticalIcon />
											</DropdownButton>
											<DropdownMenu>
												{delegate.MorningPresent.length ? (
													<DropdownItem onClick={() => changeRegMorningHandler(delegate.id)}>Set as Absent</DropdownItem>
												) : (
													<DropdownItem onClick={() => changeRegMorningHandler(delegate.id)}>Set as Present</DropdownItem>
												)}
												<DropdownItem href={`/medibook/messenger/@${delegate.username || delegate.id}?new=true`}>Message</DropdownItem>
												<DropdownItem href={`/medibook/users/${delegate.username || delegate.id}`}>View Profile</DropdownItem>
											</DropdownMenu>
										</Dropdown>
									</TableCell>
									<TableCell>
										<Avatar src={`/api/users/${delegate.id}/avatar`} showFallback radius="md"></Avatar>
									</TableCell>
									<TableCell>{delegate.id}</TableCell>
									<TableCell>{delegate.officialName}</TableCell>
									<TableCell>{delegate.officialSurname}</TableCell>
									<TableCell>{delegate.displayName || "-"}</TableCell>
									<TableCell>{delegate.Student?.name}</TableCell>
									<TableCell>{delegate.delegate[0].committee.name}</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			)}
		</>
	);
}
