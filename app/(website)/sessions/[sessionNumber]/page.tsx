import Paginator from "@/components/pagination";
import { getOrdinal } from "@/lib/get-ordinal";
import { Suspense } from "react";
import { Topbar } from "../../server-components";
import { FastLink } from "@/components/fast-link";

export default async function Page(props) {
	const params = await props.params;
	const className = "px-4 rounded-md py-1 max-w-max after:content after:content-['_↗'] text-black bg-white";
	return (
		<>
			<Topbar
				buttonText="All Sessions"
				buttonHref="/sessions"
				description="This page is temporary and will be updated in the future."
				title={
					<>
						The {params.sessionNumber}
						<sup>{getOrdinal(parseInt(params.sessionNumber))}</sup> Annual Session
					</>
				}
			/>
			<div className="mx-auto max-w-7xl p-4 md:p-8 text-left md:text-center">
				<div className="text-lg font-[montserrat] leading-6 text-left text-white ">
					<FastLink href={`/sessions/${params.sessionNumber}/prospectus`} target="_blank">
						<div className={className}>Prospectus</div>
					</FastLink>
					<br />
					<br />
					<FastLink href={`/sessions/${params.sessionNumber}/albums`}>
						<div className={className}>Photo Albums</div>
					</FastLink>
					<br />
					<br />
					<FastLink href={`/medibook/sessions/${params.sessionNumber}`}>
						<div className={className}>View Session on MediBook</div>
					</FastLink>
				</div>
			</div>
		</>
	);
}
