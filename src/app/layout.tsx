import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Shipment Investigator",
  description: "Find lost and missorted shipments across WMS and CCTV evidence.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
