import {
  createEmptyEducation,
  type ResumeDocument,
} from "@/lib/resume";
import { Field, SectionCard } from "@/components/editor/shared";

type EducationSectionProps = {
  onChange: (updater: (resume: ResumeDocument) => ResumeDocument) => void;
  resume: ResumeDocument;
};

export function EducationSection({
  onChange,
  resume,
}: EducationSectionProps) {
  return (
    <SectionCard
      description="Keep education concise unless you're early in your career."
      title="Education"
    >
      <div className="space-y-5">
        {resume.education.map((item) => (
          <div
            className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5"
            key={item.id}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="School">
                <input
                  className="input-field"
                  onChange={(event) => {
                    onChange((current) => ({
                      ...current,
                      education: current.education.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, school: event.target.value }
                          : entry,
                      ),
                    }));
                  }}
                  value={item.school}
                />
              </Field>
              <Field label="Degree">
                <input
                  className="input-field"
                  onChange={(event) => {
                    onChange((current) => ({
                      ...current,
                      education: current.education.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, degree: event.target.value }
                          : entry,
                      ),
                    }));
                  }}
                  value={item.degree}
                />
              </Field>
              <Field label="Start date">
                <input
                  className="input-field"
                  onChange={(event) => {
                    onChange((current) => ({
                      ...current,
                      education: current.education.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, startDate: event.target.value }
                          : entry,
                      ),
                    }));
                  }}
                  value={item.startDate}
                />
              </Field>
              <Field label="End date">
                <input
                  className="input-field"
                  onChange={(event) => {
                    onChange((current) => ({
                      ...current,
                      education: current.education.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, endDate: event.target.value }
                          : entry,
                      ),
                    }));
                  }}
                  value={item.endDate}
                />
              </Field>
            </div>

            <button
              className="mt-4 text-sm font-semibold text-rose-700"
              onClick={() => {
                onChange((current) => ({
                  ...current,
                  education:
                    current.education.length > 1
                      ? current.education.filter((entry) => entry.id !== item.id)
                      : current.education,
                }));
              }}
              type="button"
            >
              Remove education
            </button>
          </div>
        ))}
      </div>

      <button
        className="button-secondary mt-5"
        onClick={() => {
          onChange((current) => ({
            ...current,
            education: [...current.education, createEmptyEducation()],
          }));
        }}
        type="button"
      >
        Add education
      </button>
    </SectionCard>
  );
}
