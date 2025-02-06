import type React from "react";
import type { Clause, SubClause, SubSubClause } from "@/types/socket-events";
import { Divider } from "./divider";
import { romanize } from "@/lib/romanize";

interface ResolutionDisplayProps {
	preambutoryClauses: Clause[];
	operativeClauses: Clause[];
}

const sampleResolution = {
	title: "Comprehensive Global Action on Climate Change Mitigation, Adaptation, and International Security",
	preambutoryClauses: [
		{
			id: "1",
			startingPhrase: "Recognizing",
			body: "the urgent need for global action to combat climate change and its far-reaching consequences on ecosystems, economies, and human societies",
			index: 1,
			subClauses: "[]",
			resolutionId: "sample",
		},
		{
			id: "2",
			startingPhrase: "Deeply concerned",
			body: "by the increasing frequency and severity of natural disasters linked to climate change, including but not limited to hurricanes, floods, droughts, and wildfires",
			index: 2,
			subClauses: "[]",
			resolutionId: "sample",
		},
		{
			id: "3",
			startingPhrase: "Recalling",
			body: "the Paris Agreement adopted under the United Nations Framework Convention on Climate Change (UNFCCC) and its goals to limit global temperature increase to well below 2 degrees Celsius above pre-industrial levels",
			index: 3,
			subClauses: "[]",
			resolutionId: "sample",
		},
		{
			id: "4",
			startingPhrase: "Alarmed",
			body: "by scientific reports from the Intergovernmental Panel on Climate Change (IPCC) indicating that current global efforts are insufficient to meet the goals set forth in the Paris Agreement",
			index: 4,
			subClauses: "[]",
			resolutionId: "sample",
		},
		{
			id: "5",
			startingPhrase: "Noting",
			body: "the disproportionate impact of climate change on developing countries, small island developing states, and vulnerable populations worldwide",
			index: 5,
			subClauses: "[]",
			resolutionId: "sample",
		},
		{
			id: "6",
			startingPhrase: "Emphasizing",
			body: "the importance of international cooperation, technology transfer, and financial support in addressing the global challenge of climate change",
			index: 6,
			subClauses: "[]",
			resolutionId: "sample",
		},
		{
			id: "7",
			startingPhrase: "Recognizing",
			body: "the intrinsic link between climate change and international security, including potential conflicts over resources, climate-induced migration, and threats to food and water security",
			index: 7,
			subClauses: "[]",
			resolutionId: "sample",
		},
	] as Clause[],
	operativeClauses: [
		{
			id: "8",
			startingPhrase: "Urges",
			body: "all Member States to strengthen their commitments to reduce greenhouse gas emissions and to submit enhanced Nationally Determined Contributions (NDCs) under the Paris Agreement by the end of 2023",
			index: 1,
			subClauses: JSON.stringify([
				{
					content:
						"By setting more ambitious national targets for emission reductions, aiming for at least a 50% reduction in greenhouse gas emissions by 2030 compared to 2005 levels",
					subSubClauses: [],
				},
				{
					content: "Through the rapid transition to renewable energy sources",
					subSubClauses: [
						{ content: "Investing in solar, wind, hydroelectric, and geothermal power infrastructure" },
						{ content: "Phasing out fossil fuel subsidies and redirecting these funds to clean energy development" },
						{ content: "Implementing carbon pricing mechanisms, such as carbon taxes or cap-and-trade systems" },
					],
				},
				{
					content: "By enhancing energy efficiency across all sectors, including industry, transportation, and buildings",
					subSubClauses: [],
				},
			]),
			resolutionId: "sample",
		},
		{
			id: "9",
			startingPhrase: "Calls upon",
			body: "the international community to significantly increase financial and technological support for developing countries in their efforts to adapt to and mitigate climate change",
			index: 2,
			subClauses: JSON.stringify([
				{
					content:
						"Mobilizing at least $100 billion annually in climate finance for developing countries, as agreed upon in previous climate negotiations",
					subSubClauses: [],
				},
				{
					content: "Establishing a dedicated fund for loss and damage caused by climate change in vulnerable countries",
					subSubClauses: [],
				},
				{
					content: "Facilitating the transfer of clean and efficient technologies to developing countries through:",
					subSubClauses: [
						{ content: "Joint research and development programs" },
						{ content: "Capacity-building initiatives" },
						{ content: "Reduction of intellectual property barriers for essential climate technologies" },
					],
				},
			]),
			resolutionId: "sample",
		},
		{
			id: "10",
			startingPhrase: "Decides",
			body: "to establish a UN Climate Security Task Force to assess and address the security implications of climate change",
			index: 3,
			subClauses: JSON.stringify([
				{
					content: "Mandating the Task Force to:",
					subSubClauses: [
						{ content: "Conduct regular assessments of climate-related security risks" },
						{ content: "Develop strategies for conflict prevention and resolution in climate-vulnerable regions" },
						{ content: "Coordinate with relevant UN bodies and regional organizations on climate security matters" },
					],
				},
				{
					content:
						"Requesting the Task Force to report annually to the General Assembly and the Security Council on its findings and recommendations",
					subSubClauses: [],
				},
			]),
			resolutionId: "sample",
		},
		{
			id: "11",
			startingPhrase: "Encourages",
			body: "all Member States to integrate climate change considerations into their national security strategies and to enhance their preparedness for climate-related disasters",
			index: 4,
			subClauses: JSON.stringify([
				{
					content: "Developing comprehensive national adaptation plans that address potential security risks",
					subSubClauses: [],
				},
				{
					content: "Strengthening early warning systems and disaster response capabilities",
					subSubClauses: [],
				},
				{
					content:
						"Promoting regional cooperation on transboundary climate-related challenges, such as water resource management and disaster response",
					subSubClauses: [],
				},
			]),
			resolutionId: "sample",
		},
		{
			id: "12",
			startingPhrase: "Requests",
			body: "the Secretary-General to appoint a Special Envoy for Climate Action and Security to coordinate the UN system's efforts on climate change mitigation, adaptation, and related security issues",
			index: 5,
			subClauses: JSON.stringify([
				{
					content: "Tasking the Special Envoy with:",
					subSubClauses: [
						{ content: "Advocating for increased global ambition on climate action" },
						{ content: "Facilitating dialogue between Member States on climate security issues" },
						{ content: "Coordinating with international financial institutions to mobilize climate finance" },
					],
				},
			]),
			resolutionId: "sample",
		},
		{
			id: "13",
			startingPhrase: "Calls for",
			body: "the development and implementation of a global early warning system for extreme climate events and slow-onset changes",
			index: 6,
			subClauses: JSON.stringify([
				{
					content: "Utilizing advanced climate modeling and artificial intelligence to improve prediction accuracy",
					subSubClauses: [],
				},
				{
					content: "Ensuring that warnings reach vulnerable populations through multiple communication channels",
					subSubClauses: [],
				},
				{
					content: "Linking the early warning system to national and regional disaster response mechanisms",
					subSubClauses: [],
				},
			]),
			resolutionId: "sample",
		},
		{
			id: "14",
			startingPhrase: "Emphasizes",
			body: "the critical role of forests, oceans, and other ecosystems in climate regulation and carbon sequestration",
			index: 7,
			subClauses: JSON.stringify([
				{
					content: "Urging Member States to halt deforestation and significantly increase reforestation efforts",
					subSubClauses: [],
				},
				{
					content: "Promoting sustainable ocean management practices, including the establishment of marine protected areas",
					subSubClauses: [],
				},
				{
					content: "Supporting indigenous and local communities in their role as stewards of biodiversity and ecosystem conservation",
					subSubClauses: [],
				},
			]),
			resolutionId: "sample",
		},
		{
			id: "15",
			startingPhrase: "Recommends",
			body: "the integration of climate change education into national curricula at all levels and the promotion of public awareness campaigns on climate action",
			index: 8,
			subClauses: JSON.stringify([
				{
					content: "Developing age-appropriate educational materials on climate science, impacts, and solutions",
					subSubClauses: [],
				},
				{
					content: "Encouraging universities and research institutions to prioritize climate-related research and innovation",
					subSubClauses: [],
				},
				{
					content: "Supporting civil society organizations in their efforts to raise public awareness and promote climate action",
					subSubClauses: [],
				},
			]),
			resolutionId: "sample",
		},
		{
			id: "16",
			startingPhrase: "Decides",
			body: "to convene a high-level UN Climate Action Summit every two years to review progress on global climate efforts and to enhance international cooperation",
			index: 9,
			subClauses: JSON.stringify([
				{
					content:
						"Inviting heads of state, leaders of international organizations, civil society representatives, and private sector stakeholders to participate",
					subSubClauses: [],
				},
				{
					content: "Focusing on key themes such as:",
					subSubClauses: [
						{ content: "Accelerating the global energy transition" },
						{ content: "Enhancing climate resilience and adaptation" },
						{ content: "Mobilizing climate finance and promoting green technologies" },
						{ content: "Addressing climate-related security risks" },
					],
				},
			]),
			resolutionId: "sample",
		},
		{
			id: "17",
			startingPhrase: "Requests",
			body: "the Secretary-General to report annually to the General Assembly on the implementation of this resolution and the overall progress of global climate action",
			index: 10,
			subClauses: "[]",
			resolutionId: "sample",
		},
	] as Clause[],
};

