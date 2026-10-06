import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import BottomNav from "../components/layout/BottomNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex flex-col w-full">
      {/* <AppHeader /> */}
      <main className="mx-auto w-full flex-1 md:px-6 md:py-8">
        {/* bg-[#fdf2d4] */}
        {children}
      </main>
      <div className="h-16 md:hidden" />
      <BottomNav />
    </div>
  );
}
