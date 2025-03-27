import { type VectorSignature, type Point, defaultSettings } from "@/types/signature-types";

/**
 * Converts SVG path data to our vector signature format
 */
export function svgToSignature(
	svgPathData: string,
	options: {
		strokeWidth?: number;
		padding?: number;
		normalize?: boolean;
		targetWidth?: number; // Target width for the signature
		minWidth?: number; // Minimum width for the signature
	} = {}
): VectorSignature | null {
	const {
		strokeWidth = 2.5,
		padding = 10,
		normalize = true,
		targetWidth = 250, // Default target width for signatures
		minWidth = 180, // Minimum width for signatures
	} = options;

	try {
		// Parse the SVG path data
		const paths = parseSvgPathData(svgPathData, strokeWidth);

		if (paths.length === 0) {
			return null;
		}

		// Find bounds of all paths
		let minX = Number.MAX_VALUE;
		let maxX = Number.MIN_VALUE;
		let minY = Number.MAX_VALUE;
		let maxY = Number.MIN_VALUE;

		paths.forEach((path) => {
			path.forEach((point) => {
				minX = Math.min(minX, point.x);
				maxX = Math.max(maxX, point.x);
				minY = Math.min(minY, point.y);
				maxY = Math.max(maxY, point.y);
			});
		});

		// Calculate dimensions
		let contentWidth = maxX - minX;
		let contentHeight = maxY - minY;

		// Calculate scaling factor if needed
		let scale = 1;
		if (normalize && contentWidth > 0) {
			// Scale to target width
			scale = targetWidth / contentWidth;

			// Ensure minimum width
			if (contentWidth * scale < minWidth) {
				scale = minWidth / contentWidth;
			}

			// Apply scaling to all points
			paths.forEach((path) => {
				path.forEach((point) => {
					point.x = (point.x - minX) * scale + padding;
					point.y = (point.y - minY) * scale + padding;
					point.width = (point.width || strokeWidth) * Math.sqrt(scale); // Scale stroke width proportionally
				});
			});

			// Update dimensions
			contentWidth *= scale;
			contentHeight *= scale;
		} else if (normalize) {
			// Just normalize position without scaling
			paths.forEach((path) => {
				path.forEach((point) => {
					point.x = point.x - minX + padding;
					point.y = point.y - minY + padding;
				});
			});
		}

		// Calculate final dimensions
		const width = contentWidth + padding * 2;
		const height = contentHeight + padding * 2;

		// Create the vector signature
		const signature: VectorSignature = {
			paths,
			width,
			height,
			settings: {
				...defaultSettings,
				baseLineWidth: strokeWidth * Math.sqrt(scale), // Adjust base line width
			},
		};

		return signature;
	} catch (error) {
		console.error("Error converting SVG to signature:", error);
		return null;
	}
}

/**
 * Parse SVG path data into our points format
 */
