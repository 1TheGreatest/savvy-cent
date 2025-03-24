// this middleware runs before the app runs.
import arcjet, { createMiddleware, detectBot, shield } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Block common attacks e.g. SQL injection, XSS, CSRF
    shield({
      // Will block requests. Use "DRY_RUN" to log only
      mode: "LIVE",
    }),
    detectBot({
      // Will block requests. Use "DRY_RUN" to log only
      mode: "LIVE",
      // Configured with a list of bots to allow.
      // All other detected bots will be blocked
      // See https://arcjet.com/bot-list
      allow: [
        "CATEGORY:SEARCH_ENGINE", // All search engines
        "GO_HTTP", // Go HTTP client
      ],
    }),
  ],
});

const clerk = clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  if (!userId && isProtectedRoute(request)) {
    const { redirectToSignIn } = await auth();

    return redirectToSignIn();
  }
});

export default createMiddleware(aj, clerk);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
