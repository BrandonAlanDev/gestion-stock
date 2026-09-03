import type { DefaultSession } from "next-auth";
import type { RolTenant } from "@/types/tenants";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: RolTenant;
      tenantId: string;
      tenantNombre: string;
      tenantSlug: string;
      telefono?: string | null;
      image?: string | null; 
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: RolTenant;
    tenantId?: string;
    tenantNombre?: string;
    tenantSlug?: string;
    telefono?: string | null;
    image?: string | null; 
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: RolTenant;
    tenantId?: string;
    tenantNombre?: string;
    tenantSlug?: string;
    telefono?: string | null;
    image?: string | null;
  }
}

declare module "*.css";
