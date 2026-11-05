"use client";

import type { DragEvent, ReactNode } from "react";

export default function PrevenirArrastrePublico({
  children,
}: {
  children: ReactNode;
}) {
  const prevenirArrastre = (evento: DragEvent<HTMLDivElement>) => {
    evento.preventDefault();
  };

  return (
    <div className="contents" onDragStartCapture={prevenirArrastre}>
      {children}
    </div>
  );
}
