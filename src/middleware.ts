import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const userId = url.searchParams.get("user_id");
  const charId = url.searchParams.get("character_id");

  if (userId || charId) {
    const response = NextResponse.next();

    if (userId) {
      response.cookies.set({
        name: "user_id",
        value: userId,
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    if (charId) {
      response.cookies.set({
        name: "character_id",
        value: charId,
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
