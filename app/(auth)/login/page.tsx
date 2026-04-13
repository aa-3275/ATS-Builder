import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
      <div className="grid w-full items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden space-y-6 lg:block">
          <span className="pill">Phase 1</span>
          <h2 className="max-w-lg text-5xl font-semibold tracking-tight text-slate-950">
            Email auth, Google OAuth, and session cookies from the same scaffold.
          </h2>
          <p className="max-w-xl text-lg leading-8 text-slate-600">
            After login, the app creates a secure server session and keeps
            `/dashboard` and `/editor` behind Next.js route protection.
          </p>
          <Link className="button-secondary" href="/">
            Back to landing page
          </Link>
        </div>

        <div className="flex justify-center lg:justify-end">
          <AuthForm mode="login" />
        </div>
      </div>
    </main>
  );
}
