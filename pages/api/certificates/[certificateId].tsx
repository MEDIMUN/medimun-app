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
				userId={selectedCertificate.user.id}
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

function Certificate({ processedAwardedToUser, selectedCertificate, awardingStudent, awardingTeacher, nameOverride, specialMessage, isVoid, voidMessage, userId }) {
	const fullName = processedAwardedToUser.officialName + " " + processedAwardedToUser.officialSurname;
	const allRolesOfAwardedToUser = (processedAwardedToUser?.pastRoles || []).concat(processedAwardedToUser?.currentRoles || []);
	const selectedRolesOfAwardedToUser = allRolesOfAwardedToUser.filter((role) => role.sessionId === selectedCertificate.sessionId || (role.sessionId === undefined && !role.name.includes("Admin")));
	const awardingStudentFullName = awardingStudent.officialName + " " + awardingStudent.officialSurname;
	const awardingTeacherFullName = awardingTeacher.officialName + " " + awardingTeacher.officialSurname;

	return (
		<Document title={`${fullName} | MEDIMUN ${romanize(selectedCertificate.session.numberInteger)} Certificate (${selectedCertificate.id})`} author="MEDIMUN">
			{selectedRolesOfAwardedToUser.map((role, i) => (
				<CertificatePage
					userId={userId}
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
	name = "",
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
	userId,
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
	userId: string;
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

	const validUserIds = ["708657517593"];

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
					<Text style={tw("font-black")}>
						{sessionNumber.toString()}
						{sessionOrdinal} Annual Session of MEDIMUN
					</Text>{" "}
					{roleNameMap[roleIdentifier].preposition} <Text style={tw("font-black")}>{roleNameMap[roleIdentifier].name}</Text> {roleNameMap[roleIdentifier].afterText}
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
							<Text style={tw("font-[MADEMirage] text-white text-[15.5px] font-bold")}>{awardingStudentFullName}</Text>
							<Text style={tw("font-[MADEMirage] text-[#E8AE58] text-[12px] font-semibold")}>Secretary-General</Text>
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
							<Text style={tw("font-[MADEMirage] text-white text-[15.5px] font-bold")}>{awardingTeacherFullName}</Text>
							<Text style={tw("font-[MADEMirage] text-[#E8AE58] text-[12px] font-semibold")}>Senior Director</Text>
						</View>
					</View>
				)}
				{validUserIds.includes(userId) && (
					<>
						<View style={tw("h-[65px] mx-8 my-auto bg-[#FFFFFF50] rounded-full w-[2px]")}></View>
						<View>
							<View style={tw("flex flex-row bottom-[34px] absolute")}>
								<SignaturePdfRenderer padding={0} strokeColor="#FFFFFF" height={50} signature={condeSign} fixedWidth={90} />
							</View>
							<View style={tw("mt-auto")}>
								<Text style={tw("font-[MADEMirage] text-white text-[15.5px] font-bold")}>Mohamed Kande</Text>
								<Text style={tw("font-[MADEMirage] text-[#E8AE58] text-[12px] font-semibold")}>Global Chairman, PwC</Text>
							</View>
						</View>
					</>
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

const condeSign = {
	paths: [
		[
			{
				x: 10,
				y: 56.960293255093944,
				width: 0.7927629791069989,
			},
			{
				x: 13.393930934109553,
				y: 52.9476905403546,
				width: 0.7927629791069989,
			},
			{
				x: 16.960867954485316,
				y: 48.4860514789627,
				width: 0.7927629791069989,
			},
			{
				x: 20.665666843080174,
				y: 43.69498825562317,
				width: 0.7927629791069989,
			},
			{
				x: 24.47318338184705,
				y: 38.69411305504102,
				width: 0.7927629791069989,
			},
			{
				x: 28.348273352738822,
				y: 33.60303806192115,
				width: 0.7927629791069989,
			},
			{
				x: 32.25579253770839,
				y: 28.54137546096851,
				width: 0.7927629791069989,
			},
			{
				x: 36.160596718708646,
				y: 23.62873743688807,
				width: 0.7927629791069989,
			},
			{
				x: 40.02754167769251,
				y: 18.984736174384757,
				width: 0.7927629791069989,
			},
			{
				x: 43.82148319661287,
				y: 14.728983858163534,
				width: 0.7927629791069989,
			},
			{
				x: 47.5072770574226,
				y: 10.981092672929346,
				width: 0.7927629791069989,
			},
			{
				x: 49.41871526858958,
				y: 10,
				width: 0.7927629791069989,
			},
			{
				x: 49.68833024609686,
				y: 12.097877216988623,
				width: 0.7927629791069989,
			},
			{
				x: 48.648709976184165,
				y: 16.600949662344533,
				width: 0.7927629791069989,
			},
			{
				x: 46.63244244509129,
				y: 22.83544267451707,
				width: 0.7927629791069989,
			},
			{
				x: 43.972115639057954,
				y: 30.127581591955547,
				width: 0.7927629791069989,
			},
			{
				x: 41.00031754432389,
				y: 37.803591753109295,
				width: 0.7927629791069989,
			},
			{
				x: 38.049636147128865,
				y: 45.189698496427624,
				width: 0.7927629791069989,
			},
			{
				x: 35.452659433712626,
				y: 51.6121271603599,
				width: 0.7927629791069989,
			},
			{
				x: 33.5419753903149,
				y: 56.39710308335539,
				width: 0.7927629791069989,
			},
			{
				x: 32.65017200317544,
				y: 58.87085160386346,
				width: 0.7927629791069989,
			},
			{
				x: 31.6930325482932,
				y: 61.386478753903155,
				width: 0.7927629791069989,
			},
			{
				x: 30.661381317808953,
				y: 64.19004715824295,
				width: 0.7927629791069989,
			},
			{
				x: 29.599865043662337,
				y: 67.2029725353268,
				width: 0.7927629791069989,
			},
			{
				x: 28.55313045779307,
				y: 70.34667060359882,
				width: 0.7927629791069989,
			},
			{
				x: 27.56582429214078,
				y: 73.54255708150305,
				width: 0.7927629791069989,
			},
			{
				x: 26.682593278645147,
				y: 76.71204768748348,
				width: 0.7927629791069989,
			},
			{
				x: 25.948084149245833,
				y: 79.77655813998412,
				width: 0.7927629791069989,
			},
			{
				x: 25.40694363588251,
				y: 82.65750415744907,
				width: 0.7927629791069989,
			},
			{
				x: 25.10381847049484,
				y: 85.27630145832231,
				width: 0.7927629791069989,
			},
			{
				x: 25.083355385022493,
				y: 87.5543657610479,
				width: 0.7927629791069989,
			},
			{
				x: 25.38411749139984,
				y: 89.29621677983594,
				width: 0.7927629791069989,
			},
			{
				x: 25.926816618152955,
				y: 90.72569150860019,
				width: 0.7927629791069989,
			},
			{
				x: 26.692447737496693,
				y: 91.82755575840167,
				width: 0.7927629791069989,
			},
			{
				x: 27.66200582164594,
				y: 92.58657534030168,
				width: 0.7927629791069989,
			},
			{
				x: 28.81648584281556,
				y: 92.98751606536122,
				width: 0.7927629791069989,
			},
			{
				x: 30.13688277322043,
				y: 93.01514374464145,
				width: 0.7927629791069989,
			},
			{
				x: 31.604191585075416,
				y: 92.65422418920349,
				width: 0.7927629791069989,
			},
			{
				x: 33.1994072505954,
				y: 91.8895232101085,
				width: 0.7927629791069989,
			},
			{
				x: 34.903524741995234,
				y: 90.70580661841758,
				width: 0.7927629791069989,
			},
			{
				x: 36.69753903148981,
				y: 89.08784022519185,
				width: 0.7927629791069989,
			},
			{
				x: 39.443438740407515,
				y: 86.32539910320192,
				width: 0.7927629791069989,
			},
			{
				x: 42.082095792537714,
				y: 83.4774353561789,
				width: 0.7927629791069989,
			},
			{
				x: 44.63145938078856,
				y: 80.55797650463083,
				width: 0.7927629791069989,
			},
			{
				x: 47.10947869806827,
				y: 77.58105006906591,
				width: 0.7927629791069989,
			},
			{
				x: 49.53410293728499,
				y: 74.56068356999208,
				width: 0.7927629791069989,
			},
			{
				x: 51.923281291346925,
				y: 71.51090452791746,
				width: 0.7927629791069989,
			},
			{
				x: 54.29496295316221,
				y: 68.44574046335009,
				width: 0.7927629791069989,
			},
			{
				x: 56.66709711563906,
				y: 65.37921889679811,
				width: 0.7927629791069989,
			},
			{
				x: 59.057632971685635,
				y: 62.325367348769525,
				width: 0.7927629791069989,
			},
			{
				x: 61.48451971421011,
				y: 59.29821333977243,
				width: 0.7927629791069989,
			},
			{
				x: 62.35015347975656,
				y: 58.22505774305373,
				width: 0.7927629791069989,
			},
			{
				x: 63.39889917967718,
				y: 56.97256105080711,
				width: 0.7927629791069989,
			},
			{
				x: 64.57102672664726,
				y: 55.617799209050006,
				width: 0.7927629791069989,
			},
			{
				x: 65.80680603334216,
				y: 54.23784816379995,
				width: 0.7927629791069989,
			},
			{
				x: 67.04650701243716,
				y: 52.90978386107436,
				width: 0.7927629791069989,
			},
			{
				x: 68.23039957660757,
				y: 51.71068224689072,
				width: 0.7927629791069989,
			},
			{
				x: 69.29875363852871,
				y: 50.71761926726648,
				width: 0.7927629791069989,
			},
			{
				x: 70.19183911087589,
				y: 50.00767086821911,
				width: 0.7927629791069989,
			},
			{
				x: 70.84992590632443,
				y: 49.657912995766075,
				width: 0.7927629791069989,
			},
			{
				x: 71.21328393754962,
				y: 49.74542159592485,
				width: 0.7927629791069989,
			},
			{
				x: 71.35712887007146,
				y: 50.29078544879599,
				width: 0.7927629791069989,
			},
			{
				x: 71.28709182323368,
				y: 51.091661341889406,
				width: 0.7927629791069989,
			},
			{
				x: 71.042691188145,
				y: 52.0943525300344,
				width: 0.7927629791069989,
			},
			{
				x: 70.66344535591429,
				y: 53.24516226806034,
				width: 0.7927629791069989,
			},
			{
				x: 70.18887271765017,
				y: 54.490393810796505,
				width: 0.7927629791069989,
			},
			{
				x: 69.65849166446151,
				y: 55.776350413072244,
				width: 0.7927629791069989,
			},
			{
				x: 69.111820587457,
				y: 57.04933532971686,
				width: 0.7927629791069989,
			},
			{
				x: 68.58837787774544,
				y: 58.25565181555968,
				width: 0.7927629791069989,
			},
			{
				x: 68.12768192643557,
				y: 59.341603125430005,
				width: 0.7927629791069989,
			},
			{
				x: 67.76925112463616,
				y: 60.25349251415719,
				width: 0.7927629791069989,
			},
			{
				x: 67.12132045514687,
				y: 61.82030119370204,
				width: 0.7927629791069989,
			},
			{
				x: 66.4682614448267,
				y: 63.43628161180209,
				width: 0.7927629791069989,
			},
			{
				x: 65.82304577930668,
				y: 65.09027208547234,
				width: 0.7927629791069989,
			},
			{
				x: 65.19864514421803,
				y: 66.77111093172797,
				width: 0.7927629791069989,
			},
			{
				x: 64.60803122519187,
				y: 68.46763646758401,
				width: 0.7927629791069989,
			},
			{
				x: 64.06417570785922,
				y: 70.16868701005558,
				width: 0.7927629791069989,
			},
			{
				x: 63.58005027785128,
				y: 71.86310087615772,
				width: 0.7927629791069989,
			},
			{
				x: 63.16862662079916,
				y: 73.53971638290554,
				width: 0.7927629791069989,
			},
			{
				x: 62.84287642233395,
				y: 75.18737184731413,
				width: 0.7927629791069989,
			},
			{
				x: 62.6157713680868,
				y: 76.79490558639853,
				width: 0.7927629791069989,
			},
			{
				x: 62.576755755490886,
				y: 80.75871082587987,
				width: 0.7927629791069989,
			},
			{
				x: 63.35043133103998,
				y: 83.53334432680606,
				width: 0.7927629791069989,
			},
			{
				x: 64.80225456469965,
				y: 85.24490294019581,
				width: 0.7927629791069989,
			},
			{
				x: 66.79768192643559,
				y: 86.01948351706802,
				width: 0.7927629791069989,
			},
			{
				x: 69.20216988621328,
				y: 85.98318290844139,
				width: 0.7927629791069989,
			},
			{
				x: 71.88117491399842,
				y: 85.26209796533475,
				width: 0.7927629791069989,
			},
			{
				x: 74.70015347975655,
				y: 83.98232553876687,
				width: 0.7927629791069989,
			},
			{
				x: 77.52456205345331,
				y: 82.26996247975654,
				width: 0.7927629791069989,
			},
			{
				x: 80.21985710505425,
				y: 80.25110563932259,
				width: 0.7927629791069989,
			},
			{
				x: 82.65149510452501,
				y: 78.05185186848374,
				width: 0.7927629791069989,
			},
			{
				x: 85.27421407779836,
				y: 75.55822127838054,
				width: 0.7927629791069989,
			},
			{
				x: 87.73539031489814,
				y: 72.99007891267533,
				width: 0.7927629791069989,
			},
			{
				x: 90.06956469965598,
				y: 70.36341312807622,
				width: 0.7927629791069989,
			},
			{
				x: 92.31127811590369,
				y: 67.69421228129136,
				width: 0.7927629791069989,
			},
			{
				x: 94.49507144747287,
				y: 64.99846472902885,
				width: 0.7927629791069989,
			},
			{
				x: 96.6554855781953,
				y: 62.29215882799683,
				width: 0.7927629791069989,
			},
			{
				x: 98.82706139190262,
				y: 59.59128293490342,
				width: 0.7927629791069989,
			},
			{
				x: 101.04433977242658,
				y: 56.91182540645674,
				width: 0.7927629791069989,
			},
			{
				x: 103.34186160359883,
				y: 54.269774599364915,
				width: 0.7927629791069989,
			},
			{
				x: 105.75416776925114,
				y: 51.68111887033607,
				width: 0.7927629791069989,
			},
			{
				x: 106.81633765546444,
				y: 50.57965684334481,
				width: 0.7927629791069989,
			},
			{
				x: 107.8501508335539,
				y: 49.5513490899709,
				width: 0.7927629791069989,
			},
			{
				x: 108.83931727970361,
				y: 48.616558139984114,
				width: 0.7927629791069989,
			},
			{
				x: 109.76754697009792,
				y: 47.795646523154275,
				width: 0.7927629791069989,
			},
			{
				x: 110.6185498809209,
				y: 47.10897676925113,
				width: 0.7927629791069989,
			},
			{
				x: 111.37603598835672,
				y: 46.57691140804446,
				width: 0.7927629791069989,
			},
			{
				x: 112.02371526858957,
				y: 46.21981296930405,
				width: 0.7927629791069989,
			},
			{
				x: 112.54529769780368,
				y: 46.05804398279969,
				width: 0.7927629791069989,
			},
			{
				x: 112.92449325218313,
				y: 46.11196697830114,
				width: 0.7927629791069989,
			},
			{
				x: 113.14501190791215,
				y: 46.4019444855782,
				width: 0.7927629791069989,
			},
			{
				x: 112.87466790156128,
				y: 48.30699740963218,
				width: 0.7927629791069989,
			},
			{
				x: 112.39406192114319,
				y: 50.27253458878012,
				width: 0.7927629791069989,
			},
			{
				x: 111.74633236305898,
				y: 52.28513183672929,
				width: 0.7927629791069989,
			},
			{
				x: 110.97461762370997,
				y: 54.3313649671871,
				width: 0.7927629791069989,
			},
			{
				x: 110.12205609949723,
				y: 56.39780979386081,
				width: 0.7927629791069989,
			},
			{
				x: 109.23178618682194,
				y: 58.4710421304578,
				width: 0.7927629791069989,
			},
			{
				x: 108.34694628208521,
				y: 60.53763779068537,
				width: 0.7927629791069989,
			},
			{
				x: 107.51067478168828,
				y: 62.584172588250865,
				width: 0.7927629791069989,
			},
			{
				x: 106.7661100820323,
				y: 64.59722233686162,
				width: 0.7927629791069989,
			},
			{
				x: 106.15639057951839,
				y: 66.56336285022493,
				width: 0.7927629791069989,
			},
			{
				x: 104.13652818205874,
				y: 73.13125911907915,
				width: 0.7927629791069989,
			},
			{
				x: 102.32964276263563,
				y: 80.09494263323631,
				width: 0.7927629791069989,
			},
			{
				x: 100.7571526858957,
				y: 87.30418317306166,
				width: 0.7927629791069989,
			},
			{
				x: 99.44047631648586,
				y: 94.60875051892036,
				width: 0.7927629791069989,
			},
			{
				x: 98.40103201905266,
				y: 101.85841445117758,
				width: 0.7927629791069989,
			},
			{
				x: 97.66023815824292,
				y: 108.90294475019847,
				width: 0.7927629791069989,
			},
			{
				x: 97.23951309870336,
				y: 115.59211119634823,
				width: 0.7927629791069989,
			},
			{
				x: 97.16027520508072,
				y: 121.77568356999207,
				width: 0.7927629791069989,
			},
			{
				x: 97.44394284202171,
				y: 127.30343165149512,
				width: 0.7927629791069989,
			},
			{
				x: 98.11193437417306,
				y: 132.02512522122254,
				width: 0.7927629791069989,
			},
			{
				x: 98.67783672929347,
				y: 134.25127764249802,
				width: 0.7927629791069989,
			},
			{
				x: 99.38416512304845,
				y: 136.22915803413605,
				width: 0.7927629791069989,
			},
			{
				x: 100.19185366499072,
				y: 137.8764112757343,
				width: 0.7927629791069989,
			},
			{
				x: 101.0618364646732,
				y: 139.11068224689075,
				width: 0.7927629791069989,
			},
			{
				x: 101.95504763164858,
				y: 139.84961582720297,
				width: 0.7927629791069989,
			},
			{
				x: 102.83242127546971,
				y: 140.01085689626888,
				width: 0.7927629791069989,
			},
			{
				x: 103.65489150568935,
				y: 139.51205033368615,
				width: 0.7927629791069989,
			},
			{
				x: 104.3833924318603,
				y: 138.27084101905268,
				width: 0.7927629791069989,
			},
			{
				x: 104.97885816353535,
				y: 136.20487383196613,
				width: 0.7927629791069989,
			},
			{
				x: 105.40222281026728,
				y: 133.23179365202435,
				width: 0.7927629791069989,
			},
			{
				x: 105.52246229161156,
				y: 128.7336605480286,
				width: 0.7927629791069989,
			},
			{
				x: 105.71857105054251,
				y: 124.30023503863461,
				width: 0.7927629791069989,
			},
			{
				x: 105.99250992326009,
				y: 119.92533294813441,
				width: 0.7927629791069989,
			},
			{
				x: 106.34623974596455,
				y: 115.60277010082034,
				width: 0.7927629791069989,
			},
			{
				x: 106.78172135485579,
				y: 111.3263623209844,
				width: 0.7927629791069989,
			},
			{
				x: 107.30091558613391,
				y: 107.08992543291876,
				width: 0.7927629791069989,
			},
			{
				x: 107.90578327599894,
				y: 102.88727526091559,
				width: 0.7927629791069989,
			},
			{
				x: 108.59828526065098,
				y: 98.712227629267,
				width: 0.7927629791069989,
			},
			{
				x: 109.38038237629003,
				y: 94.55859836226516,
				width: 0.7927629791069989,
			},
			{
				x: 110.25403545911618,
				y: 90.42020328420217,
				width: 0.7927629791069989,
			},
		],
		[
			{
				x: 110.25403545911618,
				y: 90.42020328420217,
				width: 0.7927629791069989,
			},
			{
				x: 110.40341095527918,
				y: 89.30373331860281,
				width: 0.7927629791069989,
			},
			{
				x: 110.58023815824293,
				y: 88.29103683805242,
				width: 0.7927629791069989,
			},
			{
				x: 110.7848187351151,
				y: 87.35767880682718,
				width: 0.7927629791069989,
			},
			{
				x: 111.01745435300344,
				y: 86.4792241892035,
				width: 0.7927629791069989,
			},
			{
				x: 111.27844667901562,
				y: 85.63123794945753,
				width: 0.7927629791069989,
			},
			{
				x: 111.56809738025933,
				y: 84.7892850518656,
				width: 0.7927629791069989,
			},
			{
				x: 111.88670812384228,
				y: 83.9289304607039,
				width: 0.7927629791069989,
			},
			{
				x: 112.2345805768722,
				y: 83.02573914024876,
				width: 0.7927629791069989,
			},
			{
				x: 112.61201640645673,
				y: 82.0552760547764,
				width: 0.7927629791069989,
			},
			{
				x: 113.01931727970361,
				y: 80.99310616856312,
				width: 0.7927629791069989,
			},
			{
				x: 112.69618152950515,
				y: 82.08785610240805,
				width: 0.7927629791069989,
			},
			{
				x: 112.38903413601484,
				y: 83.08124588806565,
				width: 0.7927629791069989,
			},
			{
				x: 112.09576342947867,
				y: 83.99861556258269,
				width: 0.7927629791069989,
			},
			{
				x: 111.8142577401429,
				y: 84.8653051630061,
				width: 0.7927629791069989,
			},
			{
				x: 111.5424053982535,
				y: 85.70665472638264,
				width: 0.7927629791069989,
			},
			{
				x: 111.27809473405665,
				y: 86.5480042897592,
				width: 0.7927629791069989,
			},
			{
				x: 111.01921407779835,
				y: 87.41469389018259,
				width: 0.7927629791069989,
			},
			{
				x: 110.76365175972482,
				y: 88.33206356469967,
				width: 0.7927629791069989,
			},
			{
				x: 110.50929611008205,
				y: 89.32545335035725,
				width: 0.7927629791069989,
			},
			{
				x: 110.25403545911618,
				y: 90.42020328420217,
				width: 0.7927629791069989,
			},
		],
		[
			{
				x: 110.25403545911618,
				y: 90.42020328420217,
				width: 0.7927629791069989,
			},
			{
				x: 110.17117756020112,
				y: 91.2037835964541,
				width: 0.7927629791069989,
			},
			{
				x: 110.10400635088652,
				y: 91.98585557316753,
				width: 0.7927629791069989,
			},
			{
				x: 110.05312516538766,
				y: 92.76641921434239,
				width: 0.7927629791069989,
			},
			{
				x: 110.01913733792009,
				y: 93.54547451997884,
				width: 0.7927629791069989,
			},
			{
				x: 110.00264620269913,
				y: 94.32302149007675,
				width: 0.7927629791069989,
			},
			{
				x: 110.00425509394022,
				y: 95.09906012463615,
				width: 0.7927629791069989,
			},
			{
				x: 110.02456734585869,
				y: 95.87359042365705,
				width: 0.7927629791069989,
			},
			{
				x: 110.06418629267002,
				y: 96.64661238713947,
				width: 0.7927629791069989,
			},
			{
				x: 110.12371526858956,
				y: 97.41812601508336,
				width: 0.7927629791069989,
			},
			{
				x: 110.20375760783276,
				y: 98.18813130748876,
				width: 0.7927629791069989,
			},
			{
				x: 111.17419555437948,
				y: 101.75305721381321,
				width: 0.7927629791069989,
			},
			{
				x: 112.47691982005826,
				y: 104.53198947102412,
				width: 0.7927629791069989,
			},
			{
				x: 114.05204948399046,
				y: 106.55192728526063,
				width: 0.7927629791069989,
			},
			{
				x: 115.8397036252977,
				y: 107.83986986266211,
				width: 0.7927629791069989,
			},
			{
				x: 117.78000132310136,
				y: 108.42281640936757,
				width: 0.7927629791069989,
			},
			{
				x: 119.8130616565229,
				y: 108.32776613151628,
				width: 0.7927629791069989,
			},
			{
				x: 121.87900370468377,
				y: 107.58171823524742,
				width: 0.7927629791069989,
			},
			{
				x: 123.91794654670548,
				y: 106.21167192670019,
				width: 0.7927629791069989,
			},
			{
				x: 125.87000926170946,
				y: 104.24462641201376,
				width: 0.7927629791069989,
			},
			{
				x: 127.67531092881715,
				y: 101.70758089732735,
				width: 0.7927629791069989,
			},
			{
				x: 129.0408322307489,
				y: 99.64060815321515,
				width: 0.7927629791069989,
			},
			{
				x: 130.41223604128078,
				y: 97.49791696507015,
				width: 0.7927629791069989,
			},
			{
				x: 131.79691320455146,
				y: 95.30333903440061,
				width: 0.7927629791069989,
			},
			{
				x: 133.20225456469967,
				y: 93.08070606271501,
				width: 0.7927629791069989,
			},
			{
				x: 134.635650965864,
				y: 90.85384975152157,
				width: 0.7927629791069989,
			},
			{
				x: 136.10449325218315,
				y: 88.64660180232868,
				width: 0.7927629791069989,
			},
			{
				x: 137.61617226779572,
				y: 86.48279391664462,
				width: 0.7927629791069989,
			},
			{
				x: 139.17807885684044,
				y: 84.38625779597778,
				width: 0.7927629791069989,
			},
			{
				x: 140.79760386345595,
				y: 82.38082514183647,
				width: 0.7927629791069989,
			},
			{
				x: 142.4821381317809,
				y: 80.49032765572903,
				width: 0.7927629791069989,
			},
			{
				x: 145.48827599894156,
				y: 77.56717338211168,
				width: 0.7927629791069989,
			},
			{
				x: 147.8520137602541,
				y: 75.75113739375499,
				width: 0.7927629791069989,
			},
			{
				x: 149.63685234188938,
				y: 74.92909452527124,
				width: 0.7927629791069989,
			},
			{
				x: 150.90629267001856,
				y: 74.98791961127283,
				width: 0.7927629791069989,
			},
			{
				x: 151.72383567081238,
				y: 75.81448748637206,
				width: 0.7927629791069989,
			},
			{
				x: 152.15298227044192,
				y: 77.29567298518128,
				width: 0.7927629791069989,
			},
			{
				x: 152.25723339507806,
				y: 79.31835094231278,
				width: 0.7927629791069989,
			},
			{
				x: 152.10008997089176,
				y: 81.76939619237895,
				width: 0.7927629791069989,
			},
			{
				x: 151.745052924054,
				y: 84.53568356999207,
				width: 0.7927629791069989,
			},
			{
				x: 151.25562318073565,
				y: 87.5040879097645,
				width: 0.7927629791069989,
			},
			{
				x: 150.9971698862133,
				y: 89.93409187906855,
				width: 0.7927629791069989,
			},
			{
				x: 150.8652659433713,
				y: 92.33136496718711,
				width: 0.7927629791069989,
			},
			{
				x: 150.89746890711825,
				y: 94.64205959539558,
				width: 0.7927629791069989,
			},
			{
				x: 151.13133633236308,
				y: 96.81232818496957,
				width: 0.7927629791069989,
			},
			{
				x: 151.6044257740143,
				y: 98.78832315718446,
				width: 0.7927629791069989,
			},
			{
				x: 152.35429478698072,
				y: 100.51619693331573,
				width: 0.7927629791069989,
			},
			{
				x: 153.41850092617096,
				y: 101.94210193463881,
				width: 0.7927629791069989,
			},
			{
				x: 154.8346017464938,
				y: 103.01219058242924,
				width: 0.7927629791069989,
			},
			{
				x: 156.6401548028579,
				y: 103.67261529796245,
				width: 0.7927629791069989,
			},
			{
				x: 158.872717650172,
				y: 103.8695285025139,
				width: 0.7927629791069989,
			},
			{
				x: 161.85834215400902,
				y: 102.85987383196615,
				width: 0.7927629791069989,
			},
			{
				x: 165.6531886742525,
				y: 100.42288124133373,
				width: 0.7927629791069989,
			},
			{
				x: 170.07097777189728,
				y: 96.97138216750463,
				width: 0.7927629791069989,
			},
			{
				x: 174.92543000793864,
				y: 92.91820804736705,
				width: 0.7927629791069989,
			},
			{
				x: 180.03026594337123,
				y: 88.67619031780895,
				width: 0.7927629791069989,
			},
			{
				x: 185.1992061391903,
				y: 84.65816041571846,
				width: 0.7927629791069989,
			},
			{
				x: 190.2459711563906,
				y: 81.27694977798359,
				width: 0.7927629791069989,
			},
			{
				x: 194.9842815559672,
				y: 78.94538984149246,
				width: 0.7927629791069989,
			},
			{
				x: 199.22785789891506,
				y: 78.0763120431331,
				width: 0.7927629791069989,
			},
			{
				x: 202.79042074622916,
				y: 79.08254781979359,
				width: 0.7927629791069989,
			},
			{
				x: 203.65927229425776,
				y: 79.72718529002383,
				width: 0.7927629791069989,
			},
			{
				x: 204.44697539031498,
				y: 80.49897544614979,
				width: 0.7927629791069989,
			},
			{
				x: 205.1628817147393,
				y: 81.37423742021697,
				width: 0.7927629791069989,
			},
			{
				x: 205.81634294786986,
				y: 82.32929034427099,
				width: 0.7927629791069989,
			},
			{
				x: 206.416710770045,
				y: 83.34045335035724,
				width: 0.7927629791069989,
			},
			{
				x: 206.97333686160366,
				y: 84.38404557052132,
				width: 0.7927629791069989,
			},
			{
				x: 207.49557290288436,
				y: 85.43638613680868,
				width: 0.7927629791069989,
			},
			{
				x: 207.99277057422603,
				y: 86.47379418126489,
				width: 0.7927629791069989,
			},
			{
				x: 208.4742815559672,
				y: 87.47258883593543,
				width: 0.7927629791069989,
			},
			{
				x: 208.9494575284467,
				y: 88.40908923286584,
				width: 0.7927629791069989,
			},
			{
				x: 210.32206800740937,
				y: 90.87287991823234,
				width: 0.7927629791069989,
			},
			{
				x: 211.89392961100828,
				y: 92.3301582987563,
				width: 0.7927629791069989,
			},
			{
				x: 213.62446811325742,
				y: 92.92979709208785,
				width: 0.7927629791069989,
			},
			{
				x: 215.4731092881715,
				y: 92.82066901587723,
				width: 0.7927629791069989,
			},
			{
				x: 217.3992789097645,
				y: 92.15164678777454,
				width: 0.7927629791069989,
			},
			{
				x: 219.36240275205083,
				y: 91.07160312543002,
				width: 0.7927629791069989,
			},
			{
				x: 221.32190658904472,
				y: 89.72941074649378,
				width: 0.7927629791069989,
			},
			{
				x: 223.23721619476052,
				y: 88.27394236861603,
				width: 0.7927629791069989,
			},
			{
				x: 225.06775734321252,
				y: 86.85407070944694,
				width: 0.7927629791069989,
			},
			{
				x: 226.77295580841493,
				y: 85.61866848663668,
				width: 0.7927629791069989,
			},
			{
				x: 228.64731410426043,
				y: 84.46529457819531,
				width: 0.7927629791069989,
			},
			{
				x: 230.46133897856586,
				y: 83.85793813469174,
				width: 0.7927629791069989,
			},
			{
				x: 232.22558878010048,
				y: 83.7091156948928,
				width: 0.7927629791069989,
			},
			{
				x: 233.95062185763433,
				y: 83.9313437975655,
				width: 0.7927629791069989,
			},
			{
				x: 235.6469965599365,
				y: 84.4371389814766,
				width: 0.7927629791069989,
			},
			{
				x: 237.3252712357767,
				y: 85.13901778539297,
				width: 0.7927629791069989,
			},
			{
				x: 238.9960042339243,
				y: 85.9494967480815,
				width: 0.7927629791069989,
			},
			{
				x: 240.669753903149,
				y: 86.78109240830908,
				width: 0.7927629791069989,
			},
			{
				x: 242.3570785922202,
				y: 87.54632130484256,
				width: 0.7927629791069989,
			},
			{
				x: 244.0685366499074,
				y: 88.1576999764488,
				width: 0.7927629791069989,
			},
			{
				x: 245.22638528711306,
				y: 88.3505909528976,
				width: 0.7927629791069989,
			},
			{
				x: 246.37789891505696,
				y: 88.4489092910823,
				width: 0.7927629791069989,
			},
			{
				x: 247.52428420216987,
				y: 88.47874919581898,
				width: 0.7927629791069989,
			},
			{
				x: 248.66674781688278,
				y: 88.4662048719238,
				width: 0.7927629791069989,
			},
			{
				x: 249.80649642762637,
				y: 88.43737052421275,
				width: 0.7927629791069989,
			},
			{
				x: 250.94473670283148,
				y: 88.418340357502,
				width: 0.7927629791069989,
			},
			{
				x: 252.08267531092878,
				y: 88.43520857660756,
				width: 0.7927629791069989,
			},
			{
				x: 253.22151892034933,
				y: 88.51406938634561,
				width: 0.7927629791069989,
			},
			{
				x: 254.3624741995237,
				y: 88.68101699153216,
				width: 0.7927629791069989,
			},
			{
				x: 255.50674781688278,
				y: 88.96214559698333,
				width: 0.7927629791069989,
			},
			{
				x: 257.0872320719767,
				y: 89.47671426594339,
				width: 0.7927629791069989,
			},
			{
				x: 258.6993913733793,
				y: 90.22190743874042,
				width: 0.7927629791069989,
			},
			{
				x: 260.33266737232066,
				y: 91.15383255120402,
				width: 0.7927629791069989,
			},
			{
				x: 261.9765017200318,
				y: 92.2285970391638,
				width: 0.7927629791069989,
			},
			{
				x: 263.6203360677428,
				y: 93.40230833844933,
				width: 0.7927629791069989,
			},
			{
				x: 265.25361206668435,
				y: 94.6310738848902,
				width: 0.7927629791069989,
			},
			{
				x: 266.8657713680868,
				y: 95.87100111431596,
				width: 0.7927629791069989,
			},
			{
				x: 268.4462556231808,
				y: 97.07819746255623,
				width: 0.7927629791069989,
			},
			{
				x: 269.98450648319664,
				y: 98.2087703654406,
				width: 0.7927629791069989,
			},
			{
				x: 271.4699655993649,
				y: 99.21882725879863,
				width: 0.7927629791069989,
			},
			{
				x: 272.8786001587722,
				y: 100.08285213310401,
				width: 0.7927629791069989,
			},
			{
				x: 274.2380629796243,
				y: 100.50795136570525,
				width: 0.7927629791069989,
			},
			{
				x: 275.54744906059796,
				y: 100.54691670044983,
				width: 0.7927629791069989,
			},
			{
				x: 276.8058534003705,
				y: 100.25253988118553,
				width: 0.7927629791069989,
			},
			{
				x: 278.01237099761846,
				y: 99.67761265175972,
				width: 0.7927629791069989,
			},
			{
				x: 279.16609685101884,
				y: 98.87492675602013,
				width: 0.7927629791069989,
			},
			{
				x: 280.2661259592485,
				y: 97.89727393781423,
				width: 0.7927629791069989,
			},
			{
				x: 281.3115533209844,
				y: 96.7974459409897,
				width: 0.7927629791069989,
			},
			{
				x: 282.3014739349034,
				y: 95.62823450939402,
				width: 0.7927629791069989,
			},
			{
				x: 283.2349827996825,
				y: 94.44243138687484,
				width: 0.7927629791069989,
			},
			{
				x: 284.29046573167506,
				y: 93.14815380021172,
				width: 0.7927629791069989,
			},
			{
				x: 285.3890870600689,
				y: 91.85312204577933,
				width: 0.7927629791069989,
			},
			{
				x: 286.5287351151098,
				y: 90.57015697565491,
				width: 0.7927629791069989,
			},
			{
				x: 287.7072982270442,
				y: 89.31207944191586,
				width: 0.7927629791069989,
			},
			{
				x: 288.922664726118,
				y: 88.09171029663932,
				width: 0.7927629791069989,
			},
			{
				x: 290.1727229425774,
				y: 86.92187039190264,
				width: 0.7927629791069989,
			},
			{
				x: 291.45536120666844,
				y: 85.81538057978301,
				width: 0.7927629791069989,
			},
			{
				x: 292.7684678486373,
				y: 84.78506171235777,
				width: 0.7927629791069989,
			},
			{
				x: 294.10993119872984,
				y: 83.84373464170416,
				width: 0.7927629791069989,
			},
			{
				x: 295.4776395871924,
				y: 83.00422021989945,
				width: 0.7927629791069989,
			},
			{
				x: 297.42990341360155,
				y: 81.88694580867956,
				width: 0.7927629791069989,
			},
			{
				x: 299.51776660492203,
				y: 81.0556518155597,
				width: 0.7927629791069989,
			},
			{
				x: 301.65359486636675,
				y: 80.53537661047896,
				width: 0.7927629791069989,
			},
			{
				x: 303.749753903149,
				y: 80.35115856337657,
				width: 0.7927629791069989,
			},
			{
				x: 305.7186094204816,
				y: 80.5280360441916,
				width: 0.7927629791069989,
			},
			{
				x: 307.47252712357766,
				y: 81.0910474228632,
				width: 0.7927629791069989,
			},
			{
				x: 308.9238727176501,
				y: 82.06523106933052,
				width: 0.7927629791069989,
			},
			{
				x: 309.98501190791217,
				y: 83.47562535353269,
				width: 0.7927629791069989,
			},
			{
				x: 310.5683103995766,
				y: 85.34726864540886,
				width: 0.7927629791069989,
			},
			{
				x: 310.58613389785654,
				y: 87.70519931489812,
				width: 0.7927629791069989,
			},
			{
				x: 310.23496824556764,
				y: 89.74057242947873,
				width: 0.7927629791069989,
			},
			{
				x: 309.3002275734322,
				y: 91.9969167004499,
				width: 0.7927629791069989,
			},
			{
				x: 308.00529637470225,
				y: 94.35582778803915,
				width: 0.7927629791069989,
			},
			{
				x: 306.57355914263036,
				y: 96.6989013524742,
				width: 0.7927629791069989,
			},
			{
				x: 305.22840037046836,
				y: 98.90773305398255,
				width: 0.7927629791069989,
			},
			{
				x: 304.1932045514687,
				y: 100.86391855279176,
				width: 0.7927629791069989,
			},
			{
				x: 303.6913561788833,
				y: 102.44905350912939,
				width: 0.7927629791069989,
			},
			{
				x: 303.94623974596453,
				y: 103.54473358322309,
				width: 0.7927629791069989,
			},
			{
				x: 305.18123974596455,
				y: 104.03255443530036,
				width: 0.7927629791069989,
			},
			{
				x: 307.6197406721355,
				y: 103.79411172558878,
				width: 0.7927629791069989,
			},
			{
				x: 308.9563522095793,
				y: 103.45370553347446,
				width: 0.7927629791069989,
			},
			{
				x: 310.39085472347193,
				y: 103.00756502011116,
				width: 0.7927629791069989,
			},
			{
				x: 311.90650568933575,
				y: 102.48118105609947,
				width: 0.7927629791069989,
			},
			{
				x: 313.48656258269386,
				y: 101.90004451204024,
				width: 0.7927629791069989,
			},
			{
				x: 315.1142828790685,
				y: 101.289646258534,
				width: 0.7927629791069989,
			},
			{
				x: 316.7729240539826,
				y: 100.67547716618155,
				width: 0.7927629791069989,
			},
			{
				x: 318.4457435829584,
				y: 100.0830281055835,
				width: 0.7927629791069989,
			},
			{
				x: 320.11599894151897,
				y: 99.53778994734057,
				width: 0.7927629791069989,
			},
			{
				x: 321.7669476051866,
				y: 99.06525356205346,
				width: 0.7927629791069989,
			},
			{
				x: 323.381847049484,
				y: 98.69090982032284,
				width: 0.7927629791069989,
			},
			{
				x: 324.66981476581105,
				y: 98.43434194522364,
				width: 0.7927629791069989,
			},
			{
				x: 325.9417941254301,
				y: 98.27340254326543,
				width: 0.7927629791069989,
			},
			{
				x: 327.20140513363316,
				y: 98.19361159327865,
				width: 0.7927629791069989,
			},
			{
				x: 328.45226779571317,
				y: 98.18048907409367,
				width: 0.7927629791069989,
			},
			{
				x: 329.69800211696213,
				y: 98.21955496454089,
				width: 0.7927629791069989,
			},
			{
				x: 330.9422281026727,
				y: 98.29632924345067,
				width: 0.7927629791069989,
			},
			{
				x: 332.1885657581371,
				y: 98.39633188965335,
				width: 0.7927629791069989,
			},
			{
				x: 333.4406350886478,
				y: 98.50508288197936,
				width: 0.7927629791069989,
			},
			{
				x: 334.7020560994972,
				y: 98.60810219925908,
				width: 0.7927629791069989,
			},
			{
				x: 335.9764487959778,
				y: 98.69090982032284,
				width: 0.7927629791069989,
			},
			{
				x: 339.25851151098175,
				y: 98.30465022783807,
				width: 0.7927629791069989,
			},
			{
				x: 341.47523683514163,
				y: 97.41988573987831,
				width: 0.7927629791069989,
			},
			{
				x: 342.81169753903146,
				y: 96.10826229452235,
				width: 0.7927629791069989,
			},
			{
				x: 343.4529663932257,
				y: 94.44142582984918,
				width: 0.7927629791069989,
			},
			{
				x: 343.5841161682986,
				y: 92.49102228393757,
				width: 0.7927629791069989,
			},
			{
				x: 343.39021963482406,
				y: 90.32869759486638,
				width: 0.7927629791069989,
			},
			{
				x: 343.05634956337656,
				y: 88.02609770071447,
				width: 0.7927629791069989,
			},
			{
				x: 342.7675787245303,
				y: 85.65486853956074,
				width: 0.7927629791069989,
			},
			{
				x: 342.70897988885946,
				y: 83.286656049484,
				width: 0.7927629791069989,
			},
			{
				x: 343.0656258269384,
				y: 80.99310616856312,
				width: 0.7927629791069989,
			},
			{
				x: 343.5972386874835,
				y: 79.03855469992062,
				width: 0.7927629791069989,
			},
			{
				x: 344.34107435829594,
				y: 77.04629484281558,
				width: 0.7927629791069989,
			},
			{
				x: 345.26500529240536,
				y: 75.03140995263296,
				width: 0.7927629791069989,
			},
			{
				x: 346.336903942842,
				y: 73.0089833847579,
				width: 0.7927629791069989,
			},
			{
				x: 347.52464276263566,
				y: 70.99409849457528,
				width: 0.7927629791069989,
			},
			{
				x: 348.79609420481614,
				y: 69.00183863747023,
				width: 0.7927629791069989,
			},
			{
				x: 350.1191307224134,
				y: 67.04728716882774,
				width: 0.7927629791069989,
			},
			{
				x: 351.46162476845734,
				y: 65.14552744403282,
				width: 0.7927629791069989,
			},
			{
				x: 352.79144879597783,
				y: 63.311642818470496,
				width: 0.7927629791069989,
			},
			{
				x: 354.0764752580048,
				y: 61.5607166475258,
				width: 0.7927629791069989,
			},
			{
				x: 356.48825350621854,
				y: 58.40384578221752,
				width: 0.7927629791069989,
			},
			{
				x: 358.90274675840186,
				y: 55.3228441944959,
				width: 0.7927629791069989,
			},
			{
				x: 361.3060783275999,
				y: 52.331739404869005,
				width: 0.7927629791069989,
			},
			{
				x: 363.68437152685897,
				y: 49.44455893384494,
				width: 0.7927629791069989,
			},
			{
				x: 366.0237496692247,
				y: 46.67533030193173,
				width: 0.7927629791069989,
			},
			{
				x: 368.3103360677428,
				y: 44.038081029637475,
				width: 0.7927629791069989,
			},
			{
				x: 370.53025403545905,
				y: 41.54683863747023,
				width: 0.7927629791069989,
			},
			{
				x: 372.66962688541946,
				y: 39.215630645938084,
				width: 0.7927629791069989,
			},
			{
				x: 374.7145779306695,
				y: 37.05848457554909,
				width: 0.7927629791069989,
			},
			{
				x: 376.6512304842551,
				y: 35.08942794681133,
				width: 0.7927629791069989,
			},
			{
				x: 378.8440486901297,
				y: 32.988917764223345,
				width: 0.7927629791069989,
			},
			{
				x: 380.87517332627687,
				y: 31.15161756311194,
				width: 0.7927629791069989,
			},
			{
				x: 382.7337443768192,
				y: 29.62202263852871,
				width: 0.7927629791069989,
			},
			{
				x: 384.4089018258799,
				y: 28.444628285525273,
				width: 0.7927629791069989,
			},
			{
				x: 385.8897856575814,
				y: 27.663929799153216,
				width: 0.7927629791069989,
			},
			{
				x: 387.16553585604663,
				y: 27.324422474464146,
				width: 0.7927629791069989,
			},
			{
				x: 388.2252924053983,
				y: 27.470601606509657,
				width: 0.7927629791069989,
			},
			{
				x: 389.0581952897593,
				y: 28.146962490341362,
				width: 0.7927629791069989,
			},
			{
				x: 389.6533844932522,
				y: 29.398000421010853,
				width: 0.7927629791069989,
			},
			{
				x: 390,
				y: 31.26821069356973,
				width: 0.7927629791069989,
			},
			{
				x: 389.34359751256943,
				y: 35.11245731436888,
				width: 0.7927629791069989,
			},
			{
				x: 387.41250066155084,
				y: 39.95506579809474,
				width: 0.7927629791069989,
			},
			{
				x: 384.5127507277057,
				y: 45.64806903175443,
				width: 0.7927629791069989,
			},
			{
				x: 380.95038899179684,
				y: 52.04349990235513,
				width: 0.7927629791069989,
			},
			{
				x: 377.0314567345859,
				y: 58.993391296903944,
				width: 0.7927629791069989,
			},
			{
				x: 373.0619952368353,
				y: 66.34977610240804,
				width: 0.7927629791069989,
			},
			{
				x: 369.34804577930674,
				y: 73.96468720587455,
				width: 0.7927629791069989,
			},
			{
				x: 366.1956496427627,
				y: 81.69015749431067,
				width: 0.7927629791069989,
			},
			{
				x: 363.91084810796514,
				y: 89.37821985472348,
				width: 0.7927629791069989,
			},
			{
				x: 362.79968245567613,
				y: 96.88090717412014,
				width: 0.7927629791069989,
			},
			{
				x: 362.6509354326542,
				y: 99.60561476872189,
				width: 0.7927629791069989,
			},
			{
				x: 362.9159248478435,
				y: 102.14721042894949,
				width: 0.7927629791069989,
			},
			{
				x: 363.5528698068272,
				y: 104.51866584043397,
				width: 0.7927629791069989,
			},
			{
				x: 364.51998941518923,
				y: 106.73295268880658,
				width: 0.7927629791069989,
			},
			{
				x: 365.7755027785129,
				y: 108.80304265969833,
				width: 0.7927629791069989,
			},
			{
				x: 367.2776290023816,
				y: 110.74190743874043,
				width: 0.7927629791069989,
			},
			{
				x: 368.9845871923789,
				y: 112.5625187115639,
				width: 0.7927629791069989,
			},
			{
				x: 370.8545964540884,
				y: 114.27784816379996,
				width: 0.7927629791069989,
			},
			{
				x: 372.8458758930935,
				y: 115.90086748107964,
				width: 0.7927629791069989,
			},
			{
				x: 374.9166446149775,
				y: 117.44454834903414,
				width: 0.7927629791069989,
			},
		],
	],
	width: 400,
	height: 150.01085689626888,
	settings: {
		resolutionMultiplier: 4,
		minSmoothingFactor: 0.7,
		maxSmoothingFactor: 0.95,
		minInterpolationPoints: 5,
		maxInterpolationPoints: 20,
		baseLineWidth: 0.7927629791069989,
		minLineWidth: 2.3,
		maxLineWidth: 2.7,
		velocitySensitivity: 3,
	},
};
