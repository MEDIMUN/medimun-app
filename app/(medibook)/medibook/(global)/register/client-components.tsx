"use client";

import { useSocket } from "@/contexts/socket";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Progress } from "@nextui-org/progress";
import { Scanner } from "@yudiel/react-qr-scanner";
import { deleteRegUser } from "./actions";
import { Button } from "@/components/button";
import { Text } from "@/components/text";

export function RegisterQRCodeBox({ code }) {
	const router = useRouter();
	const socket = useSocket();

	const refreshEvery = 10; // in seconds
	const [progress, setProgress] = useState(0);

	// Progress bar update logic
	useEffect(() => {
		const progressInterval = setInterval(() => {
			setProgress((prev) => (prev >= 100 ? 0 : prev + 100 / (refreshEvery * 10)));
		}, 100); // Smooth progress update every 100ms

		return () => clearInterval(progressInterval); // Clean up interval on component unmount
	}, []);

	// Refresh logic triggered only when progress reaches 100
	useEffect(() => {
		if (progress >= 100) {
			router.refresh();
		}
	}, [progress, router]);

	return (
		<div className="border shadow-lg shadow-content1 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] relative z-[10000] animate-shimmer bg-[length:200%_100%] p-4 rounded-xl bg-content1/60 flex flex-col gap-1 text-center">
			<div className="flex gap-4 flex-col my-4">
				<div className="mx-auto bg-white p-2 rounded-lg">
					<QRCode size={undefined} value={code} className="mx-auto min-w-full rounded-md" />
					<div className="mt-2 bg-zinc-300 rounded-full h-3">
						{!!progress && <Progress aria-label="Code expiry time" size="md" maxValue={100} minValue={0} value={progress} />}
					</div>
				</div>
			</div>
			<i className="text-white mb-2">Do not share this code with other delegates.</i>
		</div>
	);
}

export function QRReader() {
	const socket = useSocket();

	const [error, setError] = useState("");

	async function handleScan(code) {
		if (code) {
			socket.emit("morning-register", code[0].rawValue);
		}
	}

	return (
		<>
			<div className="border shadow-lg shadow-content1 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] relative z-[10000] animate-shimmer bg-[length:200%_100%] md:p-4 rounded-xl bg-content1/60 flex flex-col gap-1 text-center">
				{error ? (
					<div className="w-full  md:w-64 flex flex-col gap-2 p-4 mx-auto rounded-lg overflow-hidden">
						<Text className="!text-white !text-lg">We couldn&apos;t access your camera. Please make sure you have granted camera permissions.</Text>
						<Text className="text-zinc-200 !text-xs">
							<i>Check your settings and try again.</i>
						</Text>
						<Button onClick={() => window.location.reload()} className="mt-2" color="primary">
							Try Again
						</Button>
					</div>
				) : (
					<div className="w-full md:w-64 mx-auto rounded-lg overflow-hidden">
						<Scanner
							onError={(error) => setError(error)}
							components={{ audio: false, zoom: false, finder: false }}
							scanDelay={0}
							formats={["qr_code"]}
							onScan={(data) => handleScan(data)}
						/>
					</div>
				)}
			</div>
			<Button onClick={() => deleteRegUser()} color="primary">
				Test Reset
			</Button>
		</>
	);
}
