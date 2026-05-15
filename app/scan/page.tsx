import { ScanLine } from "lucide-react";
import QrScanner from "./_components/QrScanner";

export default function ScanPage() {
	return (
		<div className="flex min-h-dvh flex-col bg-[#FBF8E9]">
			{/* Header */}
			<header className="flex items-center gap-3 px-6 py-5 border-b border-[#2C5F14]/10">
				<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2C5F14]">
					<ScanLine className="h-5 w-5 text-white" />
				</div>
				<div>
					<h1 className="text-base font-semibold text-[#2C5F14] leading-tight">
						QR Scanner
					</h1>
					<p className="text-xs text-[#2C5F14]/50">
						Scan product barcodes &amp; QR codes
					</p>
				</div>
			</header>

			{/* Body */}
			<main className="flex flex-1 flex-col px-6 py-6 gap-4 max-w-md mx-auto w-full">
				{/* Instructions */}
				<div className="rounded-2xl bg-white/70 border border-[#2C5F14]/10 px-4 py-3">
					<ol className="list-decimal list-inside text-sm text-[#2C5F14]/70 space-y-1">
						<li>
							Tap <strong className="text-[#2C5F14]">Start Scanning</strong> and
							allow camera access.
						</li>
						<li>Point your camera at any product QR code or barcode.</li>
						<li>The result will appear automatically below the viewfinder.</li>
					</ol>
				</div>

				<QrScanner />
			</main>
		</div>
	);
}
