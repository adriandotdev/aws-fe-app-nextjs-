"use client";

// react-oidc-context (via AuthProvider in layout) automatically processes
// the ?code= and ?state= params when this page mounts, then calls
// onSigninCallback which redirects to "/".
export default function CognitoCallback() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
			<p className="text-sm text-zinc-500 dark:text-zinc-400">
				Signing you in…
			</p>
		</div>
	);
}
