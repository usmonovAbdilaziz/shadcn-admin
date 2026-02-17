import { AdminUsers } from "@/components/admin/users"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <AdminUsers/>
  </div>
}