"use client";

import { CATEGORIES, categoryColor } from "@/app/utils/categories";
import {
	ArrowLeftIcon,
	CheckCircle2,
	Minus,
	PackageOpen,
	Plus,
	Search,
	ShoppingCart,
	Trash2,
	X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useReducer, useState } from "react";
import { useAuth } from "react-oidc-context";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface Product {
	id: string;
	name: string;
	category: string;
	sellingPrice: number;
}

interface CartItem extends Product {
	qty: number;
}

type CartAction =
	| { type: "ADD"; product: Product }
	| { type: "REMOVE"; id: string }
	| { type: "INCREMENT"; id: string }
	| { type: "DECREMENT"; id: string }
	| { type: "CLEAR" };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
	switch (action.type) {
		case "ADD": {
			const existing = state.find((i) => i.id === action.product.id);
			if (existing) {
				return state.map((i) =>
					i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i,
				);
			}
			return [...state, { ...action.product, qty: 1 }];
		}
		case "INCREMENT":
			return state.map((i) =>
				i.id === action.id ? { ...i, qty: i.qty + 1 } : i,
			);
		case "DECREMENT":
			return state
				.map((i) => (i.id === action.id ? { ...i, qty: i.qty - 1 } : i))
				.filter((i) => i.qty > 0);
		case "REMOVE":
			return state.filter((i) => i.id !== action.id);
		case "CLEAR":
			return [];
		default:
			return state;
	}
}

