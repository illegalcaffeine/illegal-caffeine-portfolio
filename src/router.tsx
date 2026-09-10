import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // CMS-backed portfolio content must reflect admin saves immediately.
    // Do not reuse speculative or inactive route data when returning to public pages.
    defaultPreloadStaleTime: 0,
    defaultGcTime: 0,
    defaultStaleReloadMode: "blocking",
  });

  return router;
};
