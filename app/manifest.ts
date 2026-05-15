import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Suki",
		short_name: "Suki",
		description: "A Progressive Web App built with Next.js",
		start_url: "/",
		display: "standalone",
		background_color: "#FBF8E9",
		theme_color: "#000000",
		icons: [
			{
				src: "/suki-bg.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/suki-bg.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
	};
}
