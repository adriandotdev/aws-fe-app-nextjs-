import { AnimatePresence, motion } from "motion/react";

interface LogoutModalProps {
	logout: boolean;
	onClose: () => void;
	onLogout: () => void;
}

export function LogoutModal({ logout, onClose, onLogout }: LogoutModalProps) {
	return (
		<AnimatePresence>
			{logout && (
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
						<h2 className="text-xl font-semibold text-zinc-900">
							Are you sure you want to logout?
						</h2>

						<div className="flex flex-col gap-2 pt-8">
							<button
								onClick={onLogout}
								type="submit"
								className="flex-1 rounded-lg bg-red-700 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
							>
								Yes
							</button>
							<button
								type="button"
								onClick={onClose}
								className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900"
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
