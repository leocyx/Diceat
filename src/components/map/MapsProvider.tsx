"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { ReactNode } from "react";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function MapsProvider({ children }: { children: ReactNode }) {
  if (!API_KEY) {
    console.warn("Google Maps API Key is missing! Map features will not work.");
    return <>{children}</>;
  }

  return (
    <APIProvider apiKey={API_KEY} libraries={["places", "marker"]}>
      {children}
    </APIProvider>
  );
}
