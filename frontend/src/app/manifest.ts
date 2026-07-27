import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trilha — Planeje viagens em grupo",
    short_name: "Trilha",
    description: "Planeje viagens em grupo, tudo em um só lugar.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#17151b",
    theme_color: "#17151b",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
