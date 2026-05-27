"use client";

import {
  createContext,
  useContext,
} from "react";

const PageConfigContext =
  createContext<any>(null);

export function PageConfigProvider({
  children,
  pageConfig,
}: any) {
  return (
    <PageConfigContext.Provider
      value={pageConfig}
    >
      {children}
    </PageConfigContext.Provider>
  );
}

export function usePageConfig() {
  return useContext(
    PageConfigContext
  );
}