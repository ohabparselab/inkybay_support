// app/root.tsx
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import "react-quill-new/dist/quill.snow.css";
import type { Route } from "./+types/root";
import "./app.css";

import { ThemeProvider, useTheme, PreventFlashOnWrongTheme } from "remix-themes";
import { getUserPermissions } from "./lib/permissions.server";
import { themeSessionResolver } from "~/lib/theme.server";
import { getUser } from "@/lib/user.server";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

// Loader to fetch current user, permissions, and theme
export async function loader({ request }: LoaderFunctionArgs) {
  const currentUser = await getUser(request);
  let permissions: string[] = [];
  if (currentUser) {
    permissions = await getUserPermissions(currentUser.id);
  }

  const { getTheme } = await themeSessionResolver(request);
  const theme = getTheme(); // 'light' | 'dark' | null

  return { currentUser, permissions, theme };
}

// Html layout component (must be inside ThemeProvider to use useTheme)
function Html({ children }: { children: React.ReactNode }) {
  const [theme] = useTheme();
  return (
    <html lang="en" className={theme ?? "light"}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(theme)} />
      </head>
      <body>
        {children}
        <Toaster position="top-right" richColors />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Root App
export default function App() {
  const { currentUser, theme } = useLoaderData<typeof loader>();

  return (
    <ThemeProvider
      specifiedTheme={theme}
      themeAction="/action/set-theme"
    >
      <Html>
        <Outlet context={{ currentUser }} />
      </Html>
    </ThemeProvider>
  );
}

// Error Boundary
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
