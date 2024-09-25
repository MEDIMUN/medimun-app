"use client";
import ReCAPTCHA from "react-google-recaptcha";

import { useRef } from "react";

export function RecaptchaComp({ className }: { className?: string }) {
	const recaptchaRef = useRef();

	return <ReCAPTCHA className={className} ref={recaptchaRef} sitekey={process.env.RECAPTCHA_SITE_KEY} />;
}
