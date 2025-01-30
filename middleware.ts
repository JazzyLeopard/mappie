import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const isProtectedRoute = createRouteMatcher(["/projects(.*)", "/workspace(.*)"]);
const restrictedRoutes = ['knowledge-base', 'work-items', 'settings'];
const publicRoutes = ['/sign-in', '/sign-up', '/onboarding'];

export default clerkMiddleware(async (auth, req: NextRequest) => {
  try {
    const { userId, getToken } = await auth();

    // Allow public routes without authentication
    if (publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Redirect to sign in if not authenticated
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    if (isProtectedRoute(req)) {
      const token = await getToken({ template: 'convex' });
      if (!token) {
        return NextResponse.redirect(new URL('/sign-in', req.url));
      }

      convex.setAuth(token);

      try {
        // Check if user has any workspaces
        const workspaces = await convex.query(api.workspaces.getWorkspaces);

        // If no workspaces and not on onboarding page, redirect to onboarding
        if ((!workspaces || workspaces.length === 0) && !req.nextUrl.pathname.startsWith('/onboarding')) {
          return NextResponse.redirect(new URL('/onboarding', req.url));
        }

        const pathname = req.nextUrl.pathname;

        // Check if the current route is restricted
        if (restrictedRoutes.some(route => pathname.includes(route))) {
          // Extract project ID from the URL
          const projectId = pathname.split('/')[2];

          try {
            // Fetch project details
            const project = await convex.query(api.projects.getProjectById, { projectId: projectId as any });
            return NextResponse.next();
          } catch (error) {
            console.error('Error fetching project details:', error);
            return NextResponse.redirect(new URL('/workspace', req.url));
          }
        }
      } catch (error) {
        console.error('Error checking workspaces:', error);
        return NextResponse.redirect(new URL('/sign-in', req.url));
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