"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { ResumePreview } from "@/components/editor/ResumePreview";
import { useAutoSave } from "@/hooks/useAutoSave";
import { getFirebaseDb } from "@/lib/firebase";
import {
  calculateResumeCompletion,
  createEmptyEducation,
  createEmptyExperience,
  createResumeWritePayload,
  formatSavedAtLabel,
  sanitizeResume,
  type ResumeDocument,
} from "@/lib/resume";

function SectionCard({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white/80 p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="space-y-2">
      <span className="input-label">{label}</span>
      {children}
    </label>
  );
}

type ResumeEditorProps = {
  initialResume: ResumeDocument;
};

export function ResumeEditor({ initialResume }: ResumeEditorProps) {
  const [resume, setResume] = useState(initialResume);
  const deferredResume = useDeferredValue(resume);

  const completionScore = useMemo(
    () => calculateResumeCompletion(resume),
    [resume],
  );

  const { error, lastSavedAt, status } = useAutoSave({
    value: resume,
    onSave: async (nextResume) => {
      const sanitized = sanitizeResume(nextResume);

      await setDoc(
        doc(getFirebaseDb(), "resumes", sanitized.id),
        {
          ...createResumeWritePayload(sanitized),
          updatedAt: serverTimestamp(),
          lastSavedAt: serverTimestamp(),
        },
        { merge: true },
      );
    },
  });

  return (
    <div className="grid gap-8 xl:grid-cols-[1.04fr_0.96fr]">
      <section className="space-y-6">
        <div className="card-surface flex flex-col gap-4 p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <span className="pill">Connected editor</span>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                Edit resume content and autosave to Firestore
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                Changes debounce for 2 seconds, save to the `resumes` collection,
                and update the live preview on the right.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/85 px-4 py-3 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">
                  Completion:
                </span>{" "}
                {completionScore}%
              </p>
              <p className="mt-1">
                <span className="font-semibold text-slate-900">Status:</span>{" "}
                {status === "pending"
                  ? "Waiting to save..."
                  : status === "saving"
                    ? "Saving..."
                    : status === "saved"
                      ? `Saved ${formatSavedAtLabel(lastSavedAt)}`
                      : status === "error"
                        ? "Save failed"
                        : "No unsaved changes"}
              </p>
            </div>
          </div>
          {error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>

        <SectionCard
          description="Use plain text contact details and avoid graphics so the exported resume remains ATS-safe."
          title="Basics"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Resume title">
              <input
                className="input-field"
                onChange={(event) => {
                  setResume((current) => ({
                    ...current,
                    title: event.target.value,
                  }));
                }}
                value={resume.title}
              />
            </Field>
            <Field label="Full name">
              <input
                className="input-field"
                onChange={(event) => {
                  setResume((current) => ({
                    ...current,
                    personalInfo: {
                      ...current.personalInfo,
                      fullName: event.target.value,
                    },
                  }));
                }}
                value={resume.personalInfo.fullName}
              />
            </Field>
            <Field label="Email">
              <input
                className="input-field"
                onChange={(event) => {
                  setResume((current) => ({
                    ...current,
                    personalInfo: {
                      ...current.personalInfo,
                      email: event.target.value,
                    },
                  }));
                }}
                value={resume.personalInfo.email}
              />
            </Field>
            <Field label="Phone">
              <input
                className="input-field"
                onChange={(event) => {
                  setResume((current) => ({
                    ...current,
                    personalInfo: {
                      ...current.personalInfo,
                      phone: event.target.value,
                    },
                  }));
                }}
                value={resume.personalInfo.phone}
              />
            </Field>
            <Field label="Location">
              <input
                className="input-field"
                onChange={(event) => {
                  setResume((current) => ({
                    ...current,
                    personalInfo: {
                      ...current.personalInfo,
                      location: event.target.value,
                    },
                  }));
                }}
                value={resume.personalInfo.location}
              />
            </Field>
            <Field label="LinkedIn">
              <input
                className="input-field"
                onChange={(event) => {
                  setResume((current) => ({
                    ...current,
                    personalInfo: {
                      ...current.personalInfo,
                      linkedIn: event.target.value,
                    },
                  }));
                }}
                value={resume.personalInfo.linkedIn}
              />
            </Field>
            <Field label="Portfolio">
              <input
                className="input-field"
                onChange={(event) => {
                  setResume((current) => ({
                    ...current,
                    personalInfo: {
                      ...current.personalInfo,
                      portfolio: event.target.value,
                    },
                  }));
                }}
                value={resume.personalInfo.portfolio}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          description="Keep this to 2-4 lines and tailor it to the role you are targeting."
          title="Summary"
        >
          <Field label="Professional summary">
            <textarea
              className="input-field min-h-36 resize-y"
              onChange={(event) => {
                setResume((current) => ({
                  ...current,
                  summary: event.target.value,
                }));
              }}
              value={resume.summary}
            />
          </Field>
        </SectionCard>

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
                        setResume((current) => ({
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
                        setResume((current) => ({
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
                        setResume((current) => ({
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
                        setResume((current) => ({
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
                      setResume((current) => ({
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
                        setResume((current) => ({
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
                    setResume((current) => ({
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
              setResume((current) => ({
                ...current,
                experience: [...current.experience, createEmptyExperience()],
              }));
            }}
            type="button"
          >
            Add experience
          </button>
        </SectionCard>

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
                        setResume((current) => ({
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
                        setResume((current) => ({
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
                        setResume((current) => ({
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
                        setResume((current) => ({
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
                    setResume((current) => ({
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
              setResume((current) => ({
                ...current,
                education: [...current.education, createEmptyEducation()],
              }));
            }}
            type="button"
          >
            Add education
          </button>
        </SectionCard>

        <SectionCard
          description="Separate skills with commas or line breaks. Use keywords from job descriptions."
          title="Skills"
        >
          <Field label="Skills list">
            <textarea
              className="input-field min-h-28 resize-y"
              onChange={(event) => {
                setResume((current) => ({
                  ...current,
                  skills: event.target.value
                    .split(/[\n,]/)
                    .map((skill) => skill.trimStart()),
                }));
              }}
              value={resume.skills.join(", ")}
            />
          </Field>
        </SectionCard>
      </section>

      <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
        <div className="card-surface p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Live preview
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Single-column, ATS-friendly structure with no tables or images.
          </p>
        </div>
        <ResumePreview resume={deferredResume} />
      </aside>
    </div>
  );
}
