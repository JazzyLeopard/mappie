import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const isProtectedRoute = createRouteMatcher(["/projects(.*)"]);
const restrictedRoutes = ['functional-requirements', 'user-journeys', 'use-cases', 'epics'];

export default clerkMiddleware(async (auth, req: NextRequest) => {
  try {
    if (isProtectedRoute(req)) {
      const { userId, getToken } = await auth()
      const token = await getToken({ template: 'convex' })
      if (!userId || !token) {
        // User is not authenticated, redirect to login
        return NextResponse.redirect(new URL('/sign-in', req.url));
      }

      convex.setAuth(token)

      const pathname = req.nextUrl.pathname;

      // Check if the current route is restricted
      if (restrictedRoutes.some(route => pathname.includes(route))) {
        // Extract project ID from the URL
        const projectId = pathname.split('/')[2]; // Assumes URL structure like /projects/:projectId/:route

        try {
          // Fetch project details
          const project = await convex.query(api.projects.getProjectById, { projectId: projectId as any });
          return NextResponse.next();

        } catch (error) {
          console.error('Error fetching project details:', error);
          // In case of error, redirect to a safe page
          return NextResponse.redirect(new URL(`/epics`, req.url));
        }
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', {
      url: req.url,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'Unknown stack',
    });
    return new Response('Internal Server Error', { status: 500 });
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};