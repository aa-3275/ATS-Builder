import {
  createEmptyExperience,
  type ResumeDocument,
} from "@/lib/resume";
import { Field, SectionCard } from "@/components/editor/shared";

type ExperienceSectionProps = {
  onChange: (updater: (resume: ResumeDocument) => ResumeDocument) => void;
  resume: ResumeDocument;
};

export function ExperienceSection({
  onChange,
  resume,
}: ExperienceSectionProps) {
  return (
    <SectionCard
      description="Use quantified achievements. One bullet per line in the textarea."
      title="Experience"
    >
      <div className="space-y-5">
        {resume.experience.map((item) => (
          <div
            className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5"
            key={item.id}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Role">
                <input
                  className="input-field"
                  onChange={(event) => {
                    onChange((current) => ({
                      ...current,
                      experience: current.experience.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, title: event.target.value }
                          : entry,
                      ),
                    }));
                  }}
                  value={item.title}
                />
              </Field>
              <Field label="Company">
                <input
                  className="input-field"
                  onChange={(event) => {
                    onChange((current) => ({
                      ...current,
                      experience: current.experience.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, company: event.target.value }
                          : entry,
                      ),
                    }));
                  }}
                  value={item.company}
                />
              </Field>
              <Field label="Start date">
                <input
                  className="input-field"
                  onChange={(event) => {
                    onChange((current) => ({
                      ...current,
                      experience: current.experience.map((entry) =>
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
                  disabled={item.current}
                  onChange={(event) => {
                    onChange((current) => ({
                      ...current,
                      experience: current.experience.map((entry) =>
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

            <label className="mt-4 flex items-center gap-3 text-sm text-slate-700">
              <input
                checked={item.current}
                onChange={(event) => {
                  onChange((current) => ({
                    ...current,
                    experience: current.experience.map((entry) =>
                      entry.id === item.id
                        ? {
                            ...entry,
                            current: event.target.checked,
                            endDate: event.target.checked ? "" : entry.endDate,
                          }
                        : entry,
                    ),
                  }));
                }}
                type="checkbox"
              />
              I currently work here
            </label>

            <div className="mt-4">
              <Field label="Achievements">
                <textarea
                  className="input-field min-h-32 resize-y"
                  onChange={(event) => {
                    onChange((current) => ({
                      ...current,
                      experience: current.experience.map((entry) =>
                        entry.id === item.id
                          ? {
                              ...entry,
                              achievements: event.target.value
                                .split("\n")
                                .map((line) => line.trimStart()),
                            }
                          : entry,
                      ),
                    }));
                  }}
                  value={item.achievements.join("\n")}
                />
              </Field>
            </div>

            <button
              className="mt-4 text-sm font-semibold text-rose-700"
              onClick={() => {
                onChange((current) => ({
                  ...current,
                  experience:
                    current.experience.length > 1
                      ? current.experience.filter((entry) => entry.id !== item.id)
                      : current.experience,
                }));
              }}
              type="button"
            >
              Remove experience
            </button>
          </div>
        ))}
      </div>

      <button
        className="button-secondary mt-5"
        onClick={() => {
          onChange((current) => ({
            ...current,
            experience: [...current.experience, createEmptyExperience()],
          }));
        }}
        type="button"
      >
        Add experience
      </button>
    </SectionCard>
  );
}
