import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
export function useInstallPrompt() {
	const [isIOS, setIsIOS] = useState(false);
	const [isStandalone, setIsStandalone] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const deferredPrompt = useRef<any>(null);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsIOS(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream,
		);
		setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

		const handler = (e: Event) => {
			e.preventDefault();
			deferredPrompt.current = e;
		};
		window.addEventListener("beforeinstallprompt", handler);
		return () => window.removeEventListener("beforeinstallprompt", handler);
	}, []);

	async function handleInstall() {
		if (deferredPrompt.current) {
			deferredPrompt.current.prompt();
			await deferredPrompt.current.userChoice;
			deferredPrompt.current = null;
			setIsOpen(false);
		}
	}

	return { isIOS, isStandalone, isOpen, setIsOpen, handleInstall };
}

export function InstallPromptDialog({
	isOpen,
	isIOS,
	onClose,
	onInstall,
}: {
	isOpen: boolean;
	isIOS: boolean;
	onClose: () => void;
	onInstall: () => void;
}) {
	if (!isOpen) return null;
	//
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
			onClick={onClose}
		>
			<motion.div
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				className="relative w-full max-w-sm mx-4 rounded-2xl bg-[#FBF8E9] p-6 shadow-xl border border-[#2C5F14]/10"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-[#2C5F14]/40 hover:text-[#2C5F14] transition-colors"
					aria-label="Close"
				>
					✕
				</button>

				<h3 className="text-base font-semibold text-blue-950 mb-1">
					Install App
				</h3>
				<p className="text-sm text-[#2C5F14]/70 mb-5">
					Add this app to your home screen for quick access.
				</p>

				{isIOS ? (
					<p className="text-sm text-[#2C5F14] leading-relaxed">
						Tap the share button
						<span role="img" aria-label="share icon">
							{" "}
							⎋{" "}
						</span>
						in your browser, then tap &quot;Add to Home Screen&quot;
						<span role="img" aria-label="plus icon">
							{" "}
							➕{" "}
						</span>
						.
					</p>
				) : (
					<button
						onClick={onInstall}
						className="w-full rounded-lg bg-[#2C5F14] px-4 py-2.5 text-sm font-medium text-[#F5C012] hover:bg-[#245010] active:scale-95 transition-all"
					>
						Add to Home Screen
					</button>
				)}
			</motion.div>
		</div>
	);
}
