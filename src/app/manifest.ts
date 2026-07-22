import type { MetadataRoute } from "next";

type ManifestWithGcmSenderId = MetadataRoute.Manifest & { gcm_sender_id?: string };

export default function manifest(): ManifestWithGcmSenderId {
  return {
    // Legacy field some Chrome/Android versions still require for
    // pushManager.subscribe() to succeed even with VAPID - omitting it can
    // throw "AbortError: Registration failed - push service error".
    gcm_sender_id: "103953800507",
    name: "Nestwork",
    short_name: "Nestwork",
    description: "Familien-Aufgabenplanung",
    start_url: "/",
    display: "standalone",
    background_color: "#FDF6F0",
    theme_color: "#EF9B6B",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
