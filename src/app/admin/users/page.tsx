import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateUserForm } from "../../../components/admin/CreateUserForm";
import { MoALogo } from "../../../components/MoALogo";
import { SignOutButton } from "../../../components/dashboard/SignOutButton";
import { dashboardPath, ROLE_LABELS } from "../../../lib/authTypes";
import { getServerSession } from "../../../lib/serverAuth";

export const dynamic = "force-dynamic";

export default async function UserManagementPage() {
  const session = await getServerSession();
  if (!session) redirect("/");
  if (session.status === "PASSWORD_CHANGE_REQUIRED") {
    redirect("/change-password");
  }
  if (session.user.role !== "ADMIN") {
    redirect(dashboardPath(session.user.role));
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-5 py-3">
          <div className="flex items-center gap-4">
            <MoALogo size="sm" />
            <div className="hidden border-l border-slate-200 pl-4 sm:block">
              <p className="font-bold text-[#064e3b]">User Management</p>
              <p className="text-xs text-slate-500">
                {session.user.displayName} · {ROLE_LABELS[session.user.role]}
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-10">
        <Link
          href={dashboardPath("ADMIN")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-950"
        >
          <ArrowLeft size={17} aria-hidden="true" /> Back to dashboard
        </Link>
        <CreateUserForm />
      </div>
    </main>
  );
}
