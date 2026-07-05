"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

import { AuthProvider } from "@/lib/auth/auth-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          style: {
            background: "#ffffff",
            border: "1px solid #d4dde2",
            color: "#17232b",
            boxShadow: "0 16px 42px rgba(23, 35, 43, 0.12)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
