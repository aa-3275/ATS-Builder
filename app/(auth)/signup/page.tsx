import Link from "next/link";
import { AnalyticsEventOnMount } from "@/components/analytics/AnalyticsEventOnMount";
import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
      <AnalyticsEventOnMount eventName="signup_viewed" />
      <div className="grid w-full items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden space-y-6 lg:block">
          <span className="pill">Firebase ready</span>
          <h2 className="max-w-lg text-5xl font-semibold tracking-tight text-slate-950">
            Set up once, then move straight into the resume editor phase.
          </h2>
          <p className="max-w-xl text-lg leading-8 text-slate-600">
            First-time sign-ins create a matching Firestore user record so the
            dashboard and autosave flows have a clean foundation.
          </p>
          <Link className="button-secondary" href="/">
            Back to landing page
          </Link>
        </div>

        <div className="flex justify-center lg:justify-end">
          <AuthForm mode="signup" />
        </div>
      </div>
    </main>
  );
}
