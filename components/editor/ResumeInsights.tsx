import { calculateResumeCompletion, type ResumeDocument } from "@/lib/resume";

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export function ResumeInsights({ resume }: { resume: ResumeDocument }) {
  const completionScore = calculateResumeCompletion(resume);
  const summaryWords = resume.summary
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean).length;
  const skillsCount = resume.skills.filter((skill) => skill.trim()).length;
  const achievementCount = resume.experience.reduce(
    (total, item) =>
      total + item.achievements.filter((achievement) => achievement.trim()).length,
    0,
  );

  const suggestions = [
    !resume.personalInfo.phone.trim()
      ? "Add a phone number to improve contact completeness."
      : null,
    summaryWords < 40
      ? "Expand the summary with role-specific keywords and impact."
      : null,
    achievementCount < 4
      ? "Add more quantified bullet points under experience."
      : null,
    skillsCount < 6
      ? "List more hard skills and tools from your target job descriptions."
      : null,
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Completion" value={`${completionScore}%`} />
        <Metric label="Summary Words" value={`${summaryWords}`} />
        <Metric label="Achievement Bullets" value={`${achievementCount}`} />
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white/80 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Editor guidance
        </p>
        <div className="mt-4 grid gap-3">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <div
                className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"
                key={suggestion}
              >
                {suggestion}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
              Core sections are in good shape. The next boost will come from ATS scoring and JD matching.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
