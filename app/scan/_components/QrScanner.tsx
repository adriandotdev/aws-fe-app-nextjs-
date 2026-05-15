"use client";

import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import {
	CheckCircle,
	Loader2,
	PackageSearch,
	RefreshCw,
	ScanLine,
	XCircle,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ScanStatus = "idle" | "scanning" | "success" | "error";
type LookupStatus = "idle" | "loading" | "found" | "not-found";

interface ProductInfo {
	name: string;
	brand: string;
	imageUrl: string | null;
	categories: string;
	nutriscoreGrade: string | null;
	barcode: string;
}

interface ScanResult {
	text: string;
	timestamp: Date;
}

// EAN-8, EAN-13, UPC-A, UPC-E, ITF-14
function isProductBarcode(text: string) {
	return /^\d{8,14}$/.test(text);
}

function isUrl(text: string) {
	try {
		new URL(text);
		return true;
	} catch {
		return false;
	}
}

const NUTRISCORE_COLOR: Record<string, string> = {
	a: "bg-green-500",
	b: "bg-lime-400",
	c: "bg-yellow-400",
	d: "bg-orange-400",
	e: "bg-red-500",
};

export default function QrScanner() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const controlsRef = useRef<IScannerControls | null>(null);
	const readerRef = useRef<BrowserMultiFormatReader | null>(null);

	const [status, setStatus] = useState<ScanStatus>("idle");
	const [result, setResult] = useState<ScanResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
	const [selectedCamera, setSelectedCamera] = useState<string | undefined>(
		undefined,
	);
	const [lookupStatus, setLookupStatus] = useState<LookupStatus>("idle");
	const [product, setProduct] = useState<ProductInfo | null>(null);

	// Look up barcode on Open Food Facts whenever a product barcode is scanned
	useEffect(() => {
		if (!result || !isProductBarcode(result.text)) return;
		const controller = new AbortController();
		fetch(
			`https://world.openfoodfacts.org/api/v0/product/${result.text}.json`,
			{ signal: controller.signal },
		)
			.then((r) => r.json())
			.then((data) => {
				if (data.status !== 1) {
					setLookupStatus("not-found");
					return;
				}
				const p = data.product;
				setProduct({
					name: p.product_name || p.product_name_en || "Unknown product",
					brand: p.brands || "Unknown brand",
					imageUrl: p.image_front_url || p.image_url || null,
					categories: (p.categories || "")
						.split(",")
						.slice(0, 3)
						.map((c: string) => c.trim())
						.filter(Boolean)
						.join(" · "),
					nutriscoreGrade: p.nutriscore_grade || null,
					barcode: result.text,
				});
				setLookupStatus("found");
			})
			.catch((e) => {
				if (e.name !== "AbortError") setLookupStatus("not-found");
			});
		return () => controller.abort();
	}, [result]);

	// Load available cameras
	useEffect(() => {
		BrowserMultiFormatReader.listVideoInputDevices().then((devices) => {
			setCameras(devices);
			// Prefer back camera on mobile
			const back = devices.find((d) => /back|rear|environment/i.test(d.label));
			setSelectedCamera(back?.deviceId ?? devices[0]?.deviceId);
		});
	}, []);

	const startScanning = async () => {
		if (!videoRef.current) return;
		setStatus("scanning");
		setResult(null);
		setError(null);
		setProduct(null);
		setLookupStatus("idle");

		try {
			readerRef.current = new BrowserMultiFormatReader();
			controlsRef.current = await readerRef.current.decodeFromVideoDevice(
				selectedCamera,
				videoRef.current,
				(res) => {
					if (res) {
						controlsRef.current?.stop();
						setResult({ text: res.getText(), timestamp: new Date() });
						setStatus("success");
					}
					// callback fires continuously — no-result case is ignored
				},
			);
		} catch (e: unknown) {
			const message =
				e instanceof Error ? e.message : "Camera access denied or unavailable.";
			setError(message);
			setStatus("error");
		}
	};

	const stopScanning = () => {
		controlsRef.current?.stop();
		controlsRef.current = null;
		setStatus("idle");
	};

	const reset = () => {
		stopScanning();
		setResult(null);
		setError(null);
		setProduct(null);
		setLookupStatus("idle");
	};

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			controlsRef.current?.stop();
		};
	}, []);

	return (
		<div className="flex flex-col gap-6">
			{/* Camera selector */}
			{cameras.length > 1 && (
				<div className="flex flex-col gap-1">
					<label className="text-xs font-medium text-[#2C5F14]/70 uppercase tracking-wide">
						Camera
					</label>
					<select
						className="w-full rounded-xl border border-[#2C5F14]/20 bg-white px-3 py-2 text-sm text-[#2C5F14] focus:outline-none focus:ring-2 focus:ring-[#2C5F14]/40"
						value={selectedCamera}
						onChange={(e) => {
							if (status === "scanning") stopScanning();
							setSelectedCamera(e.target.value);
						}}
					>
						{cameras.map((cam) => (
							<option key={cam.deviceId} value={cam.deviceId}>
								{cam.label || `Camera ${cam.deviceId.slice(0, 8)}`}
							</option>
						))}
					</select>
				</div>
			)}

			{/* Viewfinder */}
			<div className="relative overflow-hidden rounded-2xl bg-black aspect-square w-full max-w-sm mx-auto shadow-lg">
				<video
					ref={videoRef}
					className="h-full w-full object-cover"
					muted
					playsInline
				/>

				{/* Overlay when idle or success */}
				{status !== "scanning" && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/60">
						{status === "idle" && (
							<ScanLine className="h-16 w-16 text-white/40" strokeWidth={1} />
						)}
						{status === "success" && (
							<CheckCircle className="h-16 w-16 text-green-400" />
						)}
						{status === "error" && (
							<XCircle className="h-16 w-16 text-red-400" />
						)}
					</div>
				)}

				{/* Scanning corner brackets */}
				{status === "scanning" && (
					<>
						<span className="pointer-events-none absolute left-6 top-6 h-8 w-8 rounded-tl-lg border-l-4 border-t-4 border-white" />
						<span className="pointer-events-none absolute right-6 top-6 h-8 w-8 rounded-tr-lg border-r-4 border-t-4 border-white" />
						<span className="pointer-events-none absolute bottom-6 left-6 h-8 w-8 rounded-bl-lg border-b-4 border-l-4 border-white" />
						<span className="pointer-events-none absolute bottom-6 right-6 h-8 w-8 rounded-br-lg border-b-4 border-r-4 border-white" />
						{/* Animated scan line */}
						<span className="pointer-events-none absolute left-6 right-6 h-0.5 bg-[#7AC943] shadow-[0_0_8px_2px_#7AC943] animate-scan" />
					</>
				)}
			</div>

			{/* Action button */}
			<div className="flex justify-center">
				{status === "idle" && (
					<button
						onClick={startScanning}
						className="flex items-center gap-2 rounded-2xl bg-[#2C5F14] px-8 py-3 text-sm font-semibold text-white shadow-md active:scale-95 transition-transform"
					>
						<ScanLine className="h-4 w-4" />
						Start Scanning
					</button>
				)}
				{status === "scanning" && (
					<button
						onClick={stopScanning}
						className="flex items-center gap-2 rounded-2xl bg-red-500 px-8 py-3 text-sm font-semibold text-white shadow-md active:scale-95 transition-transform"
					>
						<XCircle className="h-4 w-4" />
						Stop
					</button>
				)}
				{(status === "success" || status === "error") && (
					<button
						onClick={reset}
						className="flex items-center gap-2 rounded-2xl bg-[#2C5F14] px-8 py-3 text-sm font-semibold text-white shadow-md active:scale-95 transition-transform"
					>
						<RefreshCw className="h-4 w-4" />
						Scan Again
					</button>
				)}
			</div>

			{/* Product lookup card (barcodes) */}
			{result && isProductBarcode(result.text) && (
				<div className="rounded-2xl border border-[#2C5F14]/15 bg-white shadow-sm overflow-hidden">
					{/* loading = effect is running but hasn't resolved yet */}
					{lookupStatus === "idle" && (
						<div className="flex items-center gap-3 px-4 py-5">
							<Loader2 className="h-5 w-5 animate-spin text-[#2C5F14]/50" />
							<p className="text-sm text-[#2C5F14]/60">Looking up product…</p>
						</div>
					)}
					{lookupStatus === "found" && product && (
						<div className="flex gap-4 p-4">
							<div className="relative h-24 w-24 shrink-0 rounded-xl overflow-hidden bg-gray-100">
								{product.imageUrl ? (
									<Image
										src={product.imageUrl}
										alt={product.name}
										fill
										className="object-contain"
										unoptimized
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center">
										<PackageSearch className="h-8 w-8 text-gray-300" />
									</div>
								)}
							</div>
							<div className="flex flex-col gap-1 min-w-0">
								<p className="font-semibold text-gray-900 leading-tight line-clamp-2">
									{product.name}
								</p>
								<p className="text-sm text-gray-500">{product.brand}</p>
								{product.categories && (
									<p className="text-xs text-gray-400 line-clamp-1">
										{product.categories}
									</p>
								)}
								<div className="flex items-center gap-2 mt-1">
									<span className="text-xs font-mono text-gray-400">
										{product.barcode}
									</span>
									{product.nutriscoreGrade && (
										<span
											className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold text-white uppercase ${NUTRISCORE_COLOR[product.nutriscoreGrade] ?? "bg-gray-400"}`}
										>
											{product.nutriscoreGrade}
										</span>
									)}
								</div>
							</div>
						</div>
					)}
					{lookupStatus === "not-found" && (
						<div className="flex items-center gap-3 px-4 py-5">
							<PackageSearch className="h-5 w-5 text-gray-400" />
							<div>
								<p className="text-sm font-medium text-gray-700">
									Product not found
								</p>
								<p className="text-xs text-gray-400">Barcode: {result.text}</p>
							</div>
						</div>
					)}
				</div>
			)}

			{/* QR / URL result card (non-barcode) */}
			{result && !isProductBarcode(result.text) && (
				<div className="rounded-2xl border border-green-200 bg-green-50 p-4 flex flex-col gap-2">
					<p className="text-xs font-semibold uppercase tracking-wide text-green-700">
						QR Code Detected
					</p>
					{isUrl(result.text) ? (
						<a
							href={result.text}
							target="_blank"
							rel="noopener noreferrer"
							className="break-all text-sm text-blue-600 underline underline-offset-2"
						>
							{result.text}
						</a>
					) : (
						<p className="break-all text-sm text-gray-800">{result.text}</p>
					)}
					<p className="text-xs text-gray-400">
						{result.timestamp.toLocaleTimeString()}
					</p>
				</div>
			)}

			{/* Error card */}
			{error && (
				<div className="rounded-2xl border border-red-200 bg-red-50 p-4">
					<p className="text-xs font-semibold uppercase tracking-wide text-red-600">
						Error
					</p>
					<p className="mt-1 text-sm text-red-700">{error}</p>
				</div>
			)}
		</div>
	);
}
