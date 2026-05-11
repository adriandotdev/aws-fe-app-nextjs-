"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { InstallPrompt } from "./components/install-prompt";

export default function Home() {
	const auth = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!auth.isLoading && auth.isAuthenticated) {
			router.replace("/products");
		}
	}, [auth.isLoading, auth.isAuthenticated, router]);

	if (auth.isLoading || auth.isAuthenticated) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-zinc-50">
				<p className="text-sm text-zinc-400">Loading…</p>
			</div>
		);
	}

	return (
		<div className="flex h-dvh flex-col bg-white px-6">
			{/* Top section — logo & copy */}
			<div className="flex flex-1 flex-col items-center justify-center text-center">
				<Image
					src={"/logo.png"}
					width={250}
					height={250}
					alt="App logo"
					priority
				/>
				<h1 className="text-2xl font-bold tracking-tight text-zinc-900">
					Product Manager
				</h1>
				<p className="mt-2 max-w-xs text-sm text-zinc-500">
					Track and manage your inventory in one place.
				</p>
			</div>

			{/* Bottom section — CTA */}
			<div className="pb-10 pt-6">
				<button
					onClick={() => auth.signinRedirect()}
					className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-4 text-base font-semibold text-white transition active:scale-95"
				>
					Sign In
				</button>
			</div>
			<div className="fixed top-4 right-4 z-40">
				<InstallPrompt />
			</div>
		</div>
	);
}
