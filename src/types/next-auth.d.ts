import type { DefaultSession } from "next-auth";
import type { user_role } from "@/../generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: user_role;
      tenantId: string;
      tenantNombre: string;
      tenantSlug: string;
      tenantHost?: string;
      telefono?: string | null;
      image?: string | null; 
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: user_role;
    tenantId?: string;
    tenantNombre?: string;
    tenantSlug?: string;
    tenantHost?: string;
    telefono?: string | null;
    image?: string | null; 
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: user_role;
    tenantId?: string;
    tenantNombre?: string;
    tenantSlug?: string;
    tenantHost?: string;
    telefono?: string | null;
    image?: string | null;
  }
}

declare module "*.css";