const SubSubClauseDisplay: React.FC<{ subSubClause: SubSubClause; index: number }> = ({ subSubClause, index }) => (
	<li className="mb-2 flex gap-4">
		<div className="min-w-[1.5rem] text-right">{romanize(index + 1).toLowerCase()}.</div>
		<div>{subSubClause.content}</div>
	</li>
);

const SubClauseDisplay: React.FC<{ subClause: SubClause; index: number }> = ({ subClause, index }) => (
	<li className="mb-2 flex flex-col">
		<div className="flex gap-4">
			<div className="min-w-[1.5rem] text-right">{String.fromCharCode(97 + index)})</div>
			<div>{subClause.content}</div>
		</div>
		<div>
			{subClause.subSubClauses && subClause.subSubClauses.length > 0 && (
				<ol className="pl-6 mt-2">
					{subClause.subSubClauses.map((subSubClause, subSubIndex) => (
						<SubSubClauseDisplay key={subSubIndex} subSubClause={subSubClause} index={subSubIndex} />
					))}
				</ol>
			)}
		</div>
	</li>
);

function ClauseDisplay({
	clause,
	index,
	isPreambulatory,
	operativeClauses = [],
	preambutoryClauses = [],
}): React.FC<{ clause: Clause; index: number; isPreambulatory: boolean }> {
	return (
		<div className={`mb-4 ${!isPreambulatory && "pl-10"} ${isPreambulatory ? "italic" : ""}`}>
			<div className="mb-2 flex gap-2">
				{!isPreambulatory && <p className="min-l-[1.5rem] text-right">{index + 1}.</p>}
				<div>
					<span className={!isPreambulatory && "underline"}>{clause.startingPhrase}</span> {clause.body}
					{isPreambulatory ? "," : !!clause.subClauses[index] ? ":" : "."}
				</div>
			</div>
			{clause.subClauses && clause.subClauses.length > 0 && (
				<ol className="pl-6">
					{JSON.parse(clause.subClauses as string).map((subClause: SubClause, subIndex: number) => (
						<SubClauseDisplay key={subIndex} subClause={subClause} index={subIndex} />
					))}
				</ol>
			)}
		</div>
	);
}

const ResolutionDisplay: React.FC<ResolutionDisplayProps> = ({
	preambutoryClauses = sampleResolution.preambutoryClauses,
	operativeClauses = sampleResolution.operativeClauses,
}) => {
	return (
		<div className="font-serif text-left !text-sm max-w-4xl mx-auto p-8 bg-white dark:bg-black dark:text-white">
			<div className="mb-8">
				<p className="italic mb-4 inset-10 ml-10">The General Assembly,</p>
				{preambutoryClauses.map((clause, index) => (
					<ClauseDisplay key={clause.id} clause={clause} index={index} isPreambulatory={true} />
				))}
			</div>
			<Divider className="my-10" />
			<div>
				{operativeClauses.map((clause, index) => (
					<ClauseDisplay
						preambutoryClauses={preambutoryClauses}
						operativeClauses={operativeClauses}
						key={clause.id}
						clause={clause}
						index={index}
						isPreambulatory={false}
					/>
				))}
			</div>
		</div>
	);
};

export default ResolutionDisplay;
