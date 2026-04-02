"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState } from "react";
import { QUERY_STALE_TIME, QUERY_GC_TIME } from "@/lib/timeConstants";

export default function QueryProvider({ children }: { children: ReactNode }) {
  // 確保在整個 Client 端生命週期中只建立一次 QueryClient
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME,
        gcTime: QUERY_GC_TIME,
        retry: 1,
        refetchOnWindowFocus: false,
        // 針對 React 19 優化：確保在掛載時正確追蹤狀態
        refetchOnMount: true,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
