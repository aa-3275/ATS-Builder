import type { ResumeDocument } from "@/lib/resume";
import { Field, SectionCard } from "@/components/editor/shared";

type SkillsSectionProps = {
  onChange: (updater: (resume: ResumeDocument) => ResumeDocument) => void;
  resume: ResumeDocument;
};

export function SkillsSection({ onChange, resume }: SkillsSectionProps) {
  return (
    <SectionCard
      description="Separate skills with commas or line breaks. Use keywords from job descriptions."
      title="Skills"
    >
      <Field label="Skills list">
        <textarea
          className="input-field min-h-28 resize-y"
          onChange={(event) => {
            onChange((current) => ({
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
  );
}
