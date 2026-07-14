"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button, Card } from "@/components/ui";

export default function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl"
      >
        <Card variant="glass" className="p-8 md:p-10">
          <div className="grid gap-8 md:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-accent font-medium">
                SprintFlow
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-foreground">
                Secure enterprise login
              </h1>
              <p className="mt-4 text-foreground-secondary">
                This application protects every route with Google OAuth and
                database-backed sessions.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-foreground-secondary">
                <li className="flex gap-2">
                  <span className="text-accent">&#x2022;</span>
                  First Google login creates the Super Admin account
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">&#x2022;</span>
                  Only Super Admin can invite and manage users
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">&#x2022;</span>
                  All dashboard, project, sprint, and task APIs are protected
                </li>
              </ul>
            </div>
            <Card variant="elevated" className="p-6">
              <h2 className="text-xl font-semibold text-foreground">
                Sign in with Google
              </h2>
              <p className="mt-2 text-sm text-foreground-secondary">
                Use your Google workspace identity to enter the platform.
              </p>

              {error === "NoAccount" && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">
                      Access Denied
                    </p>
                    <p className="text-xs text-foreground-secondary mt-1">
                      No account exists. Please contact your administrator.
                    </p>
                  </div>
                </div>
              )}

              {error && error !== "NoAccount" && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground-secondary">
                    Authentication failed. Please try again.
                  </p>
                </div>
              )}

              <Button
                variant="gradient"
                size="lg"
                className="mt-6 w-full"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              >
                Continue with Google
              </Button>
            </Card>
          </div>
        </Card>
      </motion.div>
    </main>
  );
}
