"use client";

import { useRouter } from "next/navigation";
import useKeypress from "react-use-keypress";
import SharedModal from "./SharedModal";
import { useState } from "react";
import { FastLink } from "@/components/fast-link";

export default function Carousel({ images, index, currentPhoto, sessionNumber, albumId }: { index: number; currentPhoto: any; images: any[]; sessionNumber: string; albumId: string }) {
	const router = useRouter();
	const [direction, setDirection] = useState(0);
	const [curIndex, setCurIndex] = useState(index);

	function handleClose() {
		router.push("/");
		onClose();
	}

	function changePhotoId(newVal: number, direction: number) {
		setDirection(direction);
		setCurIndex(newVal);
		console.log("newVal", newVal);
		currentPhoto = images[newVal];

		window.history.pushState(null, "", `./${newVal + 1}`);
	}

	useKeypress("Escape", () => {
		closeModal();
	});

	return (
		<div className="fixed z-[1000] inset-0 flex items-center justify-center">
			<FastLink href={`/sessions/${sessionNumber}/albums/${albumId}#${curIndex}`} className="absolute inset-0 z-30 cursor-default bg-black backdrop-blur-2xl"></FastLink>
			<SharedModal albumId={albumId} sessionNumber={sessionNumber} direction={direction} images={images} index={curIndex} changePhotoId={changePhotoId} currentPhoto={currentPhoto} navigation={false} />
		</div>
	);
}
