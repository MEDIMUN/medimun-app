import { auth } from "@/auth";
import SignaturePdfRenderer from "@/components/signature-pdf-renderer";
import { getOrdinal } from "@/lib/get-ordinal";
import { romanize } from "@/lib/romanize";
import { generateUserData, generateUserDataObject } from "@/lib/user";
import prisma from "@/prisma/client";
import { Page, Text, View, Document, Image, Font, renderToStream } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";

//2SjOiJcwtiUuGVYbgmqnV

Font.register({
	family: "MADEMirage",
	fonts: [
		{
			src: `${process.cwd()}/public/fonts/MADEMirageBlack.otf`,
			fontWeight: 900,
		},
		{
			src: `${process.cwd()}/public/fonts/MADEMirageBold.otf`,
			fontWeight: 700,
		},
		{
			src: `${process.cwd()}/public/fonts/MADEMirageRegular.otf`,
			fontWeight: 400,
		},
	],
});

Font.register({
	family: "GreatVibesRegular",
	fonts: [
		{
			src: `${process.cwd()}/public/fonts/GreatVibesRegular.ttf`,
			fontWeight: 400,
		},
	],
});

Font.register({
	family: "LibreBarcode128TextRegular",
	fonts: [
		{
			src: `${process.cwd()}/public/fonts/LibreBarcode128TextRegular.ttf`,
			fontWeight: 400,
		},
	],
});

Font.register({
	family: "Montserrat",
	fonts: [
		{
			src: `${process.cwd()}/public/fonts/Montserrat.ttf`,
		},
	],
});

const tw = createTw({
	theme: { extend: { colors: { primary: "#ae2d28" } } },
});

const cwd = process.cwd();

