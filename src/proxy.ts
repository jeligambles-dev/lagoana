import { NextResponse } from "next/server";

export async function proxy(request: Request) {
  // Let all routes through - auth is handled by:
  // - Client components check useSession()
  // - API routes check auth()
  // - Pages redirect to login when needed
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
