import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:px-10 lg:px-12">
      <header className="flex items-center justify-between py-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
            ATS Builder
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            Firebase-ready resume platform scaffold
          </h1>
        </div>
        <nav className="flex items-center gap-3">
          <Link className="button-secondary" href="/login">
            Log in
          </Link>
          <Link className="button-primary" href="/signup">
            Start free
          </Link>
        </nav>
      </header>

      <section className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="card-surface flex flex-col gap-6 p-8 sm:p-10">
          <span className="pill">Phase 1 scaffold in place</span>
          <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Ship auth, sessions, and protected routes before the resume editor.
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            This starter now includes Firebase client/admin helpers, auth pages,
            session cookies, Firestore rules, and protected dashboard/editor
            routes tailored for Next.js 16.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className="button-primary" href="/signup">
              Check your ATS score free
            </Link>
            <Link className="button-secondary" href="/dashboard">
              Open dashboard
            </Link>
          </div>
        </div>

        <aside className="card-surface grid gap-4 p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Included now
            </p>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
              <li>Firebase client SDK bootstrap</li>
              <li>Firebase Admin session cookie route</li>
              <li>Next 16 `proxy.ts` auth redirects</li>
              <li>Login/signup flows with Google and email</li>
              <li>Protected dashboard and editor placeholders</li>
              <li>`.env.local.example` and `firestore.rules`</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
            Fill in your Firebase keys, enable Google + Email auth, then run
            `npm run dev`.
          </div>
        </aside>
      </section>
    </main>
  );
}
