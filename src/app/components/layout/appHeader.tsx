"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { UserAvatar } from "../shared/userAvatar";

export default function AppHeader() {
  const { data: session } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="border border-gray-200 border-t-0 p-5 shadow-sm z-10">
      <div className="flex w-full items-center justify-between">
        <div className="flex gap-4 items-center">
          <Image src="\icon.svg" width={32} height={32} alt="" priority />
          <h1 className="font-semibold text-xl text-gray-800">
            Householdplanner
          </h1>
        </div>

        <div className="flex gap-4 items-center">
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 transition-colors"
            >
              {/* <p className="text-gray-700">{session?.user?.name}</p> */}
              <UserAvatar initial={session?.user?.name?.[0] ?? ""} />
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M2 4.5l4.5 5 4.5-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  color="gray"
                />
              </svg>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-1 w-40 rounded-xl border border-gray-100 bg-white py-1 shadow-lg z-50">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Abmelden
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
