"use client";
import ReCAPTCHA from "react-google-recaptcha";

import { useRef, useState } from "react";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Button } from "@/components/button";
import { Link } from "@/components/link";
import { useSearchParams } from "next/navigation";
import { checkTokenGoogle, contactUs } from "./actions";
import { useFlushState } from "@/hooks/use-flush-state";
import { Info } from "lucide-react";

export function RecaptchaComp({
	className,
	sitekey,
	isVerified,
	setIsVerified,
}: {
	className?: string;
	sitekey: string;
	isVerified: boolean;
	setIsVerified: (value: boolean) => void;
}) {
	const recaptchaRef = useRef<ReCAPTCHA>(null);

	const handleChange = async (token: string | null) => {
		if (!token) return;
		const test = await checkTokenGoogle(token);
		if (test) {
			setIsVerified(true);
		} else {
			setIsVerified(false);
		}
	};

	function handleExpired() {
		setIsVerified(false);
	}

	return <ReCAPTCHA className={className} onChange={handleChange} onExpired={handleExpired} ref={recaptchaRef} sitekey={sitekey} />;
}

export function ContactUsForm({ sitekey }) {
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useFlushState(false);
	const [isVerified, setIsVerified] = useState(false);

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
								<Info aria-hidden="true" className="h-5 w-5 text-green-400" />
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
								<Info aria-hidden="true" className="h-5 w-5 text-red-400" />
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
								<Info aria-hidden="true" className="h-5 w-5 text-red-400" />
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
								<Input disabled={isLoading} name="name" minLength={3} maxLength={50} type="text" required autoComplete="given-name" />
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
								<Textarea disabled={isLoading} minLength={10} maxLength={500} className="max-h-[500px]" required name="message" />
							</Field>
						</div>
						<div className="mt-8 flex w-full justify-end">
							<RecaptchaComp isVerified={isVerified} setIsVerified={setIsVerified} className="ml-auto" sitekey={sitekey} />
						</div>
						<div className="mt-6 flex justify-end">
							<Button disabled={isLoading || !isVerified} type="submit" color="primary">
								Send message
							</Button>
						</div>
					</>
				)}
			</div>
		</form>
	);
}
