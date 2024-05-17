"use client";

import Image from "next/image";
import image6 from "@/public/placeholders/delegates-2.jpg";
import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ReCAPTCHA from "react-google-recaptcha";
import { verifyCaptcha } from "@/lib/verify-chapta";
import { contactUs } from "./contact-us.server";
import { useToast } from "@/components/ui/use-toast";

export default function Page() {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const recaptchaRef = useRef(null);
	const { toast } = useToast();

	const updateMousePosition = (ev) => {
		setMousePosition({ x: ev.clientX, y: ev.clientY });
	};

	useEffect(() => {
		window.addEventListener("mousemove", updateMousePosition);
		return () => window.removeEventListener("mousemove", updateMousePosition);
	}, []);

	async function contactUsWrapper(formData) {
		const token = await recaptchaRef.current.executeAsync();
		formData.append("token", token);
		const res = await contactUs(formData);
		if (res)
			toast({
				title: res?.title,
				description: res?.description,
				variant: res?.variant,
			});
		if (res.ok) {
			recaptchaRef.current.reset();
			document.getElementById("main").reset();
		}
	}

	const vignette = {
		background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, #AE2D2890 0%, rgb(0, 0, 0) 70%, rgb(0, 0, 0) 100%)`,
	};
	return (
		<div className="h-[128vh] w-full bg-black md:h-screen">
			<Image fill src={image6} className="object-cover" />
			<div className="absolute h-full bg-black"></div>
			<div style={vignette} className="absolute h-full w-full ">
				<div className="h-full w-full pt-[48px] md:p-4 md:pt-[96px]">
					<div className="h-full w-full p-8 shadow-lg md:w-[380px] md:rounded-3xl md:border-[1px] md:border-[var(--primary)] md:bg-black">
						<h1 className="select-none rounded-3xl font-[Montserrat] text-[35px] font-[700] text-white">Contact Us</h1>
						<h2 className="rounded-3xl font-[Montserrat] text-[25px] font-[700] text-white"></h2>
						<form id="main" action={contactUsWrapper} className="flex flex-col gap-4 py-4 font-[Montserrat] font-[700] uppercase">
							<Label htmlFor="name" className="select-none text-white">
								Name
							</Label>
							<Input className="text-md border-[var(--primary)] bg-black text-white md:text-sm" type="text" required id="name" name="name" placeholder="Name" />
							<Label htmlFor="email" className="select-none text-white">
								Email
							</Label>
							<Input className="text-md border-[var(--primary)] bg-black text-white md:text-sm" type="email" required id="email" name="email" placeholder="Email" />
							<Label htmlFor="message" className=" select-none text-white">
								Message
							</Label>
							<Textarea className="text-md max-h-[300px] min-h-[300px] border-[var(--primary)] bg-black text-white md:text-sm" type="message" required id="message" name="message" placeholder="Message" />
							<ReCAPTCHA size="invisible" className="my-auto" sitekey="6Lft5AEoAAAAAKq2x2L-8qgGVISfV0JlH9aFCHVi" ref={recaptchaRef} />
							<Button type="submit" className="bottom-0 mt-auto w-full bg-white text-black hover:bg-[var(--primary)] hover:text-white">
								SEND
							</Button>
							<p className="text-white">
								This service isn't active yet, please email us at{" "}
								<a className="text-blue-500" href="mailto:medimun.cyprus@gmail.com">
									medimun.cyprus@gmail.com
								</a>
							</p>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
