"use client";
import  Header  from "@/components/Header";
import SessionWrapper from "./providers/SessionWrapper";

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
    </SessionWrapper>
  );
}