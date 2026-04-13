import {
  formatResumeDate,
  type EducationItem,
  type ExperienceItem,
  type ResumeDocument,
} from "@/lib/resume";

function Section({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="space-y-3">
      <h3 className="border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {title}
      </h3>
      {children}
    </section>
  );
}

function ExperienceRow({ item }: { item: ExperienceItem }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-900">
            {item.title || "Role title"}
          </p>
          <p className="text-sm text-slate-600">{item.company || "Company"}</p>
        </div>
        <p className="text-sm text-slate-500">
          {formatResumeDate(item.startDate, "Start")} -{" "}
          {item.current ? "Present" : formatResumeDate(item.endDate, "End")}
        </p>
      </div>
      <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
        {item.achievements.filter(Boolean).length > 0 ? (
          item.achievements
            .filter(Boolean)
            .map((achievement) => <li key={achievement}>{achievement}</li>)
        ) : (
          <li>Add measurable achievements here.</li>
        )}
      </ul>
    </div>
  );
}

function EducationRow({ item }: { item: EducationItem }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-base font-semibold text-slate-900">
          {item.degree || "Degree"}
        </p>
        <p className="text-sm text-slate-600">{item.school || "School"}</p>
      </div>
      <p className="text-sm text-slate-500">
        {formatResumeDate(item.startDate, "Start")} -{" "}
        {formatResumeDate(item.endDate, "End")}
      </p>
    </div>
  );
}

export function ResumePreview({ resume }: { resume: ResumeDocument }) {
  const contactItems = [
    resume.personalInfo.email,
    resume.personalInfo.phone,
    resume.personalInfo.location,
    resume.personalInfo.linkedIn,
    resume.personalInfo.portfolio,
  ].filter(Boolean);

  return (
    <article className="min-h-[960px] rounded-[2rem] bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-10">
      <header className="space-y-3 border-b border-slate-200 pb-6">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
          {resume.personalInfo.fullName || "Your Name"}
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          {contactItems.length > 0
            ? contactItems.join("  |  ")
            : "Email | Phone | Location | LinkedIn | Portfolio"}
        </p>
      </header>

      <div className="mt-6 space-y-6">
        <Section title="Professional Summary">
          <p className="text-sm leading-7 text-slate-700">
            {resume.summary || "Write a concise summary tailored to your target role."}
          </p>
        </Section>

        <Section title="Experience">
          <div className="space-y-5">
            {resume.experience.length > 0 ? (
              resume.experience.map((item) => (
                <ExperienceRow item={item} key={item.id} />
              ))
            ) : (
              <p className="text-sm text-slate-600">Add experience entries.</p>
            )}
          </div>
        </Section>

        <Section title="Education">
          <div className="space-y-4">
            {resume.education.length > 0 ? (
              resume.education.map((item) => (
                <EducationRow item={item} key={item.id} />
              ))
            ) : (
              <p className="text-sm text-slate-600">Add education entries.</p>
            )}
          </div>
        </Section>

        <Section title="Skills">
          <p className="text-sm leading-7 text-slate-700">
            {resume.skills.filter(Boolean).length > 0
              ? resume.skills.filter(Boolean).join(" | ")
              : "List hard skills, tools, and role-specific keywords."}
          </p>
        </Section>
      </div>
    </article>
  );
}
