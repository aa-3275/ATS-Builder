import { AnalyticsEventOnMount } from "@/components/analytics/AnalyticsEventOnMount";
import { AnalyticsLink } from "@/components/analytics/AnalyticsLink";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:px-10 lg:px-12">
      <AnalyticsEventOnMount eventName="landing_viewed" />

      <header className="flex items-center justify-between py-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
            ATS Builder
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            Free ATS resume scoring for real job applications
          </h1>
        </div>
        <nav className="flex items-center gap-4">
          <AnalyticsLink
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
            eventName="landing_login_clicked"
            href="/login"
            properties={{ location: "header" }}
          >
            Log in
          </AnalyticsLink>
        </nav>
      </header>

      <section className="mt-12 grid gap-8 lg:grid-cols-[1.28fr_0.72fr]">
        <div className="card-surface flex flex-col gap-6 overflow-hidden p-8 sm:p-10">
          <span className="pill">Launch-ready workflow</span>
          <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Check your ATS score free, tailor your resume, and export it in one flow.
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Upload your content into an ATS-safe editor, get a score with concrete
            fixes, compare it against a job description, then download PDF or DOCX
            without leaving the browser.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <AnalyticsLink
              className="button-primary"
              eventName="landing_cta_clicked"
              href="/signup"
              properties={{ cta: "check_ats_score_free", location: "hero" }}
            >
              Check your ATS score free
            </AnalyticsLink>
            <p className="text-sm leading-6 text-slate-600">
              Free entry point. Google or email signup. ATS score, JD matching, and
              exports live in the same workspace.
            </p>
          </div>

          <div className="grid gap-4 pt-2 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                ATS score
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Grade keyword density, formatting, section completeness, and quantified impact.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                JD matcher
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Paste a job description and see the missing terms you should add honestly.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Export
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Download PDF in-browser or DOCX from a protected export route.
              </p>
            </div>
          </div>
        </div>

        <aside className="card-surface grid gap-4 p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Why this is useful
            </p>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
              <li>Single-column, ATS-safe editing experience</li>
              <li>Protected dashboard with resume score badges</li>
              <li>Client-side PDF generation with no server render cost</li>
              <li>Owner-scoped Firestore data and session-protected routes</li>
              <li>Launch analytics ready with PostHog event tracking</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
            One primary CTA drives the launch funnel: land, sign up, score the
            resume, then export the improved version.
          </div>
        </aside>
      </section>
    </main>
  );
}
