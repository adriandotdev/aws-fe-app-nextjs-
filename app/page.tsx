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
		<div className="flex min-h-screen items-center justify-center bg-zinc-50">
			<div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
				<div className="mb-8 text-center">
					<div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-white"
						>
							<path d="M9 11l3 3L22 4" />
							<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
						</svg>
					</div>
					<h1 className="text-xl font-semibold tracking-tight text-zinc-900">
						Task Manager
					</h1>
					<p className="mt-1.5 text-sm text-zinc-500">
						Sign in to manage your tasks.
					</p>
				</div>

				<button
					onClick={() => auth.signinRedirect()}
					className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
				>
					Sign in with Cognito
				</button>
			</div>
		</div>
	);
}
