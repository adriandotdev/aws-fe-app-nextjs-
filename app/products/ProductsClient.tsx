"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { ProductsPageContent } from "./_components/ProductsPageContent";

export default function ProductsClient() {
	const auth = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!auth.isLoading && !auth.isAuthenticated) {
			router.replace("/");
		}
	}, [auth.isLoading, auth.isAuthenticated, router]);

	const signOutRedirect = () => {
		const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
		const logoutUri = process.env.NEXT_PUBLIC_COGNITO_LOGOUT_URI as string;
		const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
		auth.removeUser();
		window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
	};

	if (auth.isLoading || !auth.isAuthenticated) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-zinc-50">
				<p className="text-sm text-zinc-400">Loading…</p>
			</div>
		);
	}

	return <ProductsPageContent onSignOut={signOutRedirect} />;
}
