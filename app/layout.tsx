import type { Metadata, Viewport } from "next";
import { Akaya_Kanadaka, Geist } from "next/font/google";
import "./globals.css";
import Providers from "./providers/providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const akayaKanadaka = Akaya_Kanadaka({
	variable: "--font-akaya-kanadaka",
	subsets: ["latin"],
	weight: "400",
});

export const metadata: Metadata = {
	title: "Product Manager",
	description: "Simple product management app",
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: "cover",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${akayaKanadaka.variable} h-full antialiased`}
		>
			<body className="h-dvh flex flex-col overflow-hidden">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
