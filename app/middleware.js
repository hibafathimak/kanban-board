import Cookies from "js-cookie";
import { NextResponse } from "next/server";

function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const token = Cookies.get("token");
  if (pathname === "/" || !token) {
    return NextResponse.redirect(new URL("/pages/login", request.url));
  }
  if (pathname === "/pages/login" && token) {
    return NextResponse.redirect(new URL("/pages/home", request.url));
  }
}

export default middleware;
