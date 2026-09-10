import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/site")({
  beforeLoad: () => {
    throw redirect({ to: "/admin" });
  },
});
