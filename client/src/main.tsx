import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        }).then(async (response) => {
          // Handle empty or invalid JSON responses (like harmony does)
          if (!response.ok) {
            const text = await response.text();
            let errorData;
            try {
              errorData = text ? JSON.parse(text) : { error: `HTTP ${response.status}` };
            } catch {
              errorData = { error: text || `HTTP ${response.status}: ${response.statusText}` };
            }
            throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
          }
          
          // Check if response has content
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            if (!text) {
              throw new Error("Empty response from server");
            }
            // Try to parse as JSON anyway
            try {
              return new Response(JSON.stringify({ data: JSON.parse(text) }), {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
              });
            } catch {
              throw new Error(`Invalid response format: ${text.substring(0, 100)}`);
            }
          }
          
          return response;
        }).catch((error) => {
          // Handle network errors and JSON parsing errors
          if (error instanceof TypeError && error.message.includes("fetch")) {
            throw new Error("Network error: Could not connect to server");
          }
          if (error.message.includes("JSON") || error.message.includes("Unexpected end")) {
            throw new Error("Server returned invalid response. Please try again.");
          }
          throw error;
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
