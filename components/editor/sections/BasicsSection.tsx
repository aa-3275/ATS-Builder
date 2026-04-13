import type { ResumeDocument } from "@/lib/resume";
import { Field, SectionCard } from "@/components/editor/shared";

type BasicsSectionProps = {
  onChange: (updater: (resume: ResumeDocument) => ResumeDocument) => void;
  resume: ResumeDocument;
};

export function BasicsSection({ onChange, resume }: BasicsSectionProps) {
  return (
    <SectionCard
      description="Use plain text contact details and avoid graphics so the exported resume remains ATS-safe."
      title="Basics"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Resume title">
          <input
            className="input-field"
            onChange={(event) => {
              onChange((current) => ({
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
              onChange((current) => ({
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
              onChange((current) => ({
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
              onChange((current) => ({
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
              onChange((current) => ({
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
              onChange((current) => ({
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
              onChange((current) => ({
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
  );
}
