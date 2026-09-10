export { auth as proxy } from "@/auth";

export const config = {
  matcher: [
    "/investigations/:path*",
    "/api/shipments/:path*",
    "/api/feedback/:path*",
  ],
};
