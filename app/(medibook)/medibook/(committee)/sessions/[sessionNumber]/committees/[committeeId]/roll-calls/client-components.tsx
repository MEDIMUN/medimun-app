"use client";
import { UserTooltip } from "@/app/(medibook)/medibook/client-components";
import { Badge } from "@/components/badge";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Listbox, ListboxOption } from "@/components/listbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { useSocket } from "@/contexts/socket";
import { countries } from "@/data/countries";
import { cn } from "@/lib/cn";
import { updateSearchParams } from "@/lib/search-params";
import { Avatar } from "@heroui/avatar";
import { Ellipsis } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function DateSelector({ conferenceDays, workshopDays, ...others }) {
	const searchParams = useSearchParams();
	const router = useRouter();

	function onSelectionChange(val) {
		updateSearchParams({ day: val }, router);
	}

	return (
		<Listbox {...others} onChange={(val) => onSelectionChange(val)} value={searchParams.get("day")}>
			{!!conferenceDays.length &&
				conferenceDays.map((day) => {
					return (
						<ListboxOption key={day.id} value={day.id}>
							{day.title}
						</ListboxOption>
					);
				})}
			{!!workshopDays.length &&
				workshopDays.map((day) => {
					return (
						<ListboxOption key={day.id} value={day.id}>
							{day.title}
						</ListboxOption>
					);
				})}
		</Listbox>
	);
}

function MorningRegSwitch({ value, onChange, isEditor }) {
	value = value || "ABSENT";

	if (!isEditor) {
		if (value === "PRESENT") return <Badge color="green">Present</Badge>;
		if (value === "ABSENT") return <Badge color="red">Absent</Badge>;
	}

	return (
		<div
			className={cn(
				"flex select-none rounded-md bg-zinc-100 cursor-pointer max-w-max overflow-hidden font-[montserrat]",
				isEditor && "cursor-pointer"
			)}>
			<div
				onClick={() => onChange("ABSENT")}
				className={`h-8 w-8 border-r flex text-center ${value == "ABSENT" ? "bg-red-600 hover:bg-red-700" : "hover:bg-zinc-200"}`}>
				<div className="m-auto">A</div>
			</div>
			<div
				onClick={() => onChange("PRESENT")}
				className={`h-8 w-8 flex text-center ${value == "PRESENT" ? "bg-green-600 hover:bg-green-700" : "hover:bg-zinc-200"}`}>
				<div className="m-auto">P</div>
			</div>
		</div>
	);
}

function RollCallSwitch({ value, onChange, isEditor }) {
	value = value || "ABSENT";

	if (!isEditor) {
		if (value === "PRESENT") return <Badge color="yellow">Present</Badge>;
		if (value === "ABSENT") return <Badge color="red">Absent</Badge>;
		if (value === "PRESENTANDVOTING") return <Badge color="green">Present and Voting</Badge>;
	}

	return (
		<div className={cn("flex select-none rounded-md bg-zinc-100 max-w-max overflow-hidden font-[montserrat]", isEditor && "cursor-pointer")}>
			<div
				onClick={() => onChange("ABSENT")}
				className={`h-8 w-8 border-r flex text-center ${value == "ABSENT" ? "bg-red-600 hover:bg-red-700" : "hover:bg-zinc-200"}`}>
				<div className="m-auto">A</div>
			</div>
			<div
				onClick={() => onChange("PRESENT")}
				className={`h-8 w-8 border-r flex text-center ${value == "PRESENT" ? "bg-yellow-600 hover:bg-yellow-700" : "hover:bg-zinc-200"}`}>
				<div className="m-auto">P</div>
			</div>
			<div
				onClick={() => onChange("PRESENTANDVOTING")}
				className={`h-8 w-8 flex text-center ${value == "PRESENTANDVOTING" ? "bg-green-600 Hover:bg-yellow-700" : "hover:bg-zinc-200"}`}>
				<div className="m-auto">PV</div>
			</div>
		</div>
	);
}

