"use client";

import { categoryColor } from "@/app/utils/categories";
import { ShoppingBag, SquarePen, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface Product {
	id: string;
	name: string;
	category: string;
	sellingPrice: number;
}

interface ProductListProps {
	loading: boolean;
	filtered: Product[];
	onEdit: (product: Product) => void;
	onDelete: (id: string) => void;
}

export function ProductList({
	loading,
	filtered,
	onEdit,
	onDelete,
}: ProductListProps) {
	if (loading) {
		return (
			<div className="flex flex-col gap-3">
				{[1, 2, 3].map((i) => (
					<div key={i} className="h-20 animate-pulse rounded-xl bg-[#2C5F14]/10" />
				))}
			</div>
		);
	}

	return (
		<>
			<ul className="flex flex-col gap-3">
				<AnimatePresence mode="popLayout">
					{filtered.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
							onEdit={onEdit}
							onDelete={onDelete}
						/>
					))}
				</AnimatePresence>
			</ul>

			{filtered.length === 0 && (
				<div className="py-20 text-center">
					<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#2C5F14]/10">
						<ShoppingBag
							size={20}
							strokeWidth={1.5}
							className="text-zinc-400"
						/>
					</div>
					<p className="text-sm text-[#2C5F14]/40">No products found.</p>
				</div>
			)}
		</>
	);
}

function ProductCard({
	product,
	onEdit,
	onDelete,
}: {
	product: Product;
	onEdit: (product: Product) => void;
	onDelete: (id: string) => void;
}) {
	const [confirming, setConfirming] = useState(false);

	return (
		<motion.li
			layout
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: 100 }}
			transition={{ duration: 0.2 }}
			className="flex items-center gap-3 rounded-xl border border-[#2C5F14]/15 bg-[#FBF8E9] px-4 py-3.5 shadow-sm hover:border-[#2C5F14]/25"
		>
			{/* Icon */}
			<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2C5F14]/10 text-[#2C5F14]">
				<ShoppingBag size={16} strokeWidth={1.8} />
			</div>

			{/* Info */}
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium text-blue-950">
					{product.name}
				</p>
				<span
					className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor(product.category)}`}
				>
					{product.category}
				</span>
			</div>

			{/* Price */}
			<div className="shrink-0 text-right">
				<p className="text-base font-semibold text-blue-950">
					₱{product.sellingPrice.toFixed(2)}
				</p>
			</div>

			{/* Edit */}
			<button
				onClick={() => onEdit(product)}
				className="shrink-0 rounded-md p-1.5 text-[#2C5F14]/40 transition hover:bg-[#2C5F14]/10 hover:text-[#2C5F14]"
				aria-label="Edit product"
			>
				<SquarePen size={15} />
			</button>

			{/* Delete */}
			{confirming ? (
				<div className="flex shrink-0 items-center gap-1">
					<button
						onClick={() => {
							setConfirming(false);
							onDelete(product.id);
						}}
						className="rounded-md bg-red-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-red-600"
					>
						Delete
					</button>
					<button
						onClick={() => setConfirming(false)}
						className="rounded-md border border-[#2C5F14]/20 px-2.5 py-1 text-xs font-medium text-[#2C5F14] transition hover:border-[#2C5F14]/40"
					>
						No
					</button>
				</div>
			) : (
				<button
					onClick={() => setConfirming(true)}
					className="shrink-0 rounded-md p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
					aria-label="Delete product"
				>
					<Trash2 size={15} />
				</button>
			)}
		</motion.li>
	);
}