function parseSvgPathData(pathData: string, defaultWidth = 2.5): Point[][] {
	// Normalize the path data
	const normalized = pathData
		.replace(/([A-Za-z])/g, " $1 ") // Add spaces around commands
		.replace(/,/g, " ") // Replace commas with spaces
		.replace(/\s+/g, " ") // Normalize whitespace
		.trim();

	const tokens = normalized.split(" ");
	const paths: Point[][] = [];
	let currentPath: Point[] = [];

	let currentX = 0;
	let currentY = 0;
	let lastControlX = 0;
	let lastControlY = 0;
	let i = 0;

	while (i < tokens.length) {
		const token = tokens[i];

		// Handle different SVG path commands
		switch (token.toUpperCase()) {
			// Move to
			case "M": {
				if (currentPath.length > 0) {
					paths.push([...currentPath]);
					currentPath = [];
				}

				const x = Number.parseFloat(tokens[++i]);
				const y = Number.parseFloat(tokens[++i]);

				currentPath.push({ x, y, width: defaultWidth });

				currentX = x;
				currentY = y;
				break;
			}

			// Line to
			case "L": {
				const x = Number.parseFloat(tokens[++i]);
				const y = Number.parseFloat(tokens[++i]);

				currentPath.push({ x, y, width: defaultWidth });

				currentX = x;
				currentY = y;
				break;
			}

			// Horizontal line
			case "H": {
				const x = Number.parseFloat(tokens[++i]);

				currentPath.push({ x, y: currentY, width: defaultWidth });

				currentX = x;
				break;
			}

			// Vertical line
			case "V": {
				const y = Number.parseFloat(tokens[++i]);

				currentPath.push({ x: currentX, y, width: defaultWidth });

				currentY = y;
				break;
			}

			// Cubic bezier curve
			case "C": {
				const x1 = Number.parseFloat(tokens[++i]);
				const y1 = Number.parseFloat(tokens[++i]);
				const x2 = Number.parseFloat(tokens[++i]);
				const y2 = Number.parseFloat(tokens[++i]);
				const x = Number.parseFloat(tokens[++i]);
				const y = Number.parseFloat(tokens[++i]);

				// Add intermediate points to approximate the curve
				const points = approximateCubicBezier(currentX, currentY, x1, y1, x2, y2, x, y);
				points.forEach((point) => {
					currentPath.push({ ...point, width: defaultWidth });
				});

				lastControlX = x2;
				lastControlY = y2;
				currentX = x;
				currentY = y;
				break;
			}

			// Smooth cubic bezier curve
			case "S": {
				// Reflect the last control point
				const x1 = currentX + (currentX - lastControlX);
				const y1 = currentY + (currentY - lastControlY);

				const x2 = Number.parseFloat(tokens[++i]);
				const y2 = Number.parseFloat(tokens[++i]);
				const x = Number.parseFloat(tokens[++i]);
				const y = Number.parseFloat(tokens[++i]);

				// Add intermediate points to approximate the curve
				const points = approximateCubicBezier(currentX, currentY, x1, y1, x2, y2, x, y);
				points.forEach((point) => {
					currentPath.push({ ...point, width: defaultWidth });
				});

				lastControlX = x2;
				lastControlY = y2;
				currentX = x;
				currentY = y;
				break;
			}

			// Quadratic bezier curve
			case "Q": {
				const x1 = Number.parseFloat(tokens[++i]);
				const y1 = Number.parseFloat(tokens[++i]);
				const x = Number.parseFloat(tokens[++i]);
				const y = Number.parseFloat(tokens[++i]);

				// Convert quadratic to cubic bezier
				const cx1 = currentX + (2 / 3) * (x1 - currentX);
				const cy1 = currentY + (2 / 3) * (y1 - currentY);
				const cx2 = x + (2 / 3) * (x1 - x);
				const cy2 = y + (2 / 3) * (y1 - y);

				// Add intermediate points to approximate the curve
				const points = approximateCubicBezier(currentX, currentY, cx1, cy1, cx2, cy2, x, y);
				points.forEach((point) => {
					currentPath.push({ ...point, width: defaultWidth });
				});

				lastControlX = x1;
				lastControlY = y1;
				currentX = x;
				currentY = y;
				break;
			}

			// Smooth quadratic bezier curve
			case "T": {
				// Reflect the last control point
				const x1 = currentX + (currentX - lastControlX);
				const y1 = currentY + (currentY - lastControlY);

				const x = Number.parseFloat(tokens[++i]);
				const y = Number.parseFloat(tokens[++i]);

				// Convert quadratic to cubic bezier
				const cx1 = currentX + (2 / 3) * (x1 - currentX);
				const cy1 = currentY + (2 / 3) * (y1 - currentY);
				const cx2 = x + (2 / 3) * (x1 - x);
				const cy2 = y + (2 / 3) * (y1 - y);

				// Add intermediate points to approximate the curve
				const points = approximateCubicBezier(currentX, currentY, cx1, cy1, cx2, cy2, x, y);
				points.forEach((point) => {
					currentPath.push({ ...point, width: defaultWidth });
				});

				lastControlX = x1;
				lastControlY = y1;
				currentX = x;
				currentY = y;
				break;
			}

			// Close path
			case "Z":
			case "z": {
				if (currentPath.length > 0) {
					// Add the first point to close the path
					if (currentPath.length > 1 && (currentPath[0].x !== currentX || currentPath[0].y !== currentY)) {
						currentPath.push({ ...currentPath[0], width: defaultWidth });
					}

					paths.push([...currentPath]);
					currentPath = [];
				}
				break;
			}

			// Arc (simplified as lines)
			case "A": {
				// Skip the arc parameters
				i += 5;
				const x = Number.parseFloat(tokens[++i]);
				const y = Number.parseFloat(tokens[++i]);

				// Just add the end point (simplified)
				currentPath.push({ x, y, width: defaultWidth });

				currentX = x;
				currentY = y;
				break;
			}

			// Relative commands (convert to absolute)
			case "m":
			case "l":
			case "h":
			case "v":
			case "c":
			case "s":
			case "q":
			case "t":
			case "a": {
				// Convert to uppercase and handle as absolute
				tokens[i] = token.toUpperCase();

				// For relative commands, convert parameters to absolute
				let j = i + 1;
				while (j < tokens.length && !/[A-Za-z]/.test(tokens[j])) {
					const value = Number.parseFloat(tokens[j]);

					if (j % 2 === 1) {
						// x coordinate
						tokens[j] = (value + currentX).toString();
					} else {
						// y coordinate
						tokens[j] = (value + currentY).toString();
					}

					j++;
				}

				// Process the converted command
				continue;
			}

			default:
				// Skip unknown commands
				i++;
				continue;
		}

		i++;
	}

	// Add the last path if not empty
	if (currentPath.length > 0) {
		paths.push(currentPath);
	}

	return paths;
}