export default async function handler(req, res) {
	const selectedCertificate = await prisma.participationCertificate.findFirst({
		where: { id: req.query.certificateId as string },
		include: {
			user: {
				include: {
					...generateUserDataObject(),
				},
			},
			studentSignature: {
				select: {
					signature: true,
					officialName: true,
					officialSurname: true,
				},
			},
			teacherSignature: {
				select: {
					signature: true,
					officialName: true,
					officialSurname: true,
				},
			},
			session: {
				select: {
					number: true,
					numberInteger: true,
					secretaryGeneral: {
						take: 1,
						select: {
							user: {
								select: {
									officialName: true,
									officialSurname: true,
									signature: true,
								},
							},
						},
					},
				},
			},
		},
	});

	if (!selectedCertificate) {
		res.status(404).json({ error: "Certificate not found" });
		return;
	}

	const processedAwardedToUser = generateUserData(selectedCertificate.user);

	try {
		const stream = await renderToStream(
			<Certificate
				isVoid={selectedCertificate.isVoid}
				voidMessage={selectedCertificate.voidMessage}
				nameOverride={selectedCertificate.nameOverride}
				awardingStudent={selectedCertificate.studentSignature || selectedCertificate.session.secretaryGeneral[0].user}
				awardingTeacher={selectedCertificate.teacherSignature}
				selectedCertificate={selectedCertificate}
				processedAwardedToUser={processedAwardedToUser}
				specialMessage={selectedCertificate.specialMessage}
			/>
		);

		res.setHeader("Content-Type", "application/pdf");
		//page title
		if (req.query.download) res.setHeader("Content-Disposition", `attachment; filename="MEDIMUN-Certificate-${selectedCertificate.id}.pdf"`);
		stream.pipe(res);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

function Certificate({ processedAwardedToUser, selectedCertificate, awardingStudent, awardingTeacher, nameOverride, specialMessage, isVoid, voidMessage }) {
	const fullName = processedAwardedToUser.officialName + " " + processedAwardedToUser.officialSurname;
	const allRolesOfAwardedToUser = (processedAwardedToUser?.pastRoles || []).concat(processedAwardedToUser?.currentRoles || []);
	const selectedRolesOfAwardedToUser = allRolesOfAwardedToUser.filter((role) => role.sessionId === selectedCertificate.sessionId || (role.sessionId === undefined && !role.name.includes("Admin")));
	const awardingStudentFullName = awardingStudent.officialName + " " + awardingStudent.officialSurname;
	const awardingTeacherFullName = awardingTeacher.officialName + " " + awardingTeacher.officialSurname;

	return (
		<Document title={`${fullName} | MEDIMUN ${romanize(selectedCertificate.session.numberInteger)} Certificate (${selectedCertificate.id})`} author="MEDIMUN">
			{selectedRolesOfAwardedToUser.map((role, i) => (
				<CertificatePage
					key={i}
					isVoid={isVoid}
					voidMessage={voidMessage}
					awardingStudentFullName={awardingStudentFullName}
					awardingTeacherFullName={awardingTeacherFullName}
					awardingStudentSignature={awardingStudent.signature || ""}
					awardingTeacherSignature={awardingTeacher.signature || ""}
					name={nameOverride || fullName}
					roleIdentifier={role.roleIdentifier}
					entityName={role?.school || role?.committee || role?.department}
					certificateId={selectedCertificate.id}
					sessionNumber={selectedCertificate.session.numberInteger}
					specialMessage={specialMessage}
				/>
			))}
		</Document>
	);
}

function CertificatePage({
	name = "я тоже тебя люблю",
	roleIdentifier = "delegate",
	awardingStudentFullName = "",
	awardingStudentSignature = "",
	awardingTeacherFullName = "",
	awardingTeacherSignature = "",
	entityName = "",
	certificateId,
	specialMessage = "",
	sessionNumber,
	isVoid,
	voidMessage,
}: {
	name: string;
	roleIdentifier: string;
	awardingStudentFullName?: string;
	awardingStudentSignature?: string;
	awardingTeacherFullName?: string;
	awardingTeacherSignature?: string;
	entityName?: string;
	certificateId: string;
	specialMessage?: string;
	sessionNumber: number;
	isVoid: boolean;
	voidMessage?: string;
}) {
	const roleNameMap = {
		delegate: {
			name: `Delegate in ${entityName},`,
			preposition: "as a",
			afterText: "demonstrating outstanding dedication, professionalism, and excellence in research, public speaking, and negotiation.",
		},
		chair: {
			name: `Chair (Student Officer) of ${entityName},`,
			preposition: "as a",
			afterText: "demonstrating outstanding dedication, professionalism, and excellence in leading their committee.",
		},
		member: {
			name: `Member (Student Officer) in the ${entityName} Department,`,
			preposition: "as a",
			afterText: "demonstrating outstanding dedication, professionalism, and excellence in contributing to the organisation of the conference.",
		},
		manager: {
			name: `Manager (Student Officer) of the ${entityName} Department,`,
			preposition: "as a",
			afterText: "demonstrating outstanding dedication, professionalism, and excellence in leading their department.",
		},
		secretaryGeneral: {
			name: "Secretary-General (Student Officer),",
			preposition: "as the",
			afterText: "showing outstanding dedication, professionalism, and excellence in leading the conference.",
		},
		deputySecretaryGeneral: {
			name: "Deputy Secretary-General (Student Officer),",
			preposition: "as the",
			afterText: "showing outstanding dedication, professionalism, and excellence in leading the conference.",
		},
		presidentOfTheGeneralAssembly: {
			name: "President of the General Assembly (Student Officer),",
			preposition: "as the",
			afterText: "showing outstanding dedication, professionalism, and excellence in leading the conference.",
		},
		deputyPresidentOfTheGeneralAssembly: {
			name: "Vice President of the General Assembly (Student Officer),",
			preposition: "as the",
			afterText: "showing outstanding dedication, professionalism, and excellence in leading the conference.",
		},
		seniorDirector: {
			name: "Senior Director.",
			preposition: "as a",
			afterText: "",
		},
		director: {
			name: "Director.",
			preposition: "as a",
			afterText: "",
		},
		schoolDirector: {
			name: `School Director of ${entityName}.`,
			preposition: "as the",
			afterText: "",
		},
	};

	const verifyUrl = `https://www.medimun.org/verify/${certificateId}`;
	const encodedUrl = encodeURIComponent(verifyUrl);
	const sessionOrdinal = getOrdinal(sessionNumber);

	if (isVoid) {
		return (
			<Page size="A4" orientation="portrait" style={tw("bg-white h-full")}>
				<View fixed={true} style={tw("absolute w-full h-full")}>
					<Image alt="" src={`${cwd}/public/assets/pdf/certificates/participation-void-background.png`} style={tw("absolute min-w-full min-h-full h-full w-full")} />
				</View>
				<View style={tw("absolute left-[180px] top-[225.2px]")}>
					<Text style={tw("font-[Montserrat] text-black text-[12px]")}>{name}</Text>
				</View>
				<View style={tw("absolute left-[180px] top-[270.2px]")}>
					<Text style={tw("font-[Montserrat] text-black text-[12px]")}>
						{roleNameMap[roleIdentifier].name.includes("(Student Officer)") ? "Student Officer" : roleNameMap[roleIdentifier].name.replace(/[^a-zA-ZŞşÖöĞğÜüIıİi0-9() ]/g, "")}
					</Text>
				</View>
				<View style={tw("absolute left-[180px] top-[285.2px]")}>
					<Text style={tw("font-[Montserrat] text-black text-[12px]")}>{certificateId}</Text>
				</View>
				<View style={tw("absolute left-[180px] top-[300.2px]")}>
					<Text style={tw("font-[Montserrat] text-black text-[12px]")}>
						{sessionNumber.toString()}
						{getOrdinal(sessionNumber)} Annual Session
					</Text>
				</View>
				<View style={tw("absolute left-[51px] w-[494px] top-[350.2px]")}>
					<Text style={tw("font-[Montserrat] text-black text-[12px]")}>{voidMessage || "None"}</Text>
				</View>
			</Page>
		);
	}

	return (
		<Page size="A4" orientation="landscape" style={tw("bg-white h-full")}>
			<View fixed={true} style={tw("absolute w-full h-full")}>
				<Image alt="" src={`${cwd}/public/assets/pdf/certificates/participation-background.png`} style={tw("absolute min-w-full min-h-full h-full w-full")} />
			</View>
			<View style={tw("absolute left-[39px] top-[304px]")}>
				<Text style={tw("font-[GreatVibesRegular] text-white text-[62px]")}>{name}</Text>
			</View>
			<View style={tw("absolute left-[39px] top-[390px]")}>
				<Text style={tw("font-[MADEMirage] text-white max-w-[470px] text-[14px] text-left")}>
					has successfully participated in the{" "}
					<Text style={tw("font-[900]")}>
						{sessionNumber.toString()}
						{sessionOrdinal} Annual Session of MEDIMUN
					</Text>{" "}
					{roleNameMap[roleIdentifier].preposition} <Text style={tw("font-[900]")}>{roleNameMap[roleIdentifier].name}</Text> {roleNameMap[roleIdentifier].afterText}
					{specialMessage ? ` ${specialMessage}` : ""}
				</Text>
			</View>
			<View style={tw("absolute flex flex-row left-[39px] top-[481px] h-[80px] min-w-[190px]")}>
				{awardingStudentFullName && (
					<View>
						<View style={tw("flex flex-row bottom-[34px] absolute")}>
							<SignaturePdfRenderer padding={0} strokeColor="#FFFFFF" height={50} signature={awardingStudentSignature ? JSON.parse(awardingStudentSignature) : null} fixedWidth={90} />
						</View>
						<View style={tw("mt-auto")}>
							<Text style={tw("font-[MADEMirage] text-white text-[15.5px] font-[700]")}>{awardingStudentFullName}</Text>
							<Text style={tw("font-[MADEMirage] text-[#E8AE58] text-[12px] font-[400]")}>Secretary-General</Text>
						</View>
					</View>
				)}
				{awardingStudentFullName && awardingTeacherFullName && <View style={tw("h-[65px] mx-8 my-auto bg-[#FFFFFF50] rounded-full w-[2px]")}></View>}
				{awardingTeacherFullName && (
					<View>
						<View style={tw("flex flex-row bottom-[34px] absolute")}>
							<SignaturePdfRenderer padding={0} strokeColor="#FFFFFF" height={50} signature={awardingTeacherSignature ? JSON.parse(awardingTeacherSignature) : null} fixedWidth={90} />
						</View>
						<View style={tw("mt-auto")}>
							<Text style={tw("font-[MADEMirage] text-white text-[15.5px] font-[700]")}>{awardingTeacherFullName}</Text>
							<Text style={tw("font-[MADEMirage] text-[#E8AE58] text-[12px] font-[400]")}>Senior Director</Text>
						</View>
					</View>
				)}
			</View>
			<View style={tw("absolute top-[541px] left-[682px] w-[126px]")}>
				<Text style={tw("font-[LibreBarcode128TextRegular] text-white text-center text-[16px]")}>{certificateId}</Text>
			</View>
			<View style={tw("absolute top-[499px] left-[766px] w-[30px] h-[29.9px] m-1")}>
				<Image alt="" src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedUrl}`} style={tw("w-full h-full")} />
			</View>
		</Page>
	);
}
