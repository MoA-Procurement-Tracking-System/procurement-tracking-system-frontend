import { redirect } from "next/navigation";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { requireAuthenticatedSession } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export default async function UserManagementPage() {
  const session = await requireAuthenticatedSession();

  if (session.user.role !== "ADMIN") {
    redirect("/access-denied");
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <CreateUserForm />
    </div>
  );
}