/**
 * Approximate a cubic bezier curve with points
 */
function approximateCubicBezier(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, steps = 10): { x: number; y: number }[] {
	const points: { x: number; y: number }[] = [];

	for (let i = 1; i <= steps; i++) {
		const t = i / steps;
		const t2 = t * t;
		const t3 = t2 * t;
		const mt = 1 - t;
		const mt2 = mt * mt;
		const mt3 = mt2 * mt;

		// Cubic bezier formula
		const x = mt3 * x0 + 3 * mt2 * t * x1 + 3 * mt * t2 * x2 + t3 * x3;
		const y = mt3 * y0 + 3 * mt2 * t * y1 + 3 * mt * t2 * y2 + t3 * y3;

		points.push({ x, y });
	}

	return points;
}

/**
 * Convert an SVG element to a signature
 * This function works in browser environments
 */
export function svgElementToSignature(svgElement: SVGElement, options = {}): VectorSignature | null {
	try {
		// Extract path elements
		const pathElements = svgElement.querySelectorAll("path");

		if (pathElements.length === 0) {
			return null;
		}

		// Combine all path data
		let combinedPathData = "";

		pathElements.forEach((path) => {
			const pathData = path.getAttribute("d");
			if (pathData) {
				combinedPathData += pathData + " ";
			}
		});

		if (!combinedPathData) {
			return null;
		}

		// Convert to signature
		return svgToSignature(combinedPathData, options);
	} catch (error) {
		console.error("Error converting SVG element to signature:", error);
		return null;
	}
}

/**
 * Convert an SVG string to a signature
 * This function works in both browser and Node.js environments
 */
export function svgStringToSignature(svgString: string, options = {}): VectorSignature | null {
	try {
		// Extract path data using regex
		const pathRegex = /<path[^>]*d="([^"]+)"[^>]*>/g;
		let match;
		let combinedPathData = "";

		while ((match = pathRegex.exec(svgString)) !== null) {
			combinedPathData += match[1] + " ";
		}

		if (!combinedPathData) {
			return null;
		}

		// Extract stroke width if available
		let strokeWidth = 2.5; // Default
		const strokeWidthMatch = svgString.match(/stroke-width="([^"]+)"|strokeWidth="([^"]+)"/i);
		if (strokeWidthMatch) {
			const width = Number.parseFloat(strokeWidthMatch[1] || strokeWidthMatch[2]);
			if (!isNaN(width)) {
				strokeWidth = width;
			}
		}

		// Convert to signature with extracted stroke width
		return svgToSignature(combinedPathData, {
			...options,
			strokeWidth,
		});
	} catch (error) {
		console.error("Error converting SVG string to signature:", error);
		return null;
	}
}
