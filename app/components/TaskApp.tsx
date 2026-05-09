"use client";

import { useCallback, useEffect, useState } from "react";

type Status = "pending" | "in-progress" | "completed";

interface Task {
	id: string;
	title: string;
	status: Status;
}

type Tab = Status | "all";

const STATUS_CONFIG: Record<
	Status,
	{ label: string; badge: string; select: string }
> = {
	pending: {
		label: "Pending",
		badge:
			"bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		select: "text-amber-700 dark:text-amber-400",
	},
	"in-progress": {
		label: "In Progress",
		badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		select: "text-blue-700 dark:text-blue-400",
	},
	completed: {
		label: "Completed",
		badge:
			"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		select: "text-green-700 dark:text-green-400",
	},
};

const TABS: { key: Tab; label: string }[] = [
	{ key: "all", label: "All" },
	{ key: "pending", label: "Pending" },
	{ key: "in-progress", label: "In Progress" },
	{ key: "completed", label: "Completed" },
];

export default function TaskApp() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [newTitle, setNewTitle] = useState("");
	const [activeTab, setActiveTab] = useState<Tab>("all");
	const [loading, setLoading] = useState(true);
	const [creating, setCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchTasks = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/tasks");
			if (!res.ok) throw new Error("Failed to load tasks");
			const data = await res.json();
			const list: Task[] = Array.isArray(data)
				? data
				: Array.isArray(data?.tasks)
					? data.tasks
					: [];
			setTasks(list);
		} catch {
			setError("Could not connect to the server.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		fetchTasks();
	}, [fetchTasks]);

	async function createTask(e: React.FormEvent) {
		e.preventDefault();
		const title = newTitle.trim();
		if (!title) return;
		setCreating(true);
		try {
			const res = await fetch("/api/tasks", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title }),
			});
			if (!res.ok) throw new Error("Failed to create task");
			const task: Task = await res.json();
			setTasks((prev) => [task, ...prev]);
			setNewTitle("");
		} catch {
			setError("Failed to create task.");
		} finally {
			setCreating(false);
		}
	}

	async function updateStatus(id: string, status: Status) {
		setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
		try {
			const res = await fetch(`/api/tasks/${id}/status`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status }),
			});
			if (!res.ok) throw new Error();
		} catch {
			// Revert on failure
			fetchTasks();
			setError("Failed to update status.");
		}
	}

	async function deleteTask(id: string) {
		setTasks((prev) => prev.filter((t) => t.id !== id));
		try {
			const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
			if (!res.ok) throw new Error();
		} catch {
			fetchTasks();
			setError("Failed to delete task.");
		}
	}

	const filtered =
		activeTab === "all" ? tasks : tasks.filter((t) => t.status === activeTab);

	const countFor = (tab: Tab) =>
		tab === "all" ? tasks.length : tasks.filter((t) => t.status === tab).length;

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
			<div className="mx-auto max-w-2xl px-4 py-14">
				{/* Header */}
				<div className="mb-10">
					<h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
						Task Manager
					</h1>
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
						Track and manage your tasks.
					</p>
				</div>

				{/* Create task */}
				<form onSubmit={createTask} className="mb-8 flex gap-2">
					<input
						type="text"
						value={newTitle}
						onChange={(e) => setNewTitle(e.target.value)}
						placeholder="What needs to be done?"
						className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:border-zinc-600 dark:focus:ring-white/10"
					/>
					<button
						type="submit"
						disabled={!newTitle.trim() || creating}
						className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
					>
						{creating ? "Adding…" : "Add Task"}
					</button>
				</form>

				{/* Error banner */}
				{error && (
					<div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400">
						{error}
						<button
							onClick={() => setError(null)}
							className="ml-4 text-red-400 hover:text-red-600 dark:hover:text-red-300"
							aria-label="Dismiss"
						>
							✕
						</button>
					</div>
				)}

				{/* Tabs */}
				<div className="mb-6 flex gap-0 border-b border-zinc-200 dark:border-zinc-800">
					{TABS.map((tab) => {
						const isActive = activeTab === tab.key;
						return (
							<button
								key={tab.key}
								onClick={() => setActiveTab(tab.key)}
								className={`relative pb-3 pr-5 text-sm font-medium transition-colors ${
									isActive
										? "text-zinc-900 dark:text-zinc-50"
										: "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
								}`}
							>
								{tab.label}
								<span
									className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
										isActive
											? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
											: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
									}`}
								>
									{countFor(tab.key)}
								</span>
								{isActive && (
									<span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
								)}
							</button>
						);
					})}
				</div>

				{/* Task list */}
				{loading ? (
					<div className="py-20 text-center text-sm text-zinc-400">
						Loading tasks…
					</div>
				) : filtered.length === 0 ? (
					<div className="py-20 text-center text-sm text-zinc-400">
						No {activeTab === "all" ? "" : activeTab + " "}tasks yet.
					</div>
				) : (
					<ul className="flex flex-col gap-2">
						{filtered.map((task) => (
							<TaskCard
								key={task.id}
								task={task}
								onStatusChange={updateStatus}
								onDelete={deleteTask}
							/>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}

function TaskCard({
	task,
	onStatusChange,
	onDelete,
}: {
	task: Task;
	onStatusChange: (id: string, status: Status) => void;
	onDelete: (id: string) => void;
}) {
	const cfg = STATUS_CONFIG[task.status];

	return (
		<li className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
			{/* Title */}
			<span
				className={`flex-1 text-sm ${
					task.status === "completed"
						? "text-zinc-400 line-through dark:text-zinc-600"
						: "text-zinc-900 dark:text-zinc-100"
				}`}
			>
				{task.title}
			</span>

			{/* Status badge */}
			<span
				className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.badge}`}
			>
				{cfg.label}
			</span>

			{/* Status selector */}
			<select
				value={task.status}
				onChange={(e) => onStatusChange(task.id, e.target.value as Status)}
				className="shrink-0 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:focus:border-zinc-500 dark:focus:ring-white/10"
				aria-label="Change status"
			>
				<option value="pending">Pending</option>
				<option value="in-progress">In Progress</option>
				<option value="completed">Completed</option>
			</select>

			{/* Delete */}
			<button
				onClick={() => onDelete(task.id)}
				className="shrink-0 rounded-md p-1 text-zinc-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
				aria-label="Delete task"
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
		</li>
	);
}
