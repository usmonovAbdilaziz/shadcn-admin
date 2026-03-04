import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/_authenticated/staff')({
  component: () => <div>Staff</div>,
});
