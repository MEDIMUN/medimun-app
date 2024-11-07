import { ImageResponse } from "next/og";

export function GET() {
	return new ImageResponse(<div tw="flex flex-col rounded-3xl w-full h-full items-center justify-center bg-cover">Hi</div>, {
		width: 650,
		height: 650,
	});
}
