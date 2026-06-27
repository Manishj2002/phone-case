import { withAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  return withAuth(req, {
    // Add all routes that should be PUBLIC (no auth required)
    publicPaths: [
      "/api/uploadthing",           // ← Critical for UploadThing
      "/api/uploadthing/",          
      "/",                          // your homepage if needed
      // add more public pages here
    ],
  });
}

// Optional: Apply middleware to most routes
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)", 
  ],
};