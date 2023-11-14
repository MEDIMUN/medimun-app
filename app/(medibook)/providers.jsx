"use client";

import React, { useEffect } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";

export const ClientProvider = ({ children }) => {
	const queryClient = new QueryClient();

	function getBox(width, height) {
		return {
			string: "+",
			style: "font-size: 1px; padding: " + Math.floor(height / 2) + "px " + Math.floor(width / 2) + "px; line-height: " + height + "px;",
		};
	}

	console.image = function (url, backgroundColour, scale) {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			const c = document.createElement("canvas");
			const ctx = c.getContext("2d");
			if (ctx) {
				c.width = img.width;
				c.height = img.height;
				ctx.fillStyle = backgroundColour;
				ctx.fillRect(0, 0, c.width, c.height);
				ctx.drawImage(img, 0, 0);
				const dataUri = c.toDataURL("image/png");

				console.log(
					`%c sup?`,
					`
				  font-size: 130px;
				  padding: ${Math.floor((img.height * scale) / 2)}px ${Math.floor((img.width * scale) / 2)}px;
				  background-image: url(${dataUri});
				  background-repeat: no-repeat;
				  background-size: ${img.width * scale}px ${img.height * scale}px;
				  color: transparent;
				`
				);
			}
		};
		img.src = url;
	};

	useEffect(() => {
		//console.image("/fun/logo.png");
		return;
		console.log(
			`%c
		███    ███ ███████ ██████  ██ ███    ███ ██    ██ ███    ██
		████  ████ ██      ██   ██ ██ ████  ████ ██    ██ ████   ██
		██ ████ ██ █████   ██   ██ ██ ██ ████ ██ ██    ██ ██ ██  ██
		██  ██  ██ ██      ██   ██ ██ ██  ██  ██ ██    ██ ██  ██ ██
		██      ██ ███████ ██████  ██ ██      ██  ██████  ██   ████ `,
			"background: #AE2D29; color: #FFFFFF"
		);
		console.log("%c", "width: 512px; height: 256px; background: url('/assets/branding/logos/logo-white.svg')");
		console.log("Go to medimun.org/leave-your-signature while signed in to leave your signature like the others");
	}, []);

	return (
		<SessionProvider>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</SessionProvider>
	);
};
