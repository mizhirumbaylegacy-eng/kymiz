// Root layout — minimal passthrough.
// The actual <html>/<body> and font are rendered in app/[locale]/layout.tsx
// so that lang="..." can be set dynamically from the locale param.
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
