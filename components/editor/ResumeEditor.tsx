"use client";

import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { ResumeInsights } from "@/components/editor/ResumeInsights";
import { ResumePreview } from "@/components/editor/ResumePreview";
import { BasicsSection } from "@/components/editor/sections/BasicsSection";
import { EducationSection } from "@/components/editor/sections/EducationSection";
import { ExperienceSection } from "@/components/editor/sections/ExperienceSection";
import { SkillsSection } from "@/components/editor/sections/SkillsSection";
import { SummarySection } from "@/components/editor/sections/SummarySection";
import { useAutoSave } from "@/hooks/useAutoSave";
import { getFirebaseDb } from "@/lib/firebase";
import {
  calculateResumeCompletion,
  createResumeWritePayload,
  formatSavedAtLabel,
  sanitizeResume,
  type ResumeDocument,
} from "@/lib/resume";

type ResumeEditorProps = {
  initialResume: ResumeDocument;
};

export function ResumeEditor({ initialResume }: ResumeEditorProps) {
  const [resume, setResume] = useState(initialResume);
  const [activePane, setActivePane] = useState<"editor" | "preview">("editor");
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

  const updateResume = (updater: (resume: ResumeDocument) => ResumeDocument) => {
    startTransition(() => {
      setResume((current) => updater(current));
    });
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[1.04fr_0.96fr]">
      <section className={`space-y-6 ${activePane === "preview" ? "hidden xl:block" : ""}`}>
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
          <div className="flex rounded-full border border-slate-200 bg-white/80 p-1 xl:hidden">
            <button
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activePane === "editor" ? "bg-teal-700 text-white" : "text-slate-600"
              }`}
              onClick={() => {
                setActivePane("editor");
              }}
              type="button"
            >
              Edit
            </button>
            <button
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activePane === "preview" ? "bg-teal-700 text-white" : "text-slate-600"
              }`}
              onClick={() => {
                setActivePane("preview");
              }}
              type="button"
            >
              Preview
            </button>
          </div>
          {error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>

        <ResumeInsights resume={resume} />
        <BasicsSection onChange={updateResume} resume={resume} />
        <SummarySection onChange={updateResume} resume={resume} />
        <ExperienceSection onChange={updateResume} resume={resume} />
        <EducationSection onChange={updateResume} resume={resume} />
        <SkillsSection onChange={updateResume} resume={resume} />
      </section>

      <aside
        className={`space-y-4 xl:sticky xl:top-6 xl:self-start ${activePane === "editor" ? "hidden xl:block" : ""}`}
      >
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
