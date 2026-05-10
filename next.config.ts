import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	async rewrites() {
		const apiBase = process.env.API_URL ?? "http://127.0.0.1:3001";
		return [
			{
				source: "/products",
				destination: `${apiBase}/products`,
			},
			{
				source: "/products/:id",
				destination: `${apiBase}/products/:id`,
			},
			{
				source: "/api/:path*",
				destination: `${apiBase}/:path*`,
			},
		];
	},
};

export default nextConfig;
