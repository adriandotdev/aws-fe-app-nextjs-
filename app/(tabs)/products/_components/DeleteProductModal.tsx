import { AnimatePresence, motion } from "motion/react";

interface DeleteProductModalProps {
	open: boolean;
	productName: string;
	onClose: () => void;
	onDelete: () => void;
}

export function DeleteProductModal({
	open,
	productName,
	onClose,
	onDelete,
}: DeleteProductModalProps) {
	return (
		<AnimatePresence>
			{open && (
				<div
					className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
					onClick={(e) => e.target === e.currentTarget && onClose()}
				>
					<motion.div
						initial={{ y: "100%" }}
						animate={{ y: 0 }}
						exit={{ y: "100%" }}
						transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
						className="w-full max-w-lg rounded-t-2xl bg-[#FBF8E9] p-5 shadow-xl sm:rounded-2xl"
					>
						<h2 className="text-xl font-semibold text-blue-950">
							Are you sure you want to delete{" "}
							<span className="text-red-700">{productName}</span>?
						</h2>

						<div className="flex flex-col gap-2 pt-8">
							<button
								onClick={onDelete}
								type="submit"
								className="flex-1 rounded-lg bg-red-700 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
							>
								Yes
							</button>
							<button
								type="button"
								onClick={onClose}
								className="rounded-lg border border-[#2C5F14]/20 px-4 py-2.5 text-sm font-medium text-[#2C5F14] transition hover:border-[#2C5F14]/40"
							>
								Cancel
							</button>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
