"use client";

import { ReceiptText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Transaction, TransactionCard } from "./TransactionCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function TransactionClientPage() {
	const auth = useAuth();
	const router = useRouter();
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!auth.isLoading && !auth.isAuthenticated) {
			router.replace("/");
		}
	}, [auth.isLoading, auth.isAuthenticated, router]);

	const fetchTransactions = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`${API_BASE}/transactions`);
			if (!res.ok) throw new Error();
			const data = await res.json();
			const list: Transaction[] = Array.isArray(data)
				? data
				: Array.isArray(data?.transactions)
					? data.transactions
					: [];
			// Sort newest first
			list.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			);
			setTransactions(list);
		} catch {
			setError("Could not load transactions.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		fetchTransactions();
	}, [fetchTransactions]);

	if (auth.isLoading || !auth.isAuthenticated) {
		return (
			<div className="flex min-h-dvh items-center justify-center bg-[#FBF8E9]">
				<p className="text-sm text-[#2C5F14]/40">Loading…</p>
			</div>
		);
	}

	return (
		<div className="h-dvh overflow-y-auto bg-[#FBF8E9]">
			<div className="mx-auto max-w-2xl px-4 pb-16 pt-8">
				{/* Header */}
				<div className="mb-6 flex items-start gap-4">
					<div>
						<h1 className="text-2xl font-semibold tracking-tight text-blue-950">
							Transactions
						</h1>
						<p className="mt-0.5 text-sm text-[#2C5F14]/60">
							{loading
								? "Loading…"
								: `${transactions.length} record${transactions.length !== 1 ? "s" : ""}`}
						</p>
					</div>
				</div>

				{/* Error */}
				{error && (
					<div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{error}
						<button
							onClick={() => setError(null)}
							className="ml-4 shrink-0 text-red-400 hover:text-red-600"
							aria-label="Dismiss"
						>
							✕
						</button>
					</div>
				)}

				{/* List */}
				{loading ? (
					<div className="flex flex-col gap-3">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-20 animate-pulse rounded-xl bg-[#2C5F14]/10"
							/>
						))}
					</div>
				) : transactions.length === 0 ? (
					<div className="py-20 text-center">
						<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#2C5F14]/10">
							<ReceiptText
								size={20}
								strokeWidth={1.5}
								className="text-[#2C5F14]/40"
							/>
						</div>
						<p className="text-sm text-[#2C5F14]/40">No transactions yet.</p>
					</div>
				) : (
					<ul className="flex flex-col gap-3">
						{transactions.map((tx) => (
							<li key={tx.id}>
								<TransactionCard tx={tx} />
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
