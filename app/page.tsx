"use client";

import { MoreVertical, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
// import { useAuth } from "react-oidc-context";
import {
	InstallPromptDialog,
	useInstallPrompt,
} from "./components/install-prompt";

export default function Home() {
	// const auth = useAuth();
	const router = useRouter();
	const { isIOS, isStandalone, isOpen, setIsOpen, handleInstall } =
		useInstallPrompt();
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// useEffect(() => {
	// 	if (!auth.isLoading && auth.isAuthenticated) {
	// 		router.replace("/products");
	// 	}
	// }, [auth.isLoading, auth.isAuthenticated, router]);

	useEffect(() => {
		function onClickOutside(e: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setMenuOpen(false);
			}
		}
		if (menuOpen) document.addEventListener("mousedown", onClickOutside);
		return () => document.removeEventListener("mousedown", onClickOutside);
	}, [menuOpen]);

	// if (auth.isLoading || auth.isAuthenticated) {
	// 	return (
	// 		<div className="flex min-h-screen items-center justify-center bg-[#FBF8E9]">
	// 			<p className="text-sm text-[#2C5F14]/50">Loading…</p>
	// 		</div>
	// 	);
	// }

	return (
		<div className="flex h-dvh flex-col bg-[#FBF8E9] px-6 overflow-hidden">
			{/* Top section — logo & copy */}
			<div className="flex flex-1 flex-col items-center justify-center text-center">
				<motion.div
					initial={{ opacity: 0, scale: 0.6 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					<Image
						src={"/suki-bg.png"}
						width={100}
						height={100}
						alt="App logo"
						priority
					/>
				</motion.div>
				<motion.h1
					className="font-akaya text-8xl text-blue-950"
					initial={{ opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
				>
					Suki
				</motion.h1>
				<motion.p
					className="text-sm font-semibold font-sans max-w-md text-[#2C5F14]"
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
				>
					I-stock. I-track. Kumita.
				</motion.p>
			</div>

			{/* Bottom section — CTA */}
			<motion.div
				className="pb-10 pt-6"
				initial={{ opacity: 0, y: 32 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
			>
				<button
					onClick={() => router.replace("/products")}
					className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2C5F14] px-4 py-4 text-base font-semibold text-white transition active:scale-95"
				>
					Sign In
				</button>
			</motion.div>

			{/* ⋯ overflow menu — top right */}
			{!isStandalone && (
				<div ref={menuRef} className="fixed top-4 right-4 z-40">
					<button
						onClick={() => setMenuOpen((v) => !v)}
						className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2C5F14]/20 bg-[#FBF8E9] text-[#2C5F14] shadow-sm transition hover:border-[#2C5F14]/40"
						aria-label="More options"
					>
						<MoreVertical size={16} />
					</button>

					{menuOpen && (
						<div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-[#2C5F14]/20 bg-[#FBF8E9] py-1 shadow-lg">
							<button
								onClick={() => {
									setIsOpen(true);
									setMenuOpen(false);
								}}
								className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-[#2C5F14] hover:bg-[#2C5F14]/5"
							>
								<Smartphone size={14} className="text-[#2C5F14]/50" />
								Install app
							</button>
						</div>
					)}
				</div>
			)}

			<InstallPromptDialog
				isOpen={isOpen}
				isIOS={isIOS}
				onClose={() => setIsOpen(false)}
				onInstall={handleInstall}
			/>
		</div>
	);
}
