import {
  formatResumeDate,
  type EducationItem,
  type ExperienceItem,
  type ResumeDocument,
} from "@/lib/resume";

function trimValue(value: string) {
  return value.trim();
}

export function cleanResumeLink(value: string) {
  return trimValue(value).replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export function getResumeDisplayName(resume: ResumeDocument) {
  return trimValue(resume.personalInfo.fullName) || trimValue(resume.title) || "Resume";
}

export function getResumeFileName(
  resume: ResumeDocument,
  extension: "docx" | "pdf",
) {
  const stem = getResumeDisplayName(resume)
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return `${stem || "Resume"}_Resume.${extension}`;
}

export function getResumeContactItems(resume: ResumeDocument) {
  return [
    trimValue(resume.personalInfo.email),
    trimValue(resume.personalInfo.phone),
    trimValue(resume.personalInfo.location),
    cleanResumeLink(resume.personalInfo.linkedIn),
    cleanResumeLink(resume.personalInfo.portfolio),
  ].filter(Boolean);
}

export function getExperienceDateRange(item: ExperienceItem) {
  return `${formatResumeDate(item.startDate, "Start")} - ${
    item.current ? "Present" : formatResumeDate(item.endDate, "End")
  }`;
}

export function getEducationDateRange(item: EducationItem) {
  return `${formatResumeDate(item.startDate, "Start")} - ${formatResumeDate(item.endDate, "End")}`;
}

export function getResumeSkillsText(resume: ResumeDocument) {
  return resume.skills.map(trimValue).filter(Boolean).join(" | ");
}
