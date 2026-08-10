import App from "../App";
import { redirect } from "next/navigation";
import { dashboardPath } from "../lib/authTypes";
import { getServerSession } from "../lib/serverAuth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession();
  if (session?.status === "PASSWORD_CHANGE_REQUIRED") {
    redirect("/change-password");
  }
  if (session?.status === "AUTHENTICATED") {
    redirect(dashboardPath(session.user.role));
  }
  return <App />;
}
