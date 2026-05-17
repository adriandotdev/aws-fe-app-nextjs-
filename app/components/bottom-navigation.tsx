"use client";
import { ReceiptText, ShoppingBag, ShoppingCart } from "lucide-react";

import { usePathname, useRouter } from "next/navigation";

const tabItems = [
	{
		icon: ShoppingBag,
		url: "/products",
		text: "Products",
	},
	{
		icon: ShoppingCart,
		url: "/products/buy",
		text: "Buy",
	},
	{
		icon: ReceiptText,
		url: "/transactions",
		text: "Transactions",
	},
];

export function BottomNavigation() {
	const path = usePathname();

	const router = useRouter();

	return (
		<div
			className="fixed left-0 right-0 bottom-0 min-h-17.5 rounded-tl-3xl rounded-tr-3xl bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex justify-evenly items-center px-6"
			style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
		>
			{tabItems.map((item, index) => {
				return (
					<button
						onClick={() => {
							router.push(item.url);
						}}
						key={index}
						className={`flex flex-col items-center gap-1 px-5 py-2 transition-all duration-200 ${
							path === item.url ? "text-[#2C5F14]" : "text-[#2C5F14]/30"
						}`}
					>
						<item.icon size={22} strokeWidth={path === item.url ? 2.5 : 1.8} />
						<span className="text-[11px] font-semibold">{item.text}</span>
					</button>
				);
			})}
		</div>
	);
}
