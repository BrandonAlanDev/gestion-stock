"use client";
import Header from "@/components/Header";
import SessionWrapper from "./providers/SessionWrapper";
import { Toaster } from "sonner";

export default function LayoutComponent({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <SessionWrapper>
      <Header session={session} />
      {children}
      <Toaster richColors position="top-right" closeButton />    </SessionWrapper>
  );
}