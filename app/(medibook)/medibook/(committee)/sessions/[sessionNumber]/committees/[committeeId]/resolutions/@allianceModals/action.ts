"use server";

import { z } from "zod";
import { auth } from "@/auth";
import prisma from "@/prisma/client";
import { authorize, authorizeChairCommittee, s } from "@/lib/authorize";

export async function inviteAllianceMember({ allianceId, delegateId }) {
	const authSession = await auth();

	const resolutionSchema = z.object({
		allianceId: z.string().trim().max(100),
		delegateId: z.string().trim().max(100),
	});

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	const { data, error } = resolutionSchema.safeParse({
		allianceId,
		delegateId,
	});

	if (error) return { ok: false, message: ["Invalid data."] };

	const selectedAlliance = await prisma.alliance.findUnique({
		where: {
			id: data.allianceId,
			mainSubmitter: { userId: authSession.user.id },
		},
		include: {
			topic: true,
			mainSubmitter: { include: { user: true } },
			committee: { include: { Topic: true } },
			AllianceMember: { include: { delegate: { include: { user: true } } } },
			AllianceMemberInvitation: true,
		},
	});

	if (!selectedAlliance) return { ok: false, message: ["Could not find alliance."] };

	if (selectedAlliance.AllianceMember.length + selectedAlliance.AllianceMemberInvitation.length >= 15) {
		return { ok: false, message: ["Too many alliance members."] };
	}

	const existingAllianceMember = selectedAlliance.AllianceMember.find((am) => am.delegateId === data.delegateId);

	if (existingAllianceMember) {
		return { ok: false, message: ["User is already an alliance member."] };
	}

	try {
		await prisma.allianceMemberInvitation.create({
			data: {
				delegateId: data.delegateId,
				allianceId: selectedAlliance.id,
			},
		});
	} catch (e) {
		return {
			ok: false,
			message: ["Error inviting alliance member."],
		};
	}

	return { ok: true, message: ["Invited alliance member."] };
}

export async function leaveAsAllianceMember({ allianceId }) {
	const authSession = await auth();

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	const selectedAlliance = await prisma.alliance.findUnique({
		where: {
			id: allianceId,
			AllianceMember: {
				some: {
					delegate: {
						userId: authSession.user.id,
					},
				},
			},
		},
		include: {
			topic: true,
			mainSubmitter: { include: { user: true } },
			committee: { include: { Topic: true } },
			AllianceMember: { include: { delegate: { include: { user: true } } } },
			AllianceMemberInvitation: true,
		},
	});

	if (!selectedAlliance) return { ok: false, message: ["Could not find alliance."] };

	try {
		await prisma.allianceMember.deleteMany({
			where: {
				delegate: {
					user: {
						id: authSession.user.id,
					},
				},
				alliance: {
					id: selectedAlliance.id,
				},
			},
		});
	} catch (e) {
		return {
			ok: false,
			message: ["Error leaving as alliance member."],
		};
	}

	return {
		ok: true,
		message: ["Left as alliance member."],
	};
}

export async function transferAllianceOwner({ allianceId, delegateId }) {
	const authSession = await auth();

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	const selectedAlliance = await prisma.alliance.findUnique({
		where: {
			id: allianceId,
			mainSubmitter: { userId: authSession.user.id },
		},
		include: {
			topic: true,
			mainSubmitter: { include: { user: true } },
			committee: { include: { Topic: true } },
			AllianceMember: { include: { delegate: { include: { user: true } } } },
			AllianceMemberInvitation: true,
		},
	});

	if (!selectedAlliance) return { ok: false, message: ["Could not find resolution."] };

	if (selectedAlliance.AllianceMember.length + selectedAlliance.AllianceMemberInvitation.length >= 15) {
		return { ok: false, message: ["Too many alliance members."] };
	}

	const selectedDelegate = await prisma.delegate.findUnique({
		where: {
			userId_committeeId: {
				userId: authSession.user.id,
				committeeId: selectedAlliance.committeeId,
			},
		},
	});

	if (!selectedDelegate) return { ok: false, message: ["Could not find delegate."] };

	try {
		await prisma.$transaction([
			prisma.alliance.update({
				where: {
					id: allianceId,
				},
				data: {
					mainSubmitter: {
						connect: {
							id: delegateId,
						},
					},
				},
			}),
			prisma.allianceMember.create({
				data: {
					allianceId: allianceId,
					delegateId: selectedDelegate.id,
				},
			}),
			prisma.allianceMember.deleteMany({
				where: {
					allianceId: allianceId,
					delegateId: delegateId,
				},
			}),
		]);
	} catch (e) {
		return {
			ok: false,
			message: ["Error transferring alliance owner."],
		};
	}

	return { ok: true, message: ["Transferred alliance owner."] };
}

