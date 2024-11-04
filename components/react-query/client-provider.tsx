"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";

const ReactQueryDevtools = dynamic(
  () => import("@tanstack/react-query-devtools").then((mod) => mod.ReactQueryDevtools),
  { ssr: false }
);

const ReactQueryClientProvider = ({children}: {children:React.ReactNode}) => (
    <QueryClientProvider client={new QueryClient()}>
      {children}
      {typeof window !== "undefined" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
)

export default ReactQueryClientProvider;