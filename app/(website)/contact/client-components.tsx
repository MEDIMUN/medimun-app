"use client";
import ReCAPTCHA from "react-google-recaptcha";

import { useRef, useState } from "react";
import { Field, Label } from "@/components/fieldset";
import { Badge } from "@/components/badge";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Button } from "@/components/button";
import { Link } from "@/components/link";
import { InformationCircleIcon } from "@heroicons/react/16/solid";
import { useSearchParams } from "next/navigation";
import { contactUs } from "./actions";
import { useFlushState } from "@/hooks/use-flush-state";

export function RecaptchaComp({ className, sitekey }: { className?: string; sitekey: string }) {
	const recaptchaRef = useRef<ReCAPTCHA>(null);
	const [isVerified, setIsVerified] = useState(false);

	const handleChange = (token: string | null) => {
		console.log(token);
	};

	function handleExpired() {
		setIsVerified(false);
	}

	return <ReCAPTCHA className={className} onChange={handleChange} onExpired={handleExpired} ref={recaptchaRef} sitekey={sitekey} />;
}

export function ContactUsForm({ sitekey }) {
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useFlushState(false);

	async function handleSubmit(formData) {
		if (isLoading) return;
		setIsLoading(true);
		await contactUs(formData);
		setIsLoading(false);
	}

	return (
		<form action={handleSubmit} className="px-6 pb-24 pt-20 sm:pb-32 lg:px-8 lg:py-48">
			<div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
				{searchParams && searchParams.get("success") == "true" && (
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
				{searchParams && searchParams.get("error") == "invalid-data" && (
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
				{searchParams && searchParams.get("error") == "failed-to-send-email" && (
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
				{searchParams && !searchParams.get("success") && (
					<>
						<div className="grid grid-cols-1 gap-x-8 gap-y-6">
							<Field>
								<Label>
									Name<span className="text-red-500">*</span>
								</Label>
								<Input disabled={isLoading} name="name" type="text" required autoComplete="given-name" />
							</Field>
							<Field>
								<Label>
									Email<span className="text-red-500">*</span>
								</Label>
								<Input disabled={isLoading} name="email" type="email" required autoComplete="email" />
							</Field>
							<Field>
								<Label>Phone Number</Label>
								<Input disabled={isLoading} name="phone" type="tel" autoComplete="tel" />
							</Field>
							<Field>
								<Label>
									Message<span className="text-red-500">*</span>
								</Label>
								<Textarea disabled={isLoading} className="max-h-[500px]" required name="message" />
							</Field>
						</div>
						<div className="mt-8 flex w-full justify-end">
							<RecaptchaComp className="ml-auto" sitekey={sitekey} />
						</div>
						<div className="mt-6 flex justify-end">
							<Button disabled={isLoading} type="submit" color="primary">
								Send message
							</Button>
						</div>
					</>
				)}
			</div>
		</form>
	);
}
