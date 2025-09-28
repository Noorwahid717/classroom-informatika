import { ContentManager } from "../../../components/content-manager";
import { getCurrentUser } from "../../../server-actions/get-current-user";
import { redirect } from "next/navigation";

export default async function ContentPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "MENTOR")) {
    redirect("/register");
  }

  return (
    <div className="p-10">
      <ContentManager />
    </div>
  );
}
