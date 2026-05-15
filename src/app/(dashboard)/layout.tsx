import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex flex-col">
      <main className="mx-auto w-full flex-1 md:px-6 md:py-8">{children}</main>
    </div>
  );
}
