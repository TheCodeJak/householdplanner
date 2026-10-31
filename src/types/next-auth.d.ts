import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    familyId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    familyId?: string | null;
  }
}
