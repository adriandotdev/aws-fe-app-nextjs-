import { BottomNavigation } from "../components/bottom-navigation";

interface TabLayoutProps {
	children: React.ReactNode;
}

export default function TabLayout({ children }: TabLayoutProps) {
	return (
		<main className="pb-17.5 overflow-x-hidden">
			{children}

			<BottomNavigation />
		</main>
	);
}
