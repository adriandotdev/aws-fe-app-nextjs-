"use client";

import { CATEGORIES } from "@/app/utils/categories";
import { AnimatePresence, motion } from "motion/react";

interface Product {
	id: string;
	name: string;
	category: string;
	sellingPrice: number;
}

interface EditForm {
	name: string;
	category: string;
	sellingPrice: string;
}

interface EditProductModalProps {
	editingProduct: Product | null;
	editForm: EditForm;
	setEditForm: (f: EditForm) => void;
	saving: boolean;
	onSubmit: (e: React.SubmitEvent) => void;
	onClose: () => void;
}

export function EditProductModal({
	editingProduct,
	editForm,
	setEditForm,
	saving,
	onSubmit,
	onClose,
}: EditProductModalProps) {
	return (
		<AnimatePresence>
			{editingProduct && (
				<div
					className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
					onClick={(e) => e.target === e.currentTarget && onClose()}
				>
					<motion.div
						initial={{ y: "100%" }}
						animate={{ y: 0 }}
						exit={{ y: "100%" }}
						transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
						className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
					>
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-sm font-semibold text-zinc-900">
								Edit Product
							</h2>
							<button
								onClick={onClose}
								className="rounded-md p-1 text-zinc-400 hover:text-zinc-700"
								aria-label="Close"
							>
								✕
							</button>
						</div>
						<form onSubmit={onSubmit} className="flex flex-col gap-3">
							<div className="flex flex-col gap-1">
								<label className="text-xs font-medium text-zinc-500">
									Name <span className="text-red-400">*</span>
								</label>
								<input
									type="text"
									value={editForm.name}
									onChange={(e) =>
										setEditForm({ ...editForm, name: e.target.value })
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
										setEditForm({ ...editForm, category: e.target.value })
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
										₱
									</span>
									<input
										type="number"
										min="0"
										step="0.01"
										value={editForm.sellingPrice}
										onChange={(e) =>
											setEditForm({ ...editForm, sellingPrice: e.target.value })
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
									onClick={onClose}
									className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900"
								>
									Cancel
								</button>
							</div>
						</form>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
