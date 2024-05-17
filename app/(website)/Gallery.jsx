import img1 from "@/public/pages/index/section3images/1.jpeg";
import img2 from "@/public/pages/index/section3images/2.jpeg";
import img3 from "@/public/pages/index/section3images/3.jpeg";
import img4 from "@/public/pages/index/section3images/4.jpeg";
import img5 from "@/public/pages/index/section3images/5.jpeg";
import img6 from "@/public/pages/index/section3images/6.jpeg";

import Image from "next/image";

export default function Gallery() {
	const imageStyles = "";
	const imageWrapperStyle = "animate-marquee bg-red-500 min-w-[400px] overflow-hidden";
	const imageWrapperStyleBack = "animate-marqueeback bg-red-500 min-w-[400px] overflow-hidden";

	const images = [
		{ src: img1, alt: "Delegates in the middle of a debate" },
		{ src: img2, alt: "Expert speaker giving a speech to a committee" },
		{ src: img3, alt: "Delegates in the middle of a debate" },
	];

	const images2 = [
		{ src: img4, alt: "Delegates and chairs playing an ice-breaker challenge within their committee" },
		{ src: img5, alt: "Delegates lifting their plackards during a debate" },
		{ src: img6, alt: "Delegates listening to their chair" },
	];

	const images3 = [...images, ...images, ...images, ...images, ...images, ...images, ...images, ...images];
	const images32 = [...images2, ...images2, ...images2, ...images2, ...images2, ...images2, ...images2, ...images2];

	return (
		<div className="relative z-[1000]">
			<div className=" h-[90px] bg-black"></div>
			<section className="h-[250px] bg-black font-[montserrat] duration-300">
				<div className="mx-auto flex h-full max-w-[1260px] gap-5 p-5 pb-[10px] md:grid-cols-3">
					<div className="flex w-[200vw] justify-center gap-5 overflow-x-auto whitespace-nowrap align-middle">
						{images3.map((image) => (
							<div key={Math.random()} className={imageWrapperStyleBack}>
								<Image placeholder="blur" alt={image.alt} className={imageStyles} src={image.src} />
							</div>
						))}
					</div>
				</div>
			</section>
			<section className="h-[250px] bg-black font-[montserrat] duration-300">
				<div className="mx-auto flex h-full max-w-[1260px] gap-5 p-5 py-[10px] md:grid-cols-3">
					<div className="flex w-[200vw] justify-center gap-5 overflow-x-auto whitespace-nowrap align-middle">
						{images32.map((image) => (
							<div key={Math.random()} className={imageWrapperStyle}>
								<Image placeholder="blur" alt={image.alt} className={imageStyles} src={image.src} />
							</div>
						))}
					</div>
				</div>
			</section>
			<div className="h-[90px] bg-black"></div>
		</div>
	);
}
