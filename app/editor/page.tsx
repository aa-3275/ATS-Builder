import Link from "next/link";
import { AnalyticsEventOnMount } from "@/components/analytics/AnalyticsEventOnMount";
import { ResumeEditor } from "@/components/editor/ResumeEditor";
import { requireUser } from "@/lib/auth-server";
import { getOrCreatePrimaryResume } from "@/lib/resume-server";

export default async function EditorPage() {
  const user = await requireUser();
  const resume = await getOrCreatePrimaryResume(user);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 px-6 py-10 sm:px-10">
      <section className="w-full space-y-6">
        <AnalyticsEventOnMount
          eventName="editor_viewed"
          properties={{ resume_id: resume.id }}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Signed in as {user.email ?? user.uid}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Working on <span className="font-semibold text-slate-900">{resume.title}</span>
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className="button-secondary" href="/dashboard">
              Dashboard
            </Link>
            <Link className="button-secondary" href="/">
              Landing page
            </Link>
          </div>
        </div>

        <ResumeEditor initialResume={resume} />
      </section>
    </main>
  );
}
