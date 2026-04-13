import Link from "next/link";
import { AnalyticsEventOnMount } from "@/components/analytics/AnalyticsEventOnMount";
import { AnalyticsLink } from "@/components/analytics/AnalyticsLink";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { requireUser } from "@/lib/auth-server";
import { formatSavedAtLabel } from "@/lib/resume";
import { listUserResumes } from "@/lib/resume-server";

function formatExportLabel(value: string | null) {
  if (!value) {
    return "No exports yet";
  }

  return formatSavedAtLabel(value);
}

function getScoreBucket(score: number | null) {
  if (typeof score !== "number") {
    return "pending";
  }

  if (score >= 80) {
    return "strong";
  }
  if (score >= 60) {
    return "good";
  }

  return "needs-work";
}

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string | string[]; sort?: string | string[] }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const filter = normalizeParam(params.filter) || "all";
  const sort = normalizeParam(params.sort) || "updated";
  const resumes = await listUserResumes(user.uid);
  const totalPdfExports = resumes.reduce(
    (sum, resume) => sum + resume.exports.pdf,
    0,
  );
  const totalDocxExports = resumes.reduce(
    (sum, resume) => sum + resume.exports.docx,
    0,
  );
  const totalExports = totalPdfExports + totalDocxExports;
  const mostRecentExport = resumes
    .map((resume) => resume.exports.lastExportedAt)
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] ?? null;
  const filteredResumes = resumes
    .filter((resume) => filter === "all" || getScoreBucket(resume.atsScore) === filter)
    .sort((left, right) => {
      if (sort === "ats") {
        return (right.atsScore ?? -1) - (left.atsScore ?? -1);
      }

      if (sort === "completion") {
        return right.completionScore - left.completionScore;
      }

      const leftTime = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
      const rightTime = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;
      return rightTime - leftTime;
    });
  const strongCount = resumes.filter(
    (resume) => getScoreBucket(resume.atsScore) === "strong",
  ).length;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 px-6 py-10 sm:px-10">
      <section className="card-surface w-full space-y-8 p-8 sm:p-10">
        <AnalyticsEventOnMount
          eventName="dashboard_viewed"
          properties={{
            filter,
            resume_count: resumes.length,
            sort,
            strong_count: strongCount,
          }}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <span className="pill">Protected route</span>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
              Your ATS dashboard
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              This page is protected by `proxy.ts` plus a secure session check on
              the server. It now reads real resume documents from Firestore and
              routes you into the connected editor.
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white/85 p-5">
            <p className="text-sm font-semibold text-slate-500">UID</p>
            <p className="mt-3 break-all text-sm text-slate-800">{user.uid}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/85 p-5">
            <p className="text-sm font-semibold text-slate-500">Email</p>
            <p className="mt-3 text-sm text-slate-800">
              {user.email ?? "Not available"}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/85 p-5">
            <p className="text-sm font-semibold text-slate-500">Display name</p>
            <p className="mt-3 text-sm text-slate-800">
              {user.name ?? "Add this later in profile settings"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white/85 p-5">
            <p className="text-sm font-semibold text-slate-500">Total exports</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {totalExports}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Across PDF and DOCX downloads
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/85 p-5">
            <p className="text-sm font-semibold text-slate-500">PDF vs DOCX</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {totalPdfExports} / {totalDocxExports}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              PDF downloads first, DOCX downloads second
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/85 p-5">
            <p className="text-sm font-semibold text-slate-500">Last export</p>
            <p className="mt-3 text-sm text-slate-800">
              {formatExportLabel(mostRecentExport)}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white/85 p-5">
            <p className="text-sm font-semibold text-slate-500">Quick filters</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                ["all", "All resumes"],
                ["strong", "Strong ATS"],
                ["good", "Good ATS"],
                ["needs-work", "Needs work"],
                ["pending", "ATS pending"],
              ].map(([value, label]) => (
                <Link
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    filter === value
                      ? "bg-teal-700 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  href={`/dashboard?filter=${value}&sort=${sort}`}
                  key={value}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/85 p-5">
            <p className="text-sm font-semibold text-slate-500">Sort</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                ["updated", "Recently updated"],
                ["ats", "Highest ATS"],
                ["completion", "Most complete"],
              ].map(([value, label]) => (
                <Link
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    sort === value
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  href={`/dashboard?filter=${filter}&sort=${value}`}
                  key={value}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Saved resumes</h2>
              <p className="mt-1 text-sm text-slate-600">
                Showing {filteredResumes.length} of {resumes.length} resumes.
              </p>
            </div>
            <AnalyticsLink
              className="button-primary"
              eventName="dashboard_open_editor_clicked"
              href="/editor"
              properties={{ location: "dashboard_header" }}
            >
              Open editor
            </AnalyticsLink>
          </div>

          <div className="grid gap-4">
            {filteredResumes.length > 0 ? (
              filteredResumes.map((resume) => (
                <div
                  className="rounded-3xl border border-slate-200 bg-white/85 p-5"
                  key={resume.id}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">
                        {resume.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Updated {formatSavedAtLabel(resume.updatedAt)}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Exports: {resume.exports.pdf} PDF, {resume.exports.docx} DOCX
                        {" | "}
                        {resume.exports.lastFormat
                          ? `Last ${resume.exports.lastFormat.toUpperCase()} ${formatExportLabel(
                              resume.exports.lastExportedAt,
                            )}`
                          : "No export history yet"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                        {resume.completionScore}% complete
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                        {typeof resume.atsScore === "number"
                          ? `ATS ${resume.atsScore}`
                          : "ATS pending"}
                      </span>
                      <AnalyticsLink
                        className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
                        eventName="dashboard_resume_opened"
                        href="/editor"
                        properties={{
                          ats_score: resume.atsScore ?? null,
                          resume_id: resume.id,
                        }}
                      >
                        Open
                      </AnalyticsLink>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-600">
                Your first resume will appear here after the editor creates it.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

