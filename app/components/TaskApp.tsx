"use client";

import { useCallback, useEffect, useState } from "react";

const API_BASE = "";

interface Product {
	id: string;
	name: string;
	category: string;
	sellingPrice: number;
}

const CATEGORIES = [
	"All",
	"Beverages",
	"Snacks",
	"Dairy",
	"Bakery",
	"Meat",
	"Produce",
	"Frozen",
	"Personal Care",
	"Household",
	"Others",
];

const CATEGORY_COLORS: Record<string, string> = {
	Beverages: "bg-blue-100 text-blue-700",
	Snacks: "bg-orange-100 text-orange-700",
	Dairy: "bg-yellow-100 text-yellow-700",
	Bakery: "bg-amber-100 text-amber-700",
	Meat: "bg-red-100 text-red-700",
	Produce: "bg-green-100 text-green-700",
	Frozen: "bg-cyan-100 text-cyan-700",
	"Personal Care": "bg-pink-100 text-pink-700",
	Household: "bg-purple-100 text-purple-700",
	Others: "bg-zinc-100 text-zinc-600",
};

function categoryColor(cat: string) {
	return CATEGORY_COLORS[cat] ?? "bg-zinc-100 text-zinc-600";
}

export default function TaskApp({ onSignOut }: { onSignOut: () => void }) {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [creating, setCreating] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [activeCategory, setActiveCategory] = useState("All");
	const [search, setSearch] = useState("");
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [editForm, setEditForm] = useState({
		name: "",
		category: "Others",
		sellingPrice: "",
	});

	const [form, setForm] = useState({
		name: "",
		category: "Others",
		sellingPrice: "",
	});

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
			setError("Could not connect to the server.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		fetchProducts();
	}, [fetchProducts]);

	async function createProduct(e: React.FormEvent) {
		e.preventDefault();
		const name = form.name.trim();
		const category = form.category.trim();
		const sellingPrice = parseFloat(form.sellingPrice);
		if (!name || !category || isNaN(sellingPrice) || sellingPrice < 0) return;

		setCreating(true);
		try {
			const res = await fetch(`${API_BASE}/products`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, category, sellingPrice }),
			});
			if (!res.ok) throw new Error();
			const created = await res.json();
			const product: Product = created?.product ?? created;
			setProducts((prev) => [product, ...prev]);
			setForm({ name: "", category: "Others", sellingPrice: "" });
			setShowForm(false);
		} catch {
			setError("Failed to create product.");
		} finally {
			setCreating(false);
		}
	}

	function openEdit(product: Product) {
		setEditingProduct(product);
		setEditForm({
			name: product.name,
			category: product.category,
			sellingPrice: String(product.sellingPrice),
		});
	}

	function closeEdit() {
		setEditingProduct(null);
		setEditForm({ name: "", category: "Others", sellingPrice: "" });
	}

	async function updateProduct(e: React.FormEvent) {
		e.preventDefault();
		if (!editingProduct) return;
		const name = editForm.name.trim();
		const category = editForm.category.trim();
		const sellingPrice = parseFloat(editForm.sellingPrice);
		if (!name || !category || isNaN(sellingPrice) || sellingPrice < 0) return;
		setSaving(true);
		try {
			const res = await fetch(`${API_BASE}/products/${editingProduct.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, category, sellingPrice }),
			});
			if (!res.ok) throw new Error();
			const updated = await res.json();
			const product: Product = updated?.product ?? updated;
			setProducts((prev) =>
				prev.map((p) => (p.id === editingProduct.id ? product : p)),
			);
			closeEdit();
		} catch {
			setError("Failed to update product.");
		} finally {
			setSaving(false);
		}
	}

	async function deleteProduct(id: string) {
		setProducts((prev) => prev.filter((p) => p.id !== id));
		try {
			const res = await fetch(`${API_BASE}/products/${id}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error();
		} catch {
			fetchProducts();
			setError("Failed to delete product.");
		}
	}

	const filtered = products.filter((p) => {
		const matchCat = activeCategory === "All" || p.category === activeCategory;
		const matchSearch =
			!search || p.name.toLowerCase().includes(search.toLowerCase());
		return matchCat && matchSearch;
	});

	const usedCategories = [
		"All",
		...Array.from(new Set(products.map((p) => p.category))),
	];

	const isFormValid =
		form.name.trim() &&
		form.category.trim() &&
		form.sellingPrice !== "" &&
		!isNaN(parseFloat(form.sellingPrice)) &&
		parseFloat(form.sellingPrice) >= 0;

	return (
		<div className="min-h-screen bg-zinc-50">
			<div className="mx-auto max-w-2xl px-4 pb-16 pt-8">
				{/* Header */}
				<div className="mb-6 flex items-start justify-between">
					<div>
						<h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
							Products
						</h1>
						<p className="mt-0.5 text-sm text-zinc-500">
							{products.length} item{products.length !== 1 ? "s" : ""}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={() => {
								setShowForm((v) => !v);
								setError(null);
							}}
							className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 active:scale-95"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<line x1="12" y1="5" x2="12" y2="19" />
								<line x1="5" y1="12" x2="19" y2="12" />
							</svg>
							Add
						</button>
						<button
							onClick={onSignOut}
							className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900"
						>
							Sign out
						</button>
					</div>
				</div>

				{/* Add Product Modal */}
				{showForm && (
					<div
						className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
						onClick={(e) => {
							if (e.target === e.currentTarget) {
								setShowForm(false);
								setForm({ name: "", category: "Others", sellingPrice: "" });
							}
						}}
					>
						<div className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
							<div className="mb-4 flex items-center justify-between">
								<h2 className="text-sm font-semibold text-zinc-900">
									New Product
								</h2>
								<button
									onClick={() => {
										setShowForm(false);
										setForm({ name: "", category: "Others", sellingPrice: "" });
									}}
									className="rounded-md p-1 text-zinc-400 hover:text-zinc-700"
									aria-label="Close"
								>
									✕
								</button>
							</div>
							<form onSubmit={createProduct} className="flex flex-col gap-3">
								<div className="flex flex-col gap-1">
									<label className="text-xs font-medium text-zinc-500">
										Name <span className="text-red-400">*</span>
									</label>
									<input
										type="text"
										value={form.name}
										onChange={(e) =>
											setForm((f) => ({ ...f, name: e.target.value }))
										}
										placeholder="e.g. Marlboro Red"
										className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
									/>
								</div>

								<div className="flex flex-col gap-1">
									<label className="text-xs font-medium text-zinc-500">
										Category <span className="text-red-400">*</span>
									</label>
									<select
										value={form.category}
										onChange={(e) =>
											setForm((f) => ({ ...f, category: e.target.value }))
										}
										className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
									>
										{CATEGORIES.filter((c) => c !== "All").map((c) => (
											<option key={c} value={c}>
												{c}
											</option>
										))}
									</select>
								</div>

								<div className="flex flex-col gap-1">
									<label className="text-xs font-medium text-zinc-500">
										Selling Price <span className="text-red-400">*</span>
									</label>
									<div className="relative">
										<span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
											$
										</span>
										<input
											type="number"
											min="0"
											step="0.01"
											value={form.sellingPrice}
											onChange={(e) =>
												setForm((f) => ({
													...f,
													sellingPrice: e.target.value,
												}))
											}
											placeholder="0.00"
											className="w-full rounded-lg border border-zinc-200 py-2.5 pl-7 pr-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
										/>
									</div>
								</div>

								<div className="flex gap-2 pt-1">
									<button
										type="submit"
										disabled={!isFormValid || creating}
										className="flex-1 rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
									>
										{creating ? "Saving…" : "Save Product"}
									</button>
									<button
										type="button"
										onClick={() => {
											setShowForm(false);
											setForm({
												name: "",
												category: "Others",
												sellingPrice: "",
											});
										}}
										className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900"
									>
										Cancel
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{/* Error banner */}
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

				{/* Search */}
				<div className="relative mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
					>
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
					<input
						type="search"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search products…"
						className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-9 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
					/>
				</div>

				{/* Category filter */}
				<div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
					{usedCategories.map((cat) => (
						<button
							key={cat}
							onClick={() => setActiveCategory(cat)}
							className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
								activeCategory === cat
									? "bg-zinc-900 text-white"
									: "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
							}`}
						>
							{cat}
						</button>
					))}
				</div>

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
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="text-zinc-400"
							>
								<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
								<line x1="3" y1="6" x2="21" y2="6" />
								<path d="M16 10a4 4 0 0 1-8 0" />
							</svg>
						</div>
						<p className="text-sm text-zinc-400">No products found.</p>
					</div>
				) : (
					<ul className="flex flex-col gap-3">
						{filtered.map((product) => (
							<ProductCard
								key={product.id}
								product={product}
								onEdit={openEdit}
								onDelete={deleteProduct}
							/>
						))}
					</ul>
				)}
			</div>

			{/* Edit Modal */}
			{editingProduct && (
				<div
					className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
					onClick={(e) => e.target === e.currentTarget && closeEdit()}
				>
					<div className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-sm font-semibold text-zinc-900">
								Edit Product
							</h2>
							<button
								onClick={closeEdit}
								className="rounded-md p-1 text-zinc-400 hover:text-zinc-700"
								aria-label="Close"
							>
								✕
							</button>
						</div>
						<form onSubmit={updateProduct} className="flex flex-col gap-3">
							<div className="flex flex-col gap-1">
								<label className="text-xs font-medium text-zinc-500">
									Name <span className="text-red-400">*</span>
								</label>
								<input
									type="text"
									value={editForm.name}
									onChange={(e) =>
										setEditForm((f) => ({ ...f, name: e.target.value }))
									}
									className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label className="text-xs font-medium text-zinc-500">
									Category <span className="text-red-400">*</span>
								</label>
								<select
									value={editForm.category}
									onChange={(e) =>
										setEditForm((f) => ({ ...f, category: e.target.value }))
									}
									className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
								>
									{CATEGORIES.filter((c) => c !== "All").map((c) => (
										<option key={c} value={c}>
											{c}
										</option>
									))}
								</select>
							</div>
							<div className="flex flex-col gap-1">
								<label className="text-xs font-medium text-zinc-500">
									Selling Price <span className="text-red-400">*</span>
								</label>
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
										$
									</span>
									<input
										type="number"
										min="0"
										step="0.01"
										value={editForm.sellingPrice}
										onChange={(e) =>
											setEditForm((f) => ({
												...f,
												sellingPrice: e.target.value,
											}))
										}
										className="w-full rounded-lg border border-zinc-200 py-2.5 pl-7 pr-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
									/>
								</div>
							</div>
							<div className="flex gap-2 pt-1">
								<button
									type="submit"
									disabled={saving}
									className="flex-1 rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
								>
									{saving ? "Saving…" : "Save Changes"}
								</button>
								<button
									type="button"
									onClick={closeEdit}
									className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
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
		<li className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 shadow-sm transition hover:border-zinc-300">
			{/* Icon */}
			<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.8"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
					<line x1="3" y1="6" x2="21" y2="6" />
					<path d="M16 10a4 4 0 0 1-8 0" />
				</svg>
			</div>

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
			<div className="shrink-0 text-right">
				<p className="text-base font-semibold text-zinc-900">
					${product.sellingPrice.toFixed(2)}
				</p>
			</div>

			{/* Edit */}
			<button
				onClick={() => onEdit(product)}
				className="shrink-0 rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
				aria-label="Edit product"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
					<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
				</svg>
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
						className="rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition hover:border-zinc-300"
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
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="15"
						height="15"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="3 6 5 6 21 6" />
						<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
						<path d="M10 11v6" />
						<path d="M14 11v6" />
						<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
					</svg>
				</button>
			)}
		</li>
	);
}
