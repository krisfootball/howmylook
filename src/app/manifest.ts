import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HowMyLook",
    short_name: "HowMyLook",
    description: "Quick outfit feedback with yes or no voting.",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fff8fc",
    theme_color: "#fff8fc",
    categories: ["lifestyle", "social", "fashion"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32",
        type: "image/x-icon",
      },
    ],
  };
}
