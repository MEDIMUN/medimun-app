import { Svg, Path, G, Rect } from "@react-pdf/renderer";
import type { VectorSignature } from "@/types/signature-types";

type SignaturePdfRendererProps = {
	signature: VectorSignature | null;
	strokeColor?: string;
	backgroundColor?: string;
	padding?: number;
	width?: number;
	height?: number;
	alignLeft?: boolean;
	alignBottom?: boolean;
	fixedWidth?: number;
	bottomPadding?: number;
};

/**
 * Component to render a signature in a PDF using @react-pdf/renderer
 */
export default function SignaturePdfRenderer({
	signature,
	strokeColor = "#000000",
	backgroundColor = "transparent",
	padding = 10,
	width,
	height = 100, // Default height
	alignLeft = true,
	alignBottom = true, // Default to bottom alignment
	fixedWidth = 180, // Default consistent width for signatures
	bottomPadding = 5, // Padding from bottom edge
}: SignaturePdfRendererProps) {
	if (!signature) {
		return null;
	}

	// Find the actual bounds of the signature content (ignore empty space)
	let minX = Number.MAX_VALUE;
	let maxX = Number.MIN_VALUE;
	let minY = Number.MAX_VALUE;
	let maxY = Number.MIN_VALUE;

	// Calculate actual content bounds
	signature.paths.forEach((path) => {
		if (path.length === 0) return;

		path.forEach((point) => {
			minX = Math.min(minX, point.x);
			maxX = Math.max(maxX, point.x);
			minY = Math.min(minY, point.y);
			maxY = Math.max(maxY, point.y);
		});
	});

	// Safety check for empty signatures or invalid bounds
	if (minX === Number.MAX_VALUE || maxX === Number.MIN_VALUE) {
		return null;
	}

	// Add a small buffer to ensure we don't clip the signature
	minX -= 2;
	minY -= 2;
	maxX += 2;
	maxY += 2;

	// Calculate actual content dimensions (the actual drawn part)
	const actualWidth = maxX - minX;
	const actualHeight = maxY - minY;

	// Container dimensions - ensure we have valid dimensions
	const containerWidth = width || Math.max(actualWidth + padding * 2, fixedWidth);
	const containerHeight = height || actualHeight + padding * 2;

	// Calculate scale to fit within the container while maintaining aspect ratio
	// First try to scale based on width
	const scaleX = (fixedWidth - padding * 2) / actualWidth;
	// Then check if height would overflow and adjust scale if needed
	const scaleY = (containerHeight - padding * 2 - bottomPadding) / actualHeight;

	// Use the smaller scale to ensure signature fits in both dimensions
	const finalScale = Math.min(scaleX, scaleY);

	// Calculate translation to position the signature correctly
	let translateX = 0;
	let translateY = 0;

	// Apply left alignment if needed
	if (alignLeft) {
		translateX = padding - minX * finalScale;
	} else {
		// Center horizontally
		translateX = (containerWidth - actualWidth * finalScale) / 2 - minX * finalScale;
	}

	// Apply bottom alignment if needed
	if (alignBottom) {
		// Position the bottom of the signature at the bottom of the container (minus padding)
		translateY = containerHeight - (maxY - minY) * finalScale - bottomPadding - minY * finalScale;
	} else {
		// Center vertically
		translateY = (containerHeight - actualHeight * finalScale) / 2 - minY * finalScale;
	}

	// Generate SVG paths
	const svgPaths = signature.paths.map((path, pathIndex) => {
		if (path.length < 2) return null;

		// For very short paths, just draw a line
		if (path.length === 2) {
			const pathData = `M ${path[0].x} ${path[0].y} L ${path[1].x} ${path[1].y}`;
			return (
				<Path
					key={`path-${pathIndex}`}
					d={pathData}
					stroke={strokeColor}
					strokeWidth={(path[0].width || signature.settings?.baseLineWidth || 2.5) * (finalScale * 0.7)} // Scale stroke width proportionally
					strokeLinecap="round"
					strokeLinejoin="round"
					fill="none"
				/>
			);
		}

		// For longer paths, use cubic bezier curves for smoothness
		let pathData = `M ${path[0].x} ${path[0].y} `;

		for (let i = 0; i < path.length - 1; i++) {
			const p1 = path[i];
			const p2 = path[i + 1];

			// If we're at the beginning, use a line
			if (i === 0) {
				pathData += `L ${p2.x} ${p2.y} `;
			}
			// Otherwise use a smooth curve
			else {
				const prevP = path[i - 1];
				const nextP = i < path.length - 2 ? path[i + 2] : p2;

				// Calculate control points for a smooth curve
				const tension = 0.12;
				const d1 = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
				const d2 = Math.sqrt(Math.pow(nextP.x - p2.x, 2) + Math.pow(nextP.y - p2.y, 2));

				// Calculate scaling factors for control points
				const scale1 = (tension * d1) / (d1 + d2);
				const scale2 = (tension * d2) / (d1 + d2);

				// Calculate control point 1
				const cp1 = {
					x: p1.x + (p2.x - prevP.x) * tension,
					y: p1.y + (p2.y - prevP.y) * tension,
				};

				// Calculate control point 2
				const cp2 = {
					x: p2.x - (nextP.x - p1.x) * tension,
					y: p2.y - (nextP.y - p1.y) * tension,
				};

				pathData += `C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p2.x} ${p2.y} `;
			}
		}

		return (
			<Path
				key={`path-${pathIndex}`}
				d={pathData}
				stroke={strokeColor}
				strokeWidth={(path[0].width || signature.settings?.baseLineWidth || 2.5) * 0.7} // Scale stroke width proportionally
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
		);
	});

	return (
		<Svg width={containerWidth} height={containerHeight} viewBox={`0 0 ${containerWidth} ${containerHeight}`}>
			{backgroundColor !== "transparent" && <Rect width={containerWidth} height={containerHeight} fill={backgroundColor} />}
			<G transform={`translate(${translateX}, ${translateY}) scale(${finalScale})`}>{svgPaths}</G>
		</Svg>
	);
}
