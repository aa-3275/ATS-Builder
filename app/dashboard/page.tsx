import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { requireUser } from "@/lib/auth-server";
import { formatSavedAtLabel } from "@/lib/resume";
import { listUserResumes } from "@/lib/resume-server";

export default async function DashboardPage() {
  const user = await requireUser();
  const resumes = await listUserResumes(user.uid);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 px-6 py-10 sm:px-10">
      <section className="card-surface w-full space-y-8 p-8 sm:p-10">
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Saved resumes</h2>
            <Link className="button-primary" href="/editor">
              Open editor
            </Link>
          </div>

          <div className="grid gap-4">
            {resumes.length > 0 ? (
              resumes.map((resume) => (
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
