import { type NextRequest, NextResponse } from "next/server";
import { authenticatedUser } from "./utils/amplify-server-utils";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const authUser = await authenticatedUser({ request, response });

  console.log(authUser);
  
  const isDashboardPath = request.nextUrl.pathname.startsWith("/dashboard");
  const isAdminAreaPath = request.nextUrl.pathname.startsWith("/dashboard/admins");

  // For dashboard routes, check if the user is authenticated
  if (isDashboardPath) {
    if (!authUser) {
      // Redirect to login page if not authenticated
      return NextResponse.redirect(new URL("/auth/login", request.nextUrl));
    }

    // For admin routes, check if the user is an admin
    if (isAdminAreaPath && !authUser.isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }

    return response;
  }

  // If the user is authenticated and trying to access a public route, redirect to the dashboard
  if (authUser) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  // Allow request to proceed if no conditions were met
  return response;
}


export const config = {
  /*
   * Match all request paths except for the ones starting with
   */
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)", 
    '/dashboard/:path*'
  ],
};
