import { BuildingOffice2Icon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { contactUs } from "./actions";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { RecaptchaComp } from "./client-components";
import { InformationCircleIcon } from "@heroicons/react/16/solid";
import Link from "next/link";

export default async function Page(props) {
    const searchParams = await props.searchParams;
    return (
		<div className="relative isolate min-h-screen bg-white">
			<div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
				<div className="relative px-6 pb-20 pt-24 sm:pt-32 lg:static lg:px-8 lg:py-48">
					<div className="mx-auto mt-10 max-w-xl lg:mx-0 lg:mt-0 lg:max-w-lg">
						<div className="absolute inset-y-0 left-0 -z-10 w-full overflow-hidden bg-gray-100 ring-1 ring-gray-900/10 lg:w-1/2">
							<svg
								className="absolute inset-0 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
								aria-hidden="true">
								<defs>
									<pattern id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527" width={200} height={200} x="100%" y={-1} patternUnits="userSpaceOnUse">
										<path d="M130 200V.5M.5 .5H200" fill="none" />
									</pattern>
								</defs>
								<rect width="100%" height="100%" strokeWidth={0} fill="white" />
								<svg x="100%" y={-1} className="overflow-visible fill-gray-50">
									<path d="M-470.5 0h201v201h-201Z" strokeWidth={0} />
								</svg>
								<rect width="100%" height="100%" strokeWidth={0} fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)" />
							</svg>
						</div>
						<h2 className="text-3xl font-bold tracking-tight text-gray-900">Get in touch</h2>
						<p className="mt-6 text-lg leading-8 text-gray-600">
							We welcome your inquiries and feedback. Please do not hesitate to contact us with any questions or comments you may have.
						</p>
						<dl className="mt-10 space-y-4 text-base leading-7 text-gray-600">
							<div className="flex gap-x-4">
								<dt className="flex-none">
									<span className="sr-only">Address</span>
									<BuildingOffice2Icon className="h-7 w-6 text-gray-400" aria-hidden="true" />
								</dt>
								<dd>
									0 Kyriakou Matsi Avenue & Presidential Palace Road
									<br />
									1082 Strovolos, Nicosia Cyprus
								</dd>
							</div>
							<div className="flex gap-x-4">
								<dt className="flex-none">
									<span className="sr-only">Telephone</span>
									<PhoneIcon className="h-7 w-6 text-gray-400" aria-hidden="true" />
								</dt>
								<dd>
									<a className="hover:text-gray-900" href="tel:+35722799300">
										+357 22 799 300
									</a>
								</dd>
							</div>
							<div className="flex gap-x-4">
								<dt className="flex-none">
									<span className="sr-only">Email</span>
									<EnvelopeIcon className="h-7 w-6 text-gray-400" aria-hidden="true" />
								</dt>
								<dd>
									<a className="hover:text-gray-900" href="medimun.cyprus@gmail.com">
										medimun.cyprus@gmail.com
									</a>
								</dd>
							</div>
						</dl>
					</div>
				</div>
				<form action={contactUs} className="px-6 pb-24 pt-20 sm:pb-32 lg:px-8 lg:py-48">
					<div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
						{searchParams.success == "true" && (
							<div className="rounded-md bg-green-50 p-4">
								<div className="flex">
									<div className="flex-shrink-0">
										<InformationCircleIcon aria-hidden="true" className="h-5 w-5 text-green-400" />
									</div>
									<div className="ml-3 flex-1 md:flex md:justify-between">
										<p className="text-sm text-green-700">We will get back to you as soon as possible.</p>
										<p className="mt-3 text-sm md:ml-6 md:mt-0">
											<Link href="/contact" className="whitespace-nowrap font-medium text-green-700 hover:text-green-600">
												Contact us again
												<span aria-hidden="true"> &rarr;</span>
											</Link>
										</p>
									</div>
								</div>
							</div>
						)}
						{searchParams.error == "invalid-data" && (
							<div className="mb-4 rounded-md bg-red-50 p-4">
								<div className="flex">
									<div className="flex-shrink-0">
										<InformationCircleIcon aria-hidden="true" className="h-5 w-5 text-red-400" />
									</div>
									<div className="ml-3 flex-1 md:flex md:justify-between">
										<p className="text-sm text-red-700">You have entered invalid info.</p>
									</div>
								</div>
							</div>
						)}
						{searchParams.error == "failed-to-send-email" && (
							<div className="rounded-md bg-red-50 p-4">
								<div className="flex">
									<div className="flex-shrink-0">
										<InformationCircleIcon aria-hidden="true" className="h-5 w-5 text-red-400" />
									</div>
									<div className="ml-3 flex-1 md:flex md:justify-between">
										<p className="text-sm text-red-700">
											Failed to send email.
											<br />
											Please contact us directly.
										</p>
										<p className="mt-3 text-sm md:ml-6 md:mt-0">
											<Link href="mailto:medimun.cyprus@gmail.com" className="whitespace-nowrap font-medium text-red-700 hover:text-red-600">
												Email us
												<span aria-hidden="true"> &rarr;</span>
											</Link>
										</p>
									</div>
								</div>
							</div>
						)}
						{!searchParams.success && (
							<>
								<div className="grid grid-cols-1 gap-x-8 gap-y-6">
									<Field>
										<Label>
											Name <Badge color="red">Required</Badge>
										</Label>
										<Input name="name" type="text" required autoComplete="given-name" />
									</Field>
									<Field>
										<Label>
											Email <Badge color="red">Required</Badge>
										</Label>
										<Input name="email" type="email" required autoComplete="email" />
									</Field>
									<Field>
										<Label>Phone Number</Label>
										<Input name="phone" type="tel" autoComplete="tel" />
									</Field>
									<Field>
										<Label>
											Message <Badge color="red">Required</Badge>
										</Label>
										<Textarea className="max-h-[500px]" required name="message" />
									</Field>
								</div>
								<div className="mt-8 flex justify-end">
									<Button type="submit" color="primary">
										Send message
									</Button>
								</div>
							</>
						)}
					</div>
				</form>
			</div>
		</div>
	);
}
