import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const cookieUserId = request.cookies.get("analytics_user_id")?.value;

  if (!cookieUserId) {
    const newId = uuidv4();
    response.cookies.set({
      name: "analytics_user_id",
      value: newId,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

export const config = {
  matcher: "/:path*",
};
