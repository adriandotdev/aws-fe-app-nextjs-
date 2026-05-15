"use client";

import { Plus, Search, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AddProductModal } from "./AddProductModal";
import { EditProductModal } from "./EditProductModal";
import { LogoutModal } from "./LogoutModal";
import { ProductList } from "./ProductList";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface Product {
	id: string;
	name: string;
	category: string;
	sellingPrice: number;
}

export function ProductsPageContent({ onSignOut }: { onSignOut: () => void }) {
	const router = useRouter();
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
	const [logout, setLogout] = useState(false);

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

	function openLogout() {
		setLogout(true);
	}

	function closeLogout() {
		setLogout(false);
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
		<div className="h-dvh overflow-y-auto bg-[#FBF8E9] pb-8">
			<div className="mx-auto max-w-2xl px-4 pb-16 pt-8">
				{/* Header */}
				<div className="mb-6 flex items-start justify-between">
					<div>
						<h1 className="text-2xl font-semibold tracking-tight text-blue-950">
							Products
						</h1>
						<p className="mt-0.5 text-sm text-[#2C5F14]/60">
							{products.length} item{products.length !== 1 ? "s" : ""}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={() => {
								setShowForm((v) => !v);
								setError(null);
							}}
							className="flex items-center gap-1.5 rounded-lg bg-[#2C5F14] px-3 py-2 text-sm font-medium text-[#F5C012] transition hover:bg-[#245010] active:scale-95"
						>
							<Plus size={14} strokeWidth={2.5} />
							Add
						</button>
						<button
							onClick={openLogout}
							className="rounded-lg border border-[#2C5F14]/20 bg-[#FBF8E9] px-3 py-2 text-sm font-medium text-[#2C5F14] transition hover:border-[#2C5F14]/40"
						>
							Sign out
						</button>
					</div>
				</div>

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
					<Search
						size={14}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2C5F14]/40"
					/>
					<input
						type="search"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search products…"
						className="w-full rounded-lg border border-[#2C5F14]/15 bg-white/60 py-2.5 pl-9 pr-4 text-sm text-blue-950 placeholder-[#2C5F14]/30 outline-none transition focus:border-[#2C5F14]/40 focus:ring-2 focus:ring-[#2C5F14]/10"
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
									? "bg-[#2C5F14] text-[#F5C012]"
									: "bg-[#FBF8E9] border border-[#2C5F14]/15 text-[#2C5F14]/70 hover:border-[#2C5F14]/30"
							}`}
						>
							{cat}
						</button>
					))}
				</div>

				{/* Product list */}
				<ProductList
					loading={loading}
					filtered={filtered}
					onEdit={openEdit}
					onDelete={deleteProduct}
				/>
			</div>

			{/* Modals */}
			{/* Add Product Modal */}
			<AddProductModal
				showForm={showForm}
				setShowForm={setShowForm}
				form={form}
				setForm={setForm}
				creating={creating}
				isFormValid={!!isFormValid}
				onSubmit={createProduct}
			/>

			{/* Edit Modal */}
			<EditProductModal
				editingProduct={editingProduct}
				editForm={editForm}
				setEditForm={setEditForm}
				saving={saving}
				onSubmit={updateProduct}
				onClose={closeEdit}
			/>

			{/* Logout Modal */}
			<LogoutModal logout={logout} onClose={closeLogout} onLogout={onSignOut} />

			{/* Buy FAB */}
			<button
				onClick={() => router.push("/products/buy")}
				className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-[#2C5F14] px-5 py-3.5 text-sm font-semibold text-[#F5C012] shadow-lg shadow-[#2C5F14]/30 transition hover:bg-[#245010] active:scale-95 touch-manipulation"
			>
				<ShoppingCart size={16} strokeWidth={2.5} />
				Buy
			</button>
		</div>
	);
}
