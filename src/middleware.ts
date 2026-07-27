import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { menuList } from "./Router";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("adminToken")?.value;
  const restrictionCookie = req.cookies.get("adminRestriction")?.value || "";
  const roleCookie = req.cookies.get("adminRole")?.value || "";

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
      let restrictionList: any[] = [];
      try {
        restrictionList = JSON.parse(decodeURIComponent(restrictionCookie || ""));
      } catch {
        restrictionList = [];
      }

      const getPerm = (label: string) =>
        restrictionList.find((r: any) => r?.module === label) || {};

      const permPaths = menuList.flatMap((menu) => {
        if (menu.subMenu && menu.subMenu.length > 0) {
          return menu.subMenu
            .filter((sub) => Boolean(sub.path))
            .map((sub) => {
              const perm = getPerm(sub.label);
              return {
                path: sub.path as string,
                view: Boolean(perm.view),
                add: Boolean(perm.add),
                edit: Boolean(perm.edit),
              };
            });
        }
        if (menu.path) {
          const perm = getPerm(menu.label);
          return [
            {
              path: menu.path as string,
              view: Boolean(perm.view),
              add: Boolean(perm.add),
              edit: Boolean(perm.edit),
            },
          ];
        }
        return [];
      });

      const action = pathname.includes("/add-")
        ? "add"
        : pathname.includes("/update-")
          ? "edit"
          : "view";
      
      const matched = permPaths
        .sort((a, b) => b.path.length - a.path.length)
        .find((p) => p.path === "/" ? pathname === "/" : pathname.startsWith(p.path));

      console.log("matched----", matched)
      console.log("action----", action)
      if (!matched || !matched[action as keyof typeof matched]) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
