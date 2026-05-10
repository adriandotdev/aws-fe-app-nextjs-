"use client";

import { useAuth } from "react-oidc-context";
import TaskApp from "./components/TaskApp";

export default function Home() {
	const auth = useAuth();

	const signOutRedirect = () => {
		const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
		const logoutUri = process.env.NEXT_PUBLIC_COGNITO_LOGOUT_URI as string;
		const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
		auth.removeUser();
		window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
	};

	if (auth.isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-zinc-50">
				<p className="text-sm text-zinc-400">Loading…</p>
			</div>
		);
	}

	if (auth.isAuthenticated) return <TaskApp onSignOut={signOutRedirect} />;

	return (
		<div className="flex min-h-screen flex-col bg-white px-6">
			{/* Top section — logo & copy */}
			<div className="flex flex-1 flex-col items-center justify-center text-center">
				<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="28"
						height="28"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="text-white"
					>
						<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
						<line x1="3" y1="6" x2="21" y2="6" />
						<path d="M16 10a4 4 0 0 1-8 0" />
					</svg>
				</div>
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
		</div>
	);
}
