"use client";

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, ShareIcon, X } from "lucide-react";
import downloadPhoto from "../../../utils/downloadPhoto";
import { variants } from "../../../utils/animationVariants";
import { range } from "../../../utils/range";
import { FastLink } from "@/components/fast-link";
import { romanize } from "@/lib/romanize";

export default function SharedModal({ index, images, changePhotoId, navigation, currentPhoto, direction, sessionNumber, albumId }) {
	const [loaded, setLoaded] = useState(false);

	let filteredImages = images?.filter((img) => range(index - 15, index + 15).includes(images.indexOf(img)));

	const handlers = useSwipeable({
		onSwipedLeft: () => {
			if (index < images?.length - 1) {
				changePhotoId(index + 1, 1);
			}
		},
		onSwipedRight: () => {
			if (index > 0) {
				changePhotoId(index - 1, -1);
			}
		},
		trackMouse: true,
	});

	let currentImage = images ? images[index] : currentPhoto;

	return (
		<MotionConfig transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}>
			<div className="relative z-50 flex aspect-[3/2] w-full max-w-7xl items-center wide:h-full xl:taller-than-854:h-auto" {...handlers}>
				{/* Main image */}
				<div className="w-full overflow-hidden">
					<div className="relative flex aspect-[3/2] items-center justify-center">
						<AnimatePresence initial={false} custom={direction}>
							<motion.div key={currentImage.id} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="absolute">
								<Image
									src={`https://drive.google.com/thumbnail?id=${currentImage.id}&sz=w1920-h1280`}
									width={navigation ? 1280 : 1920}
									height={navigation ? 853 : 1280}
									priority
									alt="MEDIMUN Image"
									onLoadingComplete={() => setLoaded(true)}
								/>
							</motion.div>
						</AnimatePresence>
					</div>
				</div>

				{/* Buttons + bottom nav bar */}
				<div className="absolute inset-0 mx-auto flex max-w-7xl items-center justify-center">
					{/* Buttons */}
					{loaded && (
						<div className="relative aspect-[3/2] max-h-full w-full">
							{index > 0 && (
								<button
									className="absolute left-3 top-[calc(50%-16px)] rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white focus:outline-none"
									style={{ transform: "translate3d(0, 0, 0)" }}
									onClick={() => changePhotoId(index - 1, -1)}>
									<ChevronLeftIcon className="h-6 w-6" />
								</button>
							)}
							{index + 1 < images.length && (
								<button
									className="absolute right-3 top-[calc(50%-16px)] rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white focus:outline-none"
									style={{ transform: "translate3d(0, 0, 0)" }}
									onClick={() => changePhotoId(index + 1, 1)}>
									<ChevronRightIcon className="h-6 w-6" />
								</button>
							)}
							<div className="absolute top-0 right-0 flex items-center gap-2 p-3 text-white">
								{navigator.share && (
									<button
										onClick={async () => {
											try {
												await navigator.share({
													title: `Photo ${index + 1} from Album "Conference Photos" | Session ${romanize(sessionNumber)} | MEDIMUN`,
													url: `https://www.medimun.org/sessions/${sessionNumber}/albums/${albumId}/${index + 1}?share=${currentImage.id}`,
												});
											} catch (e) {}
										}}
										href={`https://drive.google.com/uc?id=${currentImage.id}&export=view`}
										className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
										target="_blank"
										title="Open fullsize version"
										rel="noreferrer">
										<ShareIcon className="h-5 w-5" />
									</button>
								)}
								<button
									onClick={() => downloadPhoto(`https://drive.google.com/uc?id=${currentImage.id}&export=download`, `MEDIMUN Photo ${index + 1}`)}
									className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
									title="Download fullsize version">
									<DownloadIcon className="h-5 w-5" />
								</button>
							</div>
							<div className="absolute top-0 left-0 flex items-center gap-2 p-3 text-white">
								<FastLink href={`/sessions/${sessionNumber}/albums/${albumId}#${index + 1}`} className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white">
									<X className="h-5 w-5" />
								</FastLink>
							</div>
						</div>
					)}
					{/* Bottom Nav bar */}

					<div className="fixed inset-x-0 bottom-0 z-[100] overflow-hidden bg-gradient-to-b from-black/0 to-black/60">
						<motion.div initial={false} className="mx-auto mt-6 mb-6 flex aspect-[3/2] h-14">
							<AnimatePresence initial={false}>
								{filteredImages.map(({ id }, i) => {
									const isSelected = i === 15;
									return (
										<motion.button
											initial={{ width: "0%", x: `${Math.max((index - 1) * -100, 15 * -100)}%` }}
											animate={{ scale: isSelected ? 1.25 : 1, width: "100%", x: `${Math.max(index * -100, 15 * -100)}%` }}
											exit={{ width: "0%" }}
											onClick={() => changePhotoId(index + (i - 15), i - 15 > 0 ? 1 : -1)}
											key={id}
											className={`${isSelected ? "z-20 rounded-md shadow shadow-black/50" : "z-10"} ${isSelected ? "rounded-l-md" : ""} ${
												id === images.length - 1 ? "rounded-r-md" : ""
											} relative inline-block w-full shrink-0 transform-gpu overflow-hidden focus:outline-none`}>
											<Image
												alt="small photos on the bottom"
												width={180}
												height={120}
												className={`${isSelected ? "brightness-110 hover:brightness-110" : "brightness-50 contrast-125 hover:brightness-75"} h-full transform object-cover transition`}
												src={`https://drive.google.com/thumbnail?id=${id}&sz=w480-h480`}
											/>
										</motion.button>
									);
								})}
							</AnimatePresence>
						</motion.div>
					</div>
				</div>
			</div>
		</MotionConfig>
	);
}
