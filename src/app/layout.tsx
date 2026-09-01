import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "ExecutionOS",
  description: "AI-native performance execution for operations-heavy companies"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
