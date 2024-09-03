"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";

import { removeSearchParams, updateSearchParams } from "@/lib/searchParams";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/button";

export const dynamic = "force-dynamic";

export default function Page({ searchParams }) {
	const router = useRouter();

	const researchBooklets = [
		{ slug: "GA1", name: "General Assembly 1", href: "https://drive.google.com/drive/folders/11iYQO_rwLEdxq11WoZ-mbQZTNZABv7XM?usp=sharing" },
		{ slug: "GA2", name: "General Assembly 2", href: "https://drive.google.com/drive/folders/1eqp0hR3H7rCL3hgq2mUY-BBIRXAiSrcN?usp=sharing" },
		{ slug: "GA3", name: "General Assembly 3", href: "https://drive.google.com/drive/folders/1Vvu1EPpx8ESmcA4CD_5wHrzUEVEhi1EW?usp=sharing" },
		{ slug: "GA4", name: "General Assembly 4", href: "https://drive.google.com/drive/folders/1ClgF-w6xUonJoqqQjKvHJOAWIOxd8Vxp?usp=sharing" },
		{ slug: "SC", name: "Security Council", href: "https://drive.google.com/drive/folders/1bImh1fnhTNzCVTu_lud7uqf6or1a8QOh?usp=sharing" },
		{
			slug: "HSC",
			name: "Historical Security Council",
			href: "https://drive.google.com/drive/folders/1gAFSXZblLYHMSE1MLrX9qkOKDiXus0cl?usp=sharing",
		},
		{
			slug: "CSW",
			name: "Commission on the Status of Women",
			href: "https://drive.google.com/drive/folders/1qnaajAatuUecslLGNgF5LdddMfGe0P6o?usp=sharing",
		},
	];

	return (
		<>
			<Modal
				onOpenChange={() => updateSearchParams({ view: searchParams.view })}
				scrollBehavior="inside"
				size="2xl"
				isOpen={searchParams.view?.length > 1}
				className="my-10 h-[90vh]">
				<ModalContent>
					<ModalHeader>Resolutions of {searchParams.view}</ModalHeader>
					<ModalBody className="flex flex-col gap-2">
						{researchBooklets.filter((a) => a.slug == searchParams.view)[0] && (
							<iframe
								className="h-full w-full"
								src={researchBooklets
									.filter((a) => a.slug == searchParams.view)[0]
									.href.replace("https://drive.google.com/drive/folders/", "https://drive.google.com/embeddedfolderview?id=")
									.replace("?usp=sharing", "")}
							/>
						)}
					</ModalBody>
					<ModalFooter>
						<Button onClick={() => removeSearchParams({ view: "" }, router)}>Close</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
			<div className="mx-auto max-w-[1248px] p-5 pt-24 font-[montserrat] text-black">
				<h1 className="select-none rounded-3xl font-[Montserrat] text-[35px] font-[700] text-black">Resolutions</h1>
				<ul className="flex flex-col gap-2">
					{researchBooklets.map((link) => {
						return (
							<li key={link.name} className="flex w-full rounded-sm bg-white p-5 text-black">
								<h2 className="md:text-md my-auto text-sm lg:text-xl">{link.name}</h2>
								<Button className="ml-auto" onClick={() => updateSearchParams({ view: link.slug }, router)}>
									View
								</Button>
							</li>
						);
					})}
				</ul>
			</div>
		</>
	);
}
