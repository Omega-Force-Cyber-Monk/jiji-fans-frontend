import { dashboardItems } from "@/constants/router.const";
import { TRole } from "@/types";
import { NextResponse, NextRequest } from "next/server";
import { apiUrl } from "./config";

// const JWT_SECRET = new TextEncoder().encode(jwtSecret);
function decodeJwt(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

async function getUserFromToken(token: string): Promise<{ role: TRole; status: string } | null> {
  try {
    const res = await fetch(`${apiUrl}/users/profile`, {
      cache: "no-cache",
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error("[Middleware] Profile fetch failed:", res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    const userData = data?.data;

    if (userData) {
      return {
        role: userData.role,
        status: userData.status || "ACTIVE",
      };
    }
    console.error("[Middleware] No user data in response:", data);
    return null;
  } catch (error) {
    console.error("[Middleware] getUserFromToken error:", error);
    return null;
  }
}

// export const privateItemsObject = {
//     // home page
//     "job-seekers": [ROLE.EMPLOYER, ROLE.EMPLOYEE,],
//     notification: [ROLE.ADMIN, ROLE.EMPLOYER, ROLE.EMPLOYEE, ROLE.CANDIDATE],
//     // training: [ROLE.CANDIDATE],
//     // dashboard
//     overview: [ROLE.EMPLOYER, ROLE.EMPLOYEE, ROLE.CANDIDATE],
//     "personal-jobs": [ROLE.CANDIDATE, ROLE.EMPLOYEE, ROLE.EMPLOYER],
//     "favorite-jobs": [ROLE.CANDIDATE],
//     "job-alerts": [ROLE.CANDIDATE],
//     "job-post": [ROLE.EMPLOYEE, ROLE.EMPLOYER],
//     "saved-candidate": [ROLE.EMPLOYEE, ROLE.EMPLOYER],
//     "plan-bills": [ROLE.EMPLOYER],
//     settings: [ROLE.EMPLOYER, ROLE.CANDIDATE, ROLE.EMPLOYEE],
//     admin: [ROLE.ADMIN]
// };

// Generate privateItemsObject and config based on dashboardItems
export const privateItemsObject = dashboardItems.reduce((acc, item) => {
  item.role.forEach((role) => {
    if (!acc[role]) acc[role] = [];
    acc[role].push(item.path);
  });
  return acc;
}, {} as Record<string, string[]>);

const isPathAllowed = (role: TRole, pathname: string): boolean => {
  // console.log({
  //   pathname: pathname.split("/")[1],
  //   routes: privateItemsObject[role],
  // });
  return !!privateItemsObject[role].find(
    // (prefix: string) => pathname.split("/")[1] === prefix
    (prefix: string) => prefix.includes(pathname.split("/")[1])
  );
};

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // TEMPORARY: Bypass authorization for development without backend
  // return NextResponse.next();

  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get("accessToken")?.value;
  // Debug logging (check Next.js server terminal)
  // console.log('[Middleware] Path:', pathname, 'Token exists:', !!token);

  // Allow access to sign-in, sign-up, and channel status pages without suspension check
  const publicPaths = [
    "/sign-in",
    "/sign-up",
    "/account-suspended",
    "/channel-suspended",
    "/channel-under-review",
    "/channel-rejected",
    "/forget-pass",
    "/reset-pass"
  ];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  // If no token and not a public path, redirect to login
  if (!token && !isPublicPath) {
    // console.log('[Middleware] No token, redirecting to sign-in');
    return NextResponse.redirect(
      new URL(`/sign-in?redirect=${encodeURIComponent(pathname)}`, request.url)
    );
  }

  // If no token and it's a public path, allow access
  if (!token && isPublicPath) {
    // console.log('[Middleware] No token, public path - allowing');
    return NextResponse.next();
  }

  // If token exists, check user status
  if (token) {
    // 1. Try to get role and status from cookies first (fastest)
    let role = request.cookies.get("userRole")?.value as TRole | undefined;
    let status = request.cookies.get("userStatus")?.value || "ACTIVE";

    // 2. If cookies are not present, try decoding the JWT token (fast)
    if (!role) {
      const decoded = decodeJwt(token);
      if (decoded && decoded.role) {
        role = decoded.role as TRole;
        status = decoded.status || status;
      }
    }

    // 3. Fallback to API fetch ONLY if we still don't have the role
    let userData: { role: TRole; status: string } | null = null;
    if (role) {
      userData = { role, status };
    } else {
      userData = await getUserFromToken(token);
    }

    // If we can't get user data, redirect to login
    if (!userData) {
      // console.log('[Middleware] No user data, redirecting to sign-in');
      return NextResponse.redirect(
        new URL(`/sign-in?redirect=${encodeURIComponent(pathname)}`, request.url)
      );
    }

    // Check if user is suspended
    if (userData.status === "SUSPENDED") {
      // console.log('[Middleware] User suspended, redirecting to suspended page');
      // If already on suspended page, allow access
      if (pathname === "/account-suspended") {
        return NextResponse.next();
      }
      // Redirect to suspended page
      return NextResponse.redirect(new URL("/account-suspended", request.url));
    }

    // If user is not suspended but on suspended page, redirect to overview
    if (pathname === "/account-suspended" && userData.status !== "SUSPENDED") {
      return NextResponse.redirect(new URL("/overview", request.url));
    }

    // Check role-based access
    if (!isPathAllowed(userData.role, pathname)) {
      // console.log('[Middleware] Role not allowed, redirecting to unauthorized');
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // console.log('[Middleware] All checks passed, allowing access');
  }

  return NextResponse.next();
}

// export const config = {
//   matcher: dashboardItems.map((item) => `/${item.path}/:path*`),
// };

export const config = {
  matcher: [
    "/overview/:path*",
    "/mychannel/:path*",
    "/dashboard/:path*",
    "/subscriber/:path*",
    "/wallet/:path*",
    "/membership/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/account-suspended/:path*",
    "/channel-suspended/:path*",
    "/channel-under-review/:path*",
    "/channel-rejected/:path*",
    // "/settings/:path*",
  ],
};
