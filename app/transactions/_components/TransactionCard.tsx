"use client";

import { formatDate } from "@/app/utils/date";
import { ChevronDown, ChevronUp, ReceiptText } from "lucide-react";
import { useState } from "react";

interface CartItem {
	id: string;
	name: string;
	category: string;
	sellingPrice: number;
	qty: number;
	createdAt: string;
}

export interface Transaction {
	id: string;
	totalSale: number;
	amountPaid: number;
	amountChange: number;
	totalCartItems: number;
	createdAt: string;
	cartItems?: CartItem[];
}

export function TransactionCard({ tx }: { tx: Transaction }) {
	const [expanded, setExpanded] = useState(false);
	const hasItems = tx.cartItems && tx.cartItems.length > 0;

	return (
		<div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
			<button
				onClick={() => hasItems && setExpanded((v) => !v)}
				className={`flex w-full items-start gap-3 px-4 py-3.5 text-left ${hasItems ? "cursor-pointer" : "cursor-default"}`}
			>
				<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100">
					<ReceiptText size={15} className="text-zinc-500" />
				</div>

				<div className="min-w-0 flex-1">
					<p className="text-sm font-medium text-zinc-900">
						₱{tx.totalSale.toFixed(2)}
					</p>
					<p className="mt-0.5 text-xs text-zinc-400">
						{formatDate(tx.createdAt)}
					</p>
				</div>

				<div className="shrink-0 text-right">
					<p className="text-xs text-zinc-500">
						{tx.totalCartItems} item{tx.totalCartItems !== 1 ? "s" : ""}
					</p>
					<p className="mt-0.5 text-xs text-zinc-800 font-semibold">
						Paid ₱{tx.amountPaid.toFixed(2)}
					</p>
					{tx.amountChange > 0 && (
						<p className="text-xs text-zinc-600 font-medium">
							Change ₱{tx.amountChange.toFixed(2)}
						</p>
					)}
				</div>

				{hasItems && (
					<div className="ml-2 mt-0.5 shrink-0 text-zinc-400">
						{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
					</div>
				)}
			</button>

			{expanded && hasItems && (
				<div className="border-t border-zinc-100 px-4 pb-3 pt-2">
					<ul className="flex flex-col gap-1.5">
						{tx.cartItems!.map((item) => (
							<li
								key={item.id}
								className="flex items-center justify-between text-sm"
							>
								<span className="text-zinc-700">
									{item.name}
									<span className="ml-1 text-xs text-zinc-400">
										×{item.qty}
									</span>
								</span>
								<span className="font-medium text-zinc-900">
									₱{(item.sellingPrice * item.qty).toFixed(2)}
								</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