export function RollCallTable({ delegates, rollCallsInit, selectedCommittee, selectedDayId, isEditor }) {
	const socket = useSocket();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [isLoading, setIsLoading] = useState(true);
	const [rollCalls, setRollCalls] = useState(delegates);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		if (!socket) return;
		socket.on(`connect`, handleJoinRoom);
		return () => {
			socket.emit(`leave-room`, `committee-roll-calls-${selectedCommittee.id}`);
		};
	}, [socket, router]);

	const handleJoinRoom = async () => {
		await new Promise((resolve) => setTimeout(resolve, 250));
		try {
			socket.emit(`join:committee-roll-calls`, selectedCommittee.id, selectedDayId);
		} catch {}
	};

	async function handleOnChangeRollCall({ dayId, rollCallId, userId, type = "ROLLCALL", action }) {
		if (!isEditor) return;
		setRollCalls((prev) => {
			const selectedUser = prev?.find((user) => user.userId === userId);
			const selectedCommitteeRollCall = selectedUser?.CommitteeRollCall?.find((rc) => rc.rollCallId === rollCallId);

			const indexOfUser = prev.findIndex((user) => user.userId === userId);
			const newRollCalls = [...prev];

			if (!selectedCommitteeRollCall && action === "ABSENT") {
				newRollCalls[indexOfUser].user.CommitteeRollCall = newRollCalls[indexOfUser].user.CommitteeRollCall.filter(
					(rc) => rc.rollCallId !== rollCallId
				);
			}

			if (!selectedCommitteeRollCall && action !== "ABSENT") {
				const rollCallsIncludeTheRollCall = newRollCalls[indexOfUser].user.CommitteeRollCall?.filter((rc) => rc.rollCallId === rollCallId);
				if (!rollCallsIncludeTheRollCall.length) {
					newRollCalls[indexOfUser].user.CommitteeRollCall.push({ rollCallId, type: action });
				}

				if (!!rollCallsIncludeTheRollCall) {
					newRollCalls[indexOfUser].user.CommitteeRollCall = newRollCalls[indexOfUser].user.CommitteeRollCall.map((rc) => {
						if (rc.rollCallId === rollCallId) {
							rc.type = action;
						}
						return rc;
					});
				}
			}
			return newRollCalls;
		});
		if (socket) {
			socket.emit(`update:committee-roll-call`, { rollCallId, action: action, type: type, userId });
		}
	}

	async function handleMorningRegChange({ userId, type }) {
		if (!isEditor) return;
		setRollCalls((prev) => {
			const selectedUser = prev.find((user) => user.userId === userId);
			const selectedMorningReg = !!selectedUser?.user?.MorningPresent.length;

			const indexOfUser = prev.findIndex((user) => user.userId === userId);
			const newRollCalls = [...prev];

			if (selectedMorningReg && type === "ABSENT") {
				newRollCalls[indexOfUser].user.MorningPresent = [];
			}

			if (!selectedMorningReg && type === "PRESENT") {
				newRollCalls[indexOfUser].user.MorningPresent.push({ dayId: selectedDayId });
			}
			return newRollCalls;
		});
		socket.emit(`update:committee-roll-call`, { userId, dayId: selectedDayId, action: type, type: "MORNING" });
	}

	useEffect(() => {
		if (!isEditor) return;
		if (!socket) return;
		socket.on(`update:committee-roll-call`, ({ dayId, rollCallId, userId, type, action }) => {
			setRollCalls((prev) => {
				const selectedUser = prev.find((user) => user.userId === userId);
				const selectedCommitteeRollCall = selectedUser?.CommitteeRollCall?.find((rc) => rc.rollCallId === rollCallId);

				const indexOfUser = prev.findIndex((user) => user.userId === userId);
				const newRollCalls = [...prev];

				if (!selectedCommitteeRollCall && action === "ABSENT") {
					newRollCalls[indexOfUser].user.CommitteeRollCall = newRollCalls[indexOfUser].user.CommitteeRollCall.filter(
						(rc) => rc.rollCallId !== rollCallId
					);
				}

				if (!selectedCommitteeRollCall && action !== "ABSENT") {
					const rollCallsIncludeTheRollCall = newRollCalls[indexOfUser].user.CommitteeRollCall?.filter((rc) => rc.rollCallId === rollCallId);
					if (!rollCallsIncludeTheRollCall.length) {
						newRollCalls[indexOfUser].user.CommitteeRollCall.push({ rollCallId, type: action });
					}

					if (!!rollCallsIncludeTheRollCall) {
						newRollCalls[indexOfUser].user.CommitteeRollCall = newRollCalls[indexOfUser].user.CommitteeRollCall.map((rc) => {
							if (rc.rollCallId === rollCallId) {
								rc.type = action;
							}
							return rc;
						});
					}
				}
				return newRollCalls;
			});
		});
	}, [socket, delegates, rollCalls]);

	useEffect(() => {
		if (!isEditor) return;
		if (!socket) return;
		socket.on(`update:morning-register`, ({ dayId, userId, type, action }) => {
			setRollCalls((prev) => {
				const selectedUser = prev.find((user) => user.userId === userId);
				const selectedMorningReg = !!selectedUser?.user?.MorningPresent.length;

				const indexOfUser = prev.findIndex((user) => user.userId === userId);
				const newRollCalls = [...prev];

				if (selectedMorningReg && action === "ABSENT") {
					newRollCalls[indexOfUser].user.MorningPresent = [];
				}

				if (!selectedMorningReg && action === "PRESENT") {
					newRollCalls[indexOfUser].user.MorningPresent.push({ dayId });
				}
				return newRollCalls;
			});
		});
	}, [socket, delegates, rollCalls]);

	useEffect(() => {
		router.refresh();
		setRollCalls(delegates);
		handleJoinRoom();
	}, [searchParams?.get("day")]);

	/* 	useEffect(() => {
		if (!socket) return;
		socket.on(`connect`, () => {
			setIsLoading(false);
		});
	}, [socket, delegates, rollCalls]); */

	useEffect(() => {
		setIsMounted(true);
		setIsLoading(false);
	}, []);

	if (!isLoading && isMounted)
		return (
			<Table>
				<TableHead>
					<TableRow>
						<TableHeader>
							<span className="sr-only">Actions</span>
						</TableHeader>
						<TableHeader>
							<span className="sr-only">Profile Picture</span>
						</TableHeader>
						<TableHeader>Full Name</TableHeader>
						<TableHeader>Country</TableHeader>
						<TableHeader>
							<Badge>Morning Entry</Badge>
						</TableHeader>
						{rollCallsInit.map((rollCall, index) => {
							return <TableHeader key={index}>{rollCall.name || `Roll Call ${index + 1}`}</TableHeader>;
						})}
					</TableRow>
				</TableHead>
				<TableBody>
					{delegates.map((delegate) => {
						const selectedCountry = countries.find((country) => country.countryCode === delegate?.country);
						return (
							<TableRow key={delegate.id}>
								<TableCell>
									<Dropdown>
										<DropdownButton plain>
											<Ellipsis width={18} />
										</DropdownButton>
										<DropdownMenu>
											<DropdownItem href={`/medibook/users/${delegate.user.username || delegate.user.id}`}>View Profile</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								</TableCell>
								<TableCell>
									<UserTooltip userId={delegate.user.id}>
										<Avatar radius="md" showFallback src={`/api/users/${delegate.user.id}/avatar`} />
									</UserTooltip>
								</TableCell>
								<TableCell>{delegate.user.displayName || `${delegate.user.officialName} ${delegate.user.officialSurname}`}</TableCell>
								<TableCell>{selectedCountry?.countryNameEn || "Not Assigned"}</TableCell>
								<TableCell>
									{(() => {
										const selectedUser = rollCalls?.find((user) => user.id === delegate.id);
										const selectedMorningReg = !!selectedUser?.user?.MorningPresent.length;

										function changeHandler(val) {
											handleMorningRegChange({ userId: delegate.user.id, type: val });
										}
										return <MorningRegSwitch isEditor={isEditor} value={selectedMorningReg ? "PRESENT" : "ABSENT"} onChange={changeHandler} />;
									})()}
								</TableCell>
								{rollCallsInit.map((rollCall, index) => {
									const selectedUser = rollCalls?.find((user) => user.id === delegate.id);
									const selectedRollCall = selectedUser?.user?.CommitteeRollCall?.find((rc) => rc.rollCallId === rollCall.id);
									async function innerHandleOnChangeRollCall(type) {
										await handleOnChangeRollCall({
											dayId: selectedDayId,
											rollCallId: rollCall.id,
											userId: delegate?.user.id,
											type: "ROLLCALL",
											action: type,
										});
									}
									return (
										<TableCell key={index}>
											<RollCallSwitch isEditor={isEditor} onChange={innerHandleOnChangeRollCall} value={selectedRollCall?.type || "ABSENT"} />
										</TableCell>
									);
								})}
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		);
	return <i>Loading...</i>;
}
