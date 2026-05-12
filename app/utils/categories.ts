export const CATEGORIES = [
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

export const CATEGORY_COLORS: Record<string, string> = {
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

export function categoryColor(cat: string) {
	return CATEGORY_COLORS[cat] ?? "bg-zinc-100 text-zinc-600";
}
