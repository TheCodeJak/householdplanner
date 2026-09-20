import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AppHeader from "../components/layout/appHeader";
import BottomNav from "../components/layout/bottomNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex flex-col w-full">
      <AppHeader />
      <main className="mx-auto w-full flex-1 md:px-6 md:py-8">{children}</main>
      <div className="h-16 md:hidden" />
      <BottomNav />
    </div>
  );
}
