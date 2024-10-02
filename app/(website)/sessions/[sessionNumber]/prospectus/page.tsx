import prisma from "@/prisma/client";
import { minio } from "@/minio/client";
import { Topbar } from "@/app/(website)/server-components";
import { getOrdinal } from "@/lib/ordinal";
import { ArrowDownCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/16/solid";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;

export async function generateMetadata({ params }) {
	return {
		title: `${params.sessionNumber}${getOrdinal(parseInt(params.sessionNumber))} Annual Session Prospectus`,
		description: `View the prospectus for the ${params.sessionNumber}${getOrdinal(
			parseInt(params.sessionNumber)
		)} annual session of the Mediterranean Model United Nations.`,
	};
}
export default async function Page({ params }: { params: { sessionNumber: string } }) {
	const minioClient = minio();

	const selectedSession = await prisma.session
		.findFirstOrThrow({
			where: { number: params.sessionNumber },
			include: { Resource: { where: { scope: { hasSome: ["SESSIONPROSPECTUS"] } } } },
		})
		.catch(notFound);

	if (!selectedSession.Resource.length) {
		return (
			<>
				<Topbar
					title={
						<>
							{selectedSession.number}
							<sup>{getOrdinal(selectedSession.numberInteger)}</sup> Annual Session Prospectus
						</>
					}
				/>
				<div className="flex w-full">
					<div className="mx-auto max-w-7xl rounded-md bg-yellow-50 p-4">
						<div className="flex">
							<div className="flex-shrink-0">
								<ExclamationTriangleIcon aria-hidden="true" className="h-5 w-5 text-yellow-400" />
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-yellow-800">No prospectus available for the session yet.</h3>
							</div>
						</div>
					</div>
				</div>
			</>
		);
	}

	const selectedResource = selectedSession.Resource[0];

	const presignedFileUrl = await minioClient
		.presignedGetObject(process.env.BUCKETNAME, `resources/${selectedResource.fileId}`, 60 * 60)
		.catch(notFound);
	const presignedFileUrlHttps = presignedFileUrl.replace("http://", "https://");

	return (
		<>
			<Topbar
				title={
					<>
						{selectedSession.number}
						<sup>{getOrdinal(selectedSession.numberInteger)}</sup> Annual Session Prospectus
					</>
				}
			/>
			<div className="flex flex-col pb-8 md:px-8">
				<iframe src={presignedFileUrlHttps} className="mx-auto min-h-screen w-full max-w-4xl overflow-hidden md:rounded-lg"></iframe>
				<div className="w-4xl mx-auto mt-8 rounded-md bg-zinc-50 p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<ArrowDownCircleIcon aria-hidden="true" className="h-5 w-5 text-zinc-400" />
						</div>
						<div className="ml-3 flex-1 md:flex md:justify-between">
							<p className="text-sm text-zinc-700">
								Download the prospectus for printing. By downloading you accept our{" "}
								<Link href="/terms" className="text-primary">
									terms & conditions
								</Link>
								.
							</p>
							<p className="mt-3 text-sm md:ml-6 md:mt-0">
								<a target="_blank" href={presignedFileUrlHttps} className="whitespace-nowrap font-medium text-zinc-700 hover:text-zinc-600">
									Download
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
