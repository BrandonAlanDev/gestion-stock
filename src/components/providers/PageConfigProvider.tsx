"use client";

import {
  createContext,
  useContext,
} from "react";

interface PageConfigContextType {
  ok: boolean;
  pageConfig: Record<string, unknown>;
}

const PageConfigContext =
  createContext<PageConfigContextType | null>(null);

export function PageConfigProvider({
  children,
  pageConfig,
}: {
  children: React.ReactNode;
  pageConfig: PageConfigContextType;
}) {
  return (
    <PageConfigContext.Provider
      value={pageConfig}
    >
      {children}
    </PageConfigContext.Provider>
  );
}

export function usePageConfig(): PageConfigContextType {
  const ctx = useContext(PageConfigContext);
  return ctx ?? { ok: false, pageConfig: {} };
}