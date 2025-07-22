// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute=createRouteMatcher([
  "/dashboard(.*)",
  "/resume(.*)",
  "/interview(.*)",
  "/cover-letter(.*)",
  "/onboarding(.*)",
]);


export default clerkMiddleware( async (auth,req)=>{
  const {userId}=await auth()
  if(!userId&&isProtectedRoute(req)){
    const  {redirectToSignIn}=await auth();
    return redirectToSignIn();
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Protect all routes except static files and Next.js internals
    '/((?!_next|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|css|js)).*)',
    '/(api|trpc)(.*)', // Optional: if using API routes
  ],
};
