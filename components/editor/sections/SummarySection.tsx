import type { ResumeDocument } from "@/lib/resume";
import { Field, SectionCard } from "@/components/editor/shared";

type SummarySectionProps = {
  onChange: (updater: (resume: ResumeDocument) => ResumeDocument) => void;
  resume: ResumeDocument;
};

export function SummarySection({ onChange, resume }: SummarySectionProps) {
  return (
    <SectionCard
      description="Keep this to 2-4 lines and tailor it to the role you are targeting."
      title="Summary"
    >
      <Field label="Professional summary">
        <textarea
          className="input-field min-h-36 resize-y"
          onChange={(event) => {
            onChange((current) => ({
              ...current,
              summary: event.target.value,
            }));
          }}
          value={resume.summary}
        />
      </Field>
    </SectionCard>
  );
}
