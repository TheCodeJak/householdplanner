import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    familyId?: string | null;
    /** Farbe der Person (user.color), null solange sie in keiner Familie ist */
    color?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    familyId?: string | null;
    color?: string | null;
  }
}