export async function createAlliance({ topicId, committeeId }) {
	const authSession = await auth();

	const submitSchema = z.object({
		topicId: z.string().trim().max(100),
		committeeId: z.string().trim().max(100),
	});

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	const parsedFormData = {
		topicId,
	};

	const { data, error } = submitSchema.safeParse({
		topicId: parsedFormData.topicId,
		committeeId,
	});

	if (error) return { ok: false, message: ["Invalid data."] };

	const selectedTopic = await prisma.topic.findUnique({
		where: { id: data.topicId },
	});

	const selectedCommittee = await prisma.committee.findUnique({
		where: {
			id: data.committeeId,
			OR: [{ chair: { some: { userId: authSession.user.id } } }, { delegate: { some: { userId: authSession.user.id } } }],
		},
		include: { session: true },
	});

	if (!selectedCommittee) return { ok: false, message: ["Could not find committee."] };
	if (!selectedTopic) return { ok: false, message: ["Could not find topic."] };

	const isManagement = authorize(authSession, [s.management]);
	const isSessionCurrent = selectedCommittee.session.isCurrent;

	const isAllowedToAddAlliance = isManagement || (!isManagement && isSessionCurrent);
	if (!isAllowedToAddAlliance) return { ok: false, message: ["You can't add an alliance."] };

	try {
		await prisma.alliance.create({
			data: {
				topic: { connect: { id: selectedTopic.id } },
				mainSubmitter: {
					connect: {
						userId_committeeId: {
							userId: authSession.user.id,
							committeeId: selectedCommittee.id,
						},
					},
				},
				committee: {
					connect: { id: selectedCommittee.id },
				},
			},
		});
	} catch (e) {
		return {
			ok: false,
			message: ["Error creating alliance."],
		};
	}

	return { ok: true, message: ["Alliance created."] };
}

export async function deleteAlliance({ allianceId }) {
	const authSession = await auth();

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	const selectedAlliance = await prisma.alliance.findUnique({
		where: {
			id: allianceId,
			OR: [{ mainSubmitter: { userId: authSession.user.id } }, { committee: { chair: { some: { userId: authSession.user.id } } } }],
		},
	});

	if (!selectedAlliance) return { ok: false, message: ["Could not find alliance."] };

	try {
		await prisma.alliance.delete({
			where: {
				id: allianceId,
			},
		});
	} catch (e) {
		return {
			ok: false,
			message: ["Error deleting alliance."],
		};
	}

	return { ok: true, message: ["Alliance deleted."] };
}

export async function acceptAllianceInvitation({ allianceId }) {
	const authSession = await auth();

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	const selectedAllianceInvitation = await prisma.allianceMemberInvitation.findFirst({
		where: {
			allianceId,
			delegate: {
				userId: authSession.user.id,
			},
		},
	});

	if (!selectedAllianceInvitation) return { ok: false, message: ["Could not find alliance invitation."] };

	try {
		await prisma.$transaction([
			prisma.allianceMember.create({
				data: {
					allianceId: allianceId,
					delegateId: selectedAllianceInvitation.delegateId,
				},
			}),
			prisma.allianceMemberInvitation.delete({
				where: {
					id: selectedAllianceInvitation.id,
				},
			}),
		]);
	} catch (e) {
		return {
			ok: false,
			message: ["Error accepting alliance invitation."],
		};
	}

	return { ok: true, message: ["Accepted alliance invitation."] };
}

export async function rejectAllianceInvitation({ allianceId }) {
	const authSession = await auth();

	if (!authSession) return { ok: false, message: ["Unauthorized"] };

	const selectedAllianceInvitation = await prisma.allianceMemberInvitation.findFirst({
		where: {
			allianceId,
			delegate: {
				userId: authSession.user.id,
			},
		},
	});

	if (!selectedAllianceInvitation) return { ok: false, message: ["Could not find alliance invitation."] };

	try {
		await prisma.allianceMemberInvitation.delete({
			where: {
				id: selectedAllianceInvitation.id,
			},
		});
	} catch (e) {
		return {
			ok: false,
			message: ["Error rejecting alliance invitation."],
		};
	}

	return { ok: true, message: ["Rejected alliance invitation."] };
}

export async function removeDelegateFromAlliance({ allianceId, delegateId }) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: ["Unauthorized"] };
	try {
		await prisma.allianceMember.deleteMany({
			where: {
				allianceId,
				delegateId,
				alliance: {
					mainSubmitter: { userId: authSession.user.id },
				},
			},
		});
	} catch (e) {
		return {
			ok: false,
			message: ["Error removing delegate from alliance."],
		};
	}

	return { ok: true, message: ["Removed delegate from alliance."] };
}

export async function removeAllianceMemberInvitation({ allianceId, delegateId }) {
	const authSession = await auth();
	if (!authSession) return { ok: false, message: ["Unauthorized"] };
	try {
		await prisma.allianceMemberInvitation.deleteMany({
			where: {
				allianceId,
				delegateId,
				alliance: {
					mainSubmitter: { userId: authSession.user.id },
				},
			},
		});
	} catch (e) {
		return {
			ok: false,
			message: ["Error removing alliance member invitation."],
		};
	}

	return { ok: true, message: ["Removed alliance member invitation."] };
}
