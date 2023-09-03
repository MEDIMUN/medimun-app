import { MDXProvider } from "@mdx-js/react";
import Image from "next/image";

const ResponsiveImage = (props) => (
	<Image alt={props.alt} sizes="100vw" style={{ width: "100%", height: "auto" }} {...props} />
);

const components = {
	img: ResponsiveImage,
};

export default function customMDXProvider(props) {
	return (
		<MDXProvider components={components}>
			<main className="min-h-[calc(100svh)]" {...props} />
		</MDXProvider>
	);
}
