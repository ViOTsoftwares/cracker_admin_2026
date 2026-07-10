import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("adminToken")?.value;
  const restrictionCookie = req.cookies.get("adminRestriction")?.value || "";
  const roleCookie = req.cookies.get("adminRole")?.value || "";
  const permPathsCookie = req.cookies.get("adminPermPaths")?.value || "";

  const isAuthPage = req.nextUrl.pathname.startsWith("/signin");

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (token && !isAuthPage) {
    const pathname = req.nextUrl.pathname;
    const role = decodeURIComponent(roleCookie || "");
    if (role !== "superadmin") {
      let permPaths: any[] = [];
      try {
        permPaths = JSON.parse(decodeURIComponent(permPathsCookie || ""));
      } catch {
        permPaths = [];
      }

      const action = pathname.includes("/add-")
        ? "add"
        : pathname.includes("/update-")
          ? "edit"
          : "view";
      const matched = permPaths.find((p) => pathname.startsWith(p.path));
      if (!matched || !matched[action]) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