export default function BuyPage() {
	const auth = useAuth();
	const router = useRouter();
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [activeCategory, setActiveCategory] = useState("All");
	const [cart, dispatch] = useReducer(cartReducer, []);
	const [cartOpen, setCartOpen] = useState(false);
	const [checkedOut, setCheckedOut] = useState(false);
	const [amountPaid, setAmountPaid] = useState("");
	const [creatingTransaction, setCreatingTransaction] = useState(false);

	const onCartClose = () => {
		setCartOpen(false);
		setAmountPaid("");
	};

	async function createNewTransaction(e: React.MouseEvent) {
		e.preventDefault();

		setCreatingTransaction(true);
		try {
			const res = await fetch(`${API_BASE}/transactions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					totalCartItems: cartCount,
					totalSale: cartTotal,
					amountPaid: +amountPaid,
					cartItems: JSON.stringify(cart),
				}),
			});
			if (!res.ok) throw new Error();
			setAmountPaid("");
		} catch {
			setError("Failed to create product.");
		} finally {
			setCreatingTransaction(false);
		}
	}

	const fetchProducts = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`${API_BASE}/products`);
			if (!res.ok) throw new Error();
			const data = await res.json();
			const list: Product[] = Array.isArray(data)
				? data
				: Array.isArray(data?.products)
					? data.products
					: [];
			setProducts(list);
		} catch {
			setError("Could not load products.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		fetchProducts();
	}, [fetchProducts]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		if (cart.length === 0) onCartClose();
	}, [cart.length]);
	const filtered = products.filter((p) => {
		const matchCat = activeCategory === "All" || p.category === activeCategory;
		const matchSearch =
			!search || p.name.toLowerCase().includes(search.toLowerCase());
		return matchCat && matchSearch;
	});

	useEffect(() => {
		if (!auth.isLoading && !auth.isAuthenticated) {
			router.replace("/");
		}
	}, [auth.isLoading, auth.isAuthenticated, router]);

	const usedCategories = [
		"All",
		...CATEGORIES.filter(
			(c) => c !== "All" && products.some((p) => p.category === c),
		),
	];

	const cartTotal = cart.reduce((sum, i) => sum + i.sellingPrice * i.qty, 0);
	const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

	async function handleCheckout(e: React.MouseEvent) {
		await createNewTransaction(e);
		setCheckedOut(true);
		dispatch({ type: "CLEAR" });
		onCartClose();
	}

	if (checkedOut) {
		return (
			<div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-zinc-50 px-6 text-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
					<CheckCircle2 size={32} className="text-green-600" />
				</div>
				<h2 className="text-xl font-semibold text-zinc-900">Order placed!</h2>
				<p className="max-w-xs text-sm text-zinc-500">
					Your order has been recorded successfully.
				</p>
				<button
					onClick={() => {
						console.log(filtered);
						setCheckedOut(false);
					}}
					className="mt-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition active:scale-95"
				>
					Buy again
				</button>
			</div>
		);
	}

	return (
		<div className="h-dvh overflow-y-auto bg-zinc-50">
			<div className="mx-auto max-w-2xl px-4 pb-32 pt-8">
				{/* Header */}
				<div className="mb-6 flex items-start gap-4">
					<Link href={"/products"}>
						<ArrowLeftIcon />
					</Link>

					<div>
						<h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
							Buy Products
						</h1>
						<p className="mt-0.5 text-sm text-zinc-500">
							{products.length} item{products.length !== 1 ? "s" : ""} available
						</p>
					</div>
				</div>

				{/* Search */}
				<div className="relative mb-4">
					<Search
						size={15}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
					/>
					<input
						type="text"
						placeholder="Search products…"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-4 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-0"
					/>
				</div>

				{/* Category tabs */}
				<div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
					{usedCategories.map((cat) => (
						<button
							key={cat}
							onClick={() => setActiveCategory(cat)}
							className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
								activeCategory === cat
									? "bg-zinc-900 text-white"
									: "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300"
							}`}
						>
							{cat}
						</button>
					))}
				</div>

				{/* Error */}
				{error && (
					<p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
						{error}
					</p>
				)}

				{/* Product list */}
				{loading ? (
					<div className="flex flex-col gap-3">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-20 animate-pulse rounded-xl bg-zinc-200"
							/>
						))}
					</div>
				) : filtered.length === 0 ? (
					<div className="py-20 text-center">
						<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
							<PackageOpen
								size={20}
								strokeWidth={1.5}
								className="text-zinc-400"
							/>
						</div>
						<p className="text-sm text-zinc-400">No products found.</p>
					</div>
				) : (
					<ul className="flex flex-col gap-3 overflow-hidden">
						<AnimatePresence mode="popLayout">
							{filtered.map((product) => {
								const inCart = cart.find((i) => i.id === product.id);
								return (
									<motion.li
										key={product.id}
										layout
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, x: 100 }}
										transition={{ duration: 0.2 }}
										className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 shadow-sm"
									>
										{/* Info */}
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium text-zinc-900">
												{product.name}
											</p>
											<span
												className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor(product.category)}`}
											>
												{product.category}
											</span>
										</div>

										{/* Price */}
										<p className="shrink-0 text-base font-semibold text-zinc-900">
											₱{product.sellingPrice?.toFixed(2)}
										</p>

										{/* Cart controls */}
										{inCart ? (
											<div className="flex shrink-0 items-center gap-1">
												<button
													onClick={() =>
														dispatch({ type: "DECREMENT", id: product.id })
													}
													className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100"
												>
													<Minus size={13} />
												</button>
												<span className="w-5 text-center text-sm font-semibold text-zinc-900">
													{inCart.qty}
												</span>
												<button
													onClick={() =>
														dispatch({ type: "INCREMENT", id: product.id })
													}
													className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white transition hover:bg-zinc-700"
												>
													<Plus size={13} />
												</button>
											</div>
										) : (
											<button
												onClick={() => dispatch({ type: "ADD", product })}
												className="shrink-0 flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-700 active:scale-95"
											>
												<Plus size={12} strokeWidth={2.5} />
												Add
											</button>
										)}
									</motion.li>
								);
							})}
						</AnimatePresence>
					</ul>
				)}
			</div>

			{/* Floating cart button */}
			<AnimatePresence>
				{cartCount > 0 && !cartOpen && (
					<motion.button
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						transition={{ duration: 0.22, ease: "easeIn" }}
						onClick={() => setCartOpen(true)}
						className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-2xl bg-zinc-900 px-5 py-3.5 shadow-xl text-white transition active:scale-95"
					>
						<ShoppingCart size={18} />
						<span className="text-sm font-medium">
							{cartCount} item{cartCount !== 1 ? "s" : ""}
						</span>
						<span className="text-sm font-semibold">
							₱{cartTotal.toFixed(2)}
						</span>
					</motion.button>
				)}
			</AnimatePresence>

			{/* Cart sheet */}
			<AnimatePresence>
				{cartOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={onCartClose}
							className="fixed inset-0 z-30 bg-black/40"
						/>

						{/* Sheet */}
						<motion.div
							initial={{ y: "100%" }}
							animate={{ y: 0 }}
							exit={{ y: "100%" }}
							transition={{ type: "spring", damping: 28, stiffness: 300 }}
							className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-2xl rounded-t-2xl bg-white px-4 pb-10 pt-4 shadow-2xl"
						>
							{/* Handle */}
							<div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-200" />

							{/* Title row */}
							<div className="mb-4 flex items-center justify-between">
								<h2 className="text-base font-semibold text-zinc-900">
									Cart · {cartCount} item{cartCount !== 1 ? "s" : ""}
								</h2>
								<button
									onClick={onCartClose}
									className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"
								>
									<X size={16} />
								</button>
							</div>

							{/* Cart items */}
							<ul className="mb-4 flex max-h-64 flex-col gap-2 overflow-y-auto">
								{cart.map((item) => (
									<li
										key={item.id}
										className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2.5"
									>
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium text-zinc-900">
												{item.name}
											</p>
											<p className="text-xs text-zinc-400">
												₱{item.sellingPrice.toFixed(2)} each
											</p>
										</div>

										<div className="flex shrink-0 items-center gap-1">
											<button
												onClick={() => {
													dispatch({ type: "DECREMENT", id: item.id });
													console.log(cart);
													if (cart.length === 0) onCartClose();
												}}
												className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
											>
												<Minus size={11} />
											</button>
											<span className="w-5 text-center text-sm font-semibold text-zinc-900">
												{item.qty}
											</span>
											<button
												onClick={() =>
													dispatch({ type: "INCREMENT", id: item.id })
												}
												className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 text-white hover:bg-zinc-700"
											>
												<Plus size={11} />
											</button>
										</div>

										<p className="shrink-0 w-16 text-right text-sm font-semibold text-zinc-900">
											₱{(item.sellingPrice * item.qty).toFixed(2)}
										</p>

										<button
											onClick={() => dispatch({ type: "REMOVE", id: item.id })}
											className="shrink-0 rounded-md p-1 text-zinc-300 hover:text-red-500"
										>
											<Trash2 size={14} />
										</button>
									</li>
								))}
							</ul>

							{/* Total */}
							<div className="mb-4 flex items-center justify-between border-t border-zinc-100 pt-4">
								<span className="text-sm text-zinc-500">Total</span>
								<span className="text-xl font-bold text-zinc-900">
									₱{cartTotal.toFixed(2)}
								</span>
							</div>

							<div className="relative my-4">
								<label className="mb-1.5 block text-xs font-medium text-zinc-500">
									Amount paid
								</label>
								<span className="absolute left-3 bottom-0 flex h-[42px] items-center text-sm text-zinc-400">
									₱
								</span>
								<input
									type="number"
									min="0"
									value={amountPaid}
									onChange={(e) => setAmountPaid(e.target.value)}
									step="0.01"
									placeholder="0.00"
									className="w-full rounded-lg border border-zinc-200 py-2.5 pl-7 pr-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
								/>
							</div>

							<div className="mb-4 flex items-center justify-between border-t border-zinc-100 pt-4">
								<span className="text-sm text-zinc-500">Change</span>
								<span className="text-xl font-bold text-zinc-900">
									₱
									{+amountPaid >= cartTotal
										? Math.abs(cartTotal - +amountPaid).toFixed(2)
										: 0}
								</span>
							</div>

							{/* Checkout button */}
							<button
								disabled={+amountPaid < cartTotal || creatingTransaction}
								onClick={handleCheckout}
								className="w-full rounded-2xl bg-zinc-900 py-4 text-base font-semibold text-white transition active:scale-95 hover:bg-zinc-700 disabled:bg-zinc-200"
							>
								{creatingTransaction ? "Checking out..." : "Checkout"}
							</button>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}
