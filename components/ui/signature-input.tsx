"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Upload, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { svgStringToSignature } from "@/lib/svg-to-signature";
import { type Point, type VectorSignature, type SignatureSettings, defaultSettings } from "@/types/signature-types";
import { useTheme } from "next-themes";

type SignatureInputProps = {
	canvasRef?: React.RefObject<HTMLCanvasElement>;
	defaultValue?: VectorSignature | null;
	value?: VectorSignature | null;
	onChange?: (value: VectorSignature | null) => void;
	readOnly?: boolean;
	settings?: SignatureSettings;
	name?: string;
	allowSvgImport?: boolean;
	allowDownload?: boolean;
};

export default function SignatureInput({
	canvasRef: externalCanvasRef,
	defaultValue = null,
	value,
	onChange,
	readOnly = false,
	settings = defaultSettings,
	name,
	allowSvgImport = true,
	allowDownload = true,
}: SignatureInputProps) {
	// Create internal ref if external ref is not provided
	const internalCanvasRef = useRef<HTMLCanvasElement>(null);
	const canvasRef = externalCanvasRef || internalCanvasRef;
	const containerRef = useRef<HTMLDivElement>(null);
	const { theme } = useTheme();

	const [isDrawing, setIsDrawing] = useState(false);
	const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

	// Single state for the signature
	const [signature, setSignature] = useState<VectorSignature | null>(value !== undefined ? value : defaultValue);

	// Store points for the current path
	const pointsRef = useRef<Point[]>([]);

	// For smooth drawing
	const lastPointRef = useRef<Point | null>(null);

	// For consistent line width
	const lastWidthRef = useRef<number>(settings.baseLineWidth);

	// SVG import states
	const [svgString, setSvgString] = useState("");
	const [importError, setImportError] = useState<string | null>(null);
	const [targetWidth, setTargetWidth] = useState(250);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

	// Handle controlled component behavior
	useEffect(() => {
		if (value !== undefined) {
			setSignature(value);
		}
	}, [value]);

	// Update signature and notify parent
	const updateSignature = (newSignature: VectorSignature | null) => {
		// Only update if we're not in controlled mode or if explicitly clearing
		if (value === undefined || newSignature === null) {
			setSignature(newSignature);
		}

		// Always notify parent
		if (onChange) {
			onChange(newSignature);
		}
	};

	// Initialize canvas with high resolution
	useEffect(() => {
		const setupCanvas = () => {
			const canvas = canvasRef.current;
			const container = containerRef.current;

			if (!canvas || !container) return;

			// Get container dimensions
			const rect = container.getBoundingClientRect();
			setCanvasSize({ width: rect.width, height: rect.height });

			// Set canvas CSS dimensions
			canvas.style.width = `${rect.width}px`;
			canvas.style.height = `${rect.height}px`;

			// Set canvas internal dimensions for high resolution
			canvas.width = rect.width * settings.resolutionMultiplier;
			canvas.height = rect.height * settings.resolutionMultiplier;

			// Set up canvas context
			const ctx = canvas.getContext("2d");
			if (ctx) {
				// Scale all drawing operations by the resolution multiplier
				ctx.scale(settings.resolutionMultiplier, settings.resolutionMultiplier);

				// Set line properties for smoother lines
				ctx.lineWidth = settings.baseLineWidth;
				ctx.lineCap = "round";
				ctx.lineJoin = "round";
				//#000000
				ctx.strokeStyle = theme === "dark" ? "#ffffff" : "#000000";
			}

			// Redraw the signature
			redrawSignature();
		};

		setupCanvas();

		// Handle resize
		const resizeObserver = new ResizeObserver(() => {
			setupCanvas();
		});

		if (containerRef.current) {
			resizeObserver.observe(containerRef.current);
		}

		return () => {
			resizeObserver.disconnect();
		};
	}, [signature, settings]);

	// SVG import handlers
	const handleSvgTextImport = () => {
		try {
			setImportError(null);

			if (!svgString.trim()) {
				setImportError("Please enter SVG content");
				return;
			}

			const result = svgStringToSignature(svgString, { targetWidth });

			if (!result) {
				setImportError("Could not extract path data from the SVG");
				return;
			}

			updateSignature(result);
			setIsImportDialogOpen(false);
			setSvgString("");
		} catch (err) {
			setImportError(`Error importing SVG: ${err instanceof Error ? err.message : String(err)}`);
		}
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		try {
			setImportError(null);

			const file = event.target.files?.[0];
			if (!file) {
				return;
			}

			// Check file extension
			const fileExtension = file.name.split(".").pop()?.toLowerCase();

			if (fileExtension === "svg") {
				// Handle SVG file
				const reader = new FileReader();

				reader.onload = (e) => {
					try {
						const svgContent = e.target?.result as string;
						setSvgString(svgContent);

						const result = svgStringToSignature(svgContent, { targetWidth });

						if (!result) {
							setImportError("Could not extract path data from the SVG file");
							return;
						}

						updateSignature(result);
						setIsImportDialogOpen(false);
						setSvgString("");
					} catch (err) {
						setImportError(`Error processing SVG file: ${err instanceof Error ? err.message : String(err)}`);
					}
				};

				reader.onerror = () => {
					setImportError("Error reading the file");
				};

				reader.readAsText(file);
			} else if (fileExtension === "medisign") {
				// Handle .medisign file
				const reader = new FileReader();

				reader.onload = (e) => {
					try {
						const content = e.target?.result as string;
						const signatureData = JSON.parse(content) as VectorSignature;

						// Validate the signature data
						if (!signatureData || !signatureData.paths || !Array.isArray(signatureData.paths)) {
							setImportError("Invalid .medisign file format");
							return;
						}

						updateSignature(signatureData);
						setIsImportDialogOpen(false);
					} catch (err) {
						setImportError(`Error processing .medisign file: ${err instanceof Error ? err.message : String(err)}`);
					}
				};

				reader.onerror = () => {
					setImportError("Error reading the file");
				};

				reader.readAsText(file);
			} else {
				setImportError("Unsupported file format. Please upload an SVG or .medisign file.");
			}
		} catch (err) {
			setImportError(`Error uploading file: ${err instanceof Error ? err.message : String(err)}`);
		}
	};

	// Download signature as .medisign file
	const downloadSignature = () => {
		if (!signature) return;

		try {
			// Create a JSON string of the signature data
			const signatureJson = JSON.stringify(signature, null, 2);

			// Create a blob with the data
			const blob = new Blob([signatureJson], { type: "application/json" });

			// Create a URL for the blob
			const url = URL.createObjectURL(blob);

			// Create a temporary anchor element
			const a = document.createElement("a");
			a.href = url;
			a.download = "signature.medisign";

			// Append to the document, click, and remove
			document.body.appendChild(a);
			a.click();

			// Clean up
			setTimeout(() => {
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}, 100);
		} catch (err) {
			console.error("Error downloading signature:", err);
		}
	};

	// Rest of the component remains the same...

	// Redraw the signature
	const redrawSignature = () => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");

		if (!canvas || !ctx) return;

		// Clear the canvas
		ctx.clearRect(0, 0, canvas.width / settings.resolutionMultiplier, canvas.height / settings.resolutionMultiplier);

		// Draw all paths in the signature if it exists
		if (signature) {
			signature.paths.forEach((path) => {
				if (path.length < 2) return;
				drawSuperSmoothPath(ctx, path);
			});
		}

		// Always draw the current path, even if signature is null
		if (pointsRef.current.length >= 2) {
			drawSuperSmoothPath(ctx, pointsRef.current);
		}
	};

	// Calculate control points for a cubic bezier curve
	const calculateControlPoints = (p1: Point, p2: Point, p3: Point): [Point, Point] => {
		// Tension controls how tight the curve is (0.0 to 1.0)
		const tension = 0.12; // Reduced from 0.15 for smoother curves

		// Calculate the distance between points
		const d1 = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
		const d2 = Math.sqrt(Math.pow(p3.x - p2.x, 2) + Math.pow(p3.y - p2.y, 2));

		// Calculate scaling factors for control points
		const scale1 = (tension * d1) / (d1 + d2);
		const scale2 = (tension * d2) / (d1 + d2);

		// Calculate control point 1
		const cp1 = {
			x: p2.x - scale1 * (p3.x - p1.x),
			y: p2.y - scale1 * (p3.y - p1.y),
		};

		// Calculate control point 2
		const cp2 = {
			x: p2.x + scale2 * (p3.x - p1.x),
			y: p2.y + scale2 * (p3.y - p1.y),
		};

		return [cp1, cp2];
	};

	// Draw a super smooth path with the given points using cubic bezier curves
	const drawSuperSmoothPath = (ctx: CanvasRenderingContext2D, points: Point[]) => {
		if (points.length < 2) return;

		// For very short paths, just draw a line
		if (points.length === 2) {
			ctx.beginPath();
			ctx.moveTo(points[0].x, points[0].y);

			// Set consistent line width
			ctx.lineWidth = points[0].width || settings.baseLineWidth;

			ctx.lineTo(points[1].x, points[1].y);
			ctx.stroke();
			return;
		}

		// Create a copy of the points array with additional padding points
		const paddedPoints = [
			// Add a point before the first point by extending the line from p0 to p1 backwards
			{
				x: points[0].x - (points[1].x - points[0].x),
				y: points[0].y - (points[1].y - points[0].y),
				width: points[0].width,
			},
			...points,
			// Add a point after the last point by extending the line from pn-1 to pn forwards
			{
				x: points[points.length - 1].x + (points[points.length - 1].x - points[points.length - 2].x),
				y: points[points.length - 1].y + (points[points.length - 1].y - points[points.length - 2].y),
				width: points[points.length - 1].width,
			},
		];

		// Start the path
		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);

		// For each segment (except the first and last padding segments)
		for (let i = 1; i < paddedPoints.length - 2; i++) {
			// Get the current point and the next point
			const p1 = paddedPoints[i];
			const p2 = paddedPoints[i + 1];

			// Set consistent line width - use the width property if available
			ctx.lineWidth = p1.width || settings.baseLineWidth;

			// Calculate control points for a smooth curve
			const [cp1, cp2] = calculateControlPoints(paddedPoints[i - 1], p1, p2);

			// Draw a cubic bezier curve
			ctx.bezierCurveTo(
				cp1.x,
				cp1.y, // First control point
				cp2.x,
				cp2.y, // Second control point
				p2.x,
				p2.y // End point
			);
		}

		// Stroke the path
		ctx.stroke();
	};

	// Calculate velocity between two points
	const calculateVelocity = (p1: Point, p2: Point): number => {
		if (!p1.time || !p2.time) return 0;

		const dx = p2.x - p1.x;
		const dy = p2.y - p1.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		const timeElapsed = p2.time - p1.time;

		return distance / (timeElapsed || 1); // Avoid division by zero
	};

	// Apply adaptive smoothing to a point based on velocity
	const smoothPoint = (newPoint: Point, lastPoint: Point | null): Point => {
		if (!lastPoint) return newPoint;

		// Calculate velocity
		const velocity = calculateVelocity(lastPoint, newPoint);

		// Apply adaptive smoothing - less smoothing for slow movements, more for fast
		// Map velocity to a smoothing factor between min and max

		// Normalize velocity to a 0-1 range (capped at a reasonable maximum)
		const normalizedVelocity = Math.min(velocity / settings.velocitySensitivity, 1);

		// Calculate smoothing factor - more smoothing for faster movements
		const adaptiveSmoothingFactor = settings.minSmoothingFactor + (settings.maxSmoothingFactor - settings.minSmoothingFactor) * normalizedVelocity;

		// Apply smoothing to coordinates
		const smoothedPoint: Point = {
			x: lastPoint.x + (newPoint.x - lastPoint.x) * (1 - adaptiveSmoothingFactor),
			y: lastPoint.y + (newPoint.y - lastPoint.y) * (1 - adaptiveSmoothingFactor),
			time: newPoint.time,
			pressure: newPoint.pressure,
			velocity: velocity,
		};

		// Calculate a consistent line width with minimal variation
		const widthVariation = settings.maxLineWidth - settings.minLineWidth;

		// Normalize velocity (0 to 1) with a very small effect
		const normalizedWidthVelocity = Math.min(velocity / settings.velocitySensitivity, 1);

		// Calculate width: slower = slightly thicker
		const targetWidth = settings.maxLineWidth - widthVariation * normalizedWidthVelocity;

		// Smooth the width changes to avoid fluctuation
		const widthSmoothingFactor = 0.98;
		const smoothedWidth = lastWidthRef.current * widthSmoothingFactor + targetWidth * (1 - widthSmoothingFactor);

		// Update the last width
		lastWidthRef.current = smoothedWidth;

		// Add the width to the point
		smoothedPoint.width = smoothedWidth;

		return smoothedPoint;
	};

	// Generate additional points between two points for smoother curves
	const interpolatePoints = (p1: Point, p2: Point, velocity: number): Point[] => {
		// Calculate adaptive interpolation points based on velocity
		const normalizedVelocity = Math.min(velocity / settings.velocitySensitivity, 1);

		// Calculate number of points - fewer for slow, more for fast
		const numPoints = Math.round(settings.minInterpolationPoints + (settings.maxInterpolationPoints - settings.minInterpolationPoints) * normalizedVelocity);

		const points: Point[] = [];

		// Calculate time difference for interpolated points
		const timeDiff = p2.time && p1.time ? (p2.time - p1.time) / (numPoints + 1) : 0;

		for (let i = 0; i <= numPoints; i++) {
			const t = i / numPoints;
			const newTime = p1.time && timeDiff ? p1.time + timeDiff * i : undefined;

			// Interpolate width as well
			const width = p1.width !== undefined && p2.width !== undefined ? p1.width + (p2.width - p1.width) * t : undefined;

			points.push({
				x: p1.x + (p2.x - p1.x) * t,
				y: p1.y + (p2.y - p1.y) * t,
				time: newTime,
				pressure: p1.pressure,
				width: width,
			});
		}

		return points;
	};

	// Get point from event
	const getPointFromEvent = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point | null => {
		const canvas = canvasRef.current;
		if (!canvas) return null;

		const rect = canvas.getBoundingClientRect();
		const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
		const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

		return {
			x: clientX - rect.left,
			y: clientY - rect.top,
			time: Date.now(),
			pressure: "touches" in e && (e.touches[0] as any).force ? (e.touches[0] as any).force : 0.5,
			width: settings.baseLineWidth, // Default width
		};
	};

	// Start drawing
	const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
		if (readOnly) return;
		e.preventDefault();

		// Clear the current points
		pointsRef.current = [];
		lastPointRef.current = null;
		lastWidthRef.current = settings.baseLineWidth;

		// Get the starting point
		const point = getPointFromEvent(e);
		if (!point) return;

		// Add the point to the current path
		pointsRef.current.push(point);
		lastPointRef.current = point;

		setIsDrawing(true);
	};

	// Draw with adaptive interpolation based on velocity
	const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
		if (!isDrawing || readOnly) return;

		e.preventDefault();

		// Get the current point
		const rawPoint = getPointFromEvent(e);
		if (!rawPoint) return;

		// Get the last point
		const lastPoint = lastPointRef.current;

		// Apply adaptive smoothing for more natural curves
		const smoothedPoint = smoothPoint(rawPoint, lastPoint);

		// If the points are too close, skip to avoid jitter
		if (lastPoint) {
			const dx = Math.abs(smoothedPoint.x - lastPoint.x);
			const dy = Math.abs(smoothedPoint.y - lastPoint.y);
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < 0.5) return;

			// If the distance is significant, add interpolated points for smoother curves
			if (distance > 5 && pointsRef.current.length > 0) {
				// Calculate velocity
				const velocity = calculateVelocity(lastPoint, smoothedPoint);

				// Add interpolated points with adaptive count based on velocity
				const interpolatedPoints = interpolatePoints(lastPoint, smoothedPoint, velocity);

				// Add all interpolated points
				interpolatedPoints.forEach((point) => {
					pointsRef.current.push(point);
				});
			}
		}

		// Add the smoothed point to the current path
		pointsRef.current.push(smoothedPoint);
		lastPointRef.current = smoothedPoint;

		// Redraw the signature
		redrawSignature();
	};

	// Stop drawing and add the current path to the signature
	const stopDrawing = () => {
		if (!isDrawing || readOnly) return;

		setIsDrawing(false);

		// Add the current path to the signature if it has at least 2 points
		if (pointsRef.current.length >= 2) {
			// Create a new signature with the current path added
			const newPaths = signature ? [...signature.paths] : [];
			newPaths.push([...pointsRef.current]);

			const newSignature: VectorSignature = {
				paths: newPaths,
				width: canvasSize.width,
				height: canvasSize.height,
				settings: settings,
			};

			// Update the signature
			updateSignature(newSignature);
		}

		// Clear the current path
		pointsRef.current = [];
		lastPointRef.current = null;
	};

	// Clear signature
	const clearSignature = () => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");

		if (!canvas || !ctx) return;

		ctx.clearRect(0, 0, canvas.width / settings.resolutionMultiplier, canvas.height / settings.resolutionMultiplier);

		// Clear all paths
		pointsRef.current = [];
		lastPointRef.current = null;
		lastWidthRef.current = settings.baseLineWidth;

		// Update the signature
		updateSignature(null);
	};

	// Prevent touch scrolling
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const preventScroll = (e: TouchEvent) => {
			e.preventDefault();
		};

		canvas.addEventListener("touchstart", preventScroll, { passive: false });
		canvas.addEventListener("touchmove", preventScroll, { passive: false });

		return () => {
			canvas.removeEventListener("touchstart", preventScroll);
			canvas.removeEventListener("touchmove", preventScroll);
		};
	}, []);

	return (
		<div ref={containerRef} className="border border-gray-300 rounded-md overflow-hidden relative w-[400px] h-[200px]">
			<canvas
				ref={canvasRef}
				className={`w-full h-full touch-none ${readOnly ? "cursor-default" : "cursor-crosshair"}`}
				onMouseDown={startDrawing}
				onMouseMove={draw}
				onMouseUp={stopDrawing}
				onMouseOut={stopDrawing}
				onTouchStart={startDrawing}
				onTouchMove={draw}
				onTouchEnd={stopDrawing}
			/>

			{!readOnly && (
				<div className="absolute left-1 bottom-1 z-10 flex gap-1">
					<Button type="button" size="icon" variant="outline" className="rounded-full" onClick={clearSignature}>
						<Eraser className="w-4 h-4 text-muted-foreground hover:text-primary" />
					</Button>

					{allowSvgImport && (
						<Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
							<DialogTrigger asChild>
								<Button type="button" size="icon" variant="outline" className="rounded-full">
									<Upload className="w-4 h-4 text-muted-foreground hover:text-primary" />
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[425px]">
								<DialogHeader>
									<DialogTitle>Import Signature</DialogTitle>
								</DialogHeader>

								<div className="py-4">
									<Tabs defaultValue="upload" className="w-full">
										<TabsList className="grid grid-cols-2 w-full">
											<TabsTrigger value="upload">Upload File</TabsTrigger>
											<TabsTrigger value="paste">Paste SVG</TabsTrigger>
										</TabsList>

										<TabsContent value="upload" className="mt-4">
											<div className="space-y-4">
												<div className="grid w-full items-center gap-1.5">
													<Label htmlFor="signature-file">Signature File</Label>
													<Input id="signature-file" type="file" accept=".svg,.medisign" ref={fileInputRef} onChange={handleFileUpload} />
													<p className="text-xs text-muted-foreground">Supported formats: SVG, .medisign</p>
												</div>
											</div>
										</TabsContent>

										<TabsContent value="paste" className="mt-4">
											<div className="space-y-4">
												<div className="grid w-full gap-1.5">
													<Label htmlFor="svg-content">SVG Content</Label>
													<Textarea id="svg-content" value={svgString} onChange={(e) => setSvgString(e.target.value)} placeholder="Paste SVG content here..." className="min-h-[100px]" />
												</div>

												<Button onClick={handleSvgTextImport}>Import SVG</Button>
											</div>
										</TabsContent>
									</Tabs>

									<div className="mt-4">
										<div className="flex justify-between mb-2">
											<Label htmlFor="target-width">Target Width</Label>
											<span className="text-sm text-muted-foreground">{targetWidth}px</span>
										</div>
										<div className="flex items-center gap-2">
											<Slider id="target-width" min={100} max={400} step={10} value={[targetWidth]} onValueChange={(value) => setTargetWidth(value[0])} />
											<Input type="number" className="w-20" value={targetWidth} onChange={(e) => setTargetWidth(Number(e.target.value))} min={100} max={400} />
										</div>
									</div>

									{importError && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{importError}</div>}
								</div>
							</DialogContent>
						</Dialog>
					)}

					{allowDownload && signature && (
						<Button type="button" size="icon" variant="outline" className="rounded-full" onClick={downloadSignature} title="Download signature as .medisign file">
							<Download className="w-4 h-4 text-muted-foreground hover:text-primary" />
						</Button>
					)}
				</div>
			)}

			{/* Add hidden input field for form integration */}
			{name && <input type="hidden" name={name} value={signature ? JSON.stringify(signature) : ""} />}
		</div>
	);
}
