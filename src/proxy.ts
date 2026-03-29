import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function proxy(request: Request) {
  const session = await auth();
  const url = new URL(request.url);

  // Protect user dashboard routes
  if (url.pathname.startsWith("/cont") && !url.pathname.startsWith("/cont/autentificare") && !url.pathname.startsWith("/cont/inregistrare") && !url.pathname.startsWith("/cont/parola-uitata") && !url.pathname.startsWith("/cont/reseteaza-parola")) {
    if (!session) {
      return NextResponse.redirect(new URL("/cont/autentificare", request.url));
    }
  }

  // Protect admin routes
  if (url.pathname.startsWith("/admin")) {
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect ad posting route
  if (url.pathname.startsWith("/publica")) {
    if (!session) {
      return NextResponse.redirect(new URL("/cont/autentificare", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cont/:path*", "/admin/:path*", "/publica/:path*"],
};
