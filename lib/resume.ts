import { z } from "zod";

const emptyExportStats = {
  docx: 0,
  pdf: 0,
  lastExportedAt: null,
  lastFormat: null,
} as const;

export const personalInfoSchema = z.object({
  email: z.string().trim().max(120),
  fullName: z.string().trim().max(120),
  linkedIn: z.string().trim().max(120),
  location: z.string().trim().max(120),
  phone: z.string().trim().max(40),
  portfolio: z.string().trim().max(120),
});

export const experienceItemSchema = z.object({
  achievements: z.array(z.string().trim().max(180)).max(6),
  company: z.string().trim().max(120),
  current: z.boolean(),
  endDate: z.string().trim().max(30),
  id: z.string(),
  startDate: z.string().trim().max(30),
  title: z.string().trim().max(120),
});

export const educationItemSchema = z.object({
  degree: z.string().trim().max(120),
  endDate: z.string().trim().max(30),
  id: z.string(),
  school: z.string().trim().max(120),
  startDate: z.string().trim().max(30),
});

export const exportStatsSchema = z.object({
  docx: z.number().int().min(0),
  pdf: z.number().int().min(0),
  lastExportedAt: z.string().nullable(),
  lastFormat: z.enum(["pdf", "docx"]).nullable(),
});

export const resumeDocumentSchema = z.object({
  atsScore: z.number().min(0).max(100).nullable(),
  completionScore: z.number().min(0).max(100),
  createdAt: z.string().nullable(),
  education: z.array(educationItemSchema).max(6),
  exports: exportStatsSchema.default(emptyExportStats),
  experience: z.array(experienceItemSchema).max(8),
  id: z.string(),
  lastSavedAt: z.string().nullable(),
  personalInfo: personalInfoSchema,
  skills: z.array(z.string().trim().max(40)).max(30),
  summary: z.string().trim().max(700),
  title: z.string().trim().max(120),
  updatedAt: z.string().nullable(),
  userId: z.string(),
});

export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type ResumeExportStats = z.infer<typeof exportStatsSchema>;
export type ResumeDocument = z.infer<typeof resumeDocumentSchema>;

export type ResumeOwner = {
  email: string | null;
  name: string | null;
  uid: string;
};

export function createItemId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyExperience(): ExperienceItem {
  return {
    id: createItemId("exp"),
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    current: false,
    achievements: [""],
  };
}

export function createEmptyEducation(): EducationItem {
  return {
    id: createItemId("edu"),
    school: "",
    degree: "",
    startDate: "",
    endDate: "",
  };
}

export function createDefaultResume(owner: ResumeOwner): ResumeDocument {
  const name = owner.name ?? "";
  const firstName = name.split(" ")[0] ?? "My";

  const draft: ResumeDocument = {
    id: createItemId("resume"),
    userId: owner.uid,
    title: `${firstName} Resume`,
    summary:
      "Results-driven professional with experience delivering cross-functional projects, improving workflows, and communicating clearly with stakeholders.",
    atsScore: null,
    completionScore: 0,
    createdAt: null,
    exports: emptyExportStats,
    updatedAt: null,
    lastSavedAt: null,
    personalInfo: {
      fullName: name,
      email: owner.email ?? "",
      phone: "",
      location: "",
      linkedIn: "",
      portfolio: "",
    },
    experience: [
      {
        id: createItemId("exp"),
        title: "Product Analyst",
        company: "Your Company",
        startDate: "2023",
        endDate: "",
        current: true,
        achievements: [
          "Improved reporting workflows and reduced manual work by 30%.",
          "Partnered with hiring and operations teams to streamline resume review steps.",
        ],
      },
    ],
    education: [
      {
        id: createItemId("edu"),
        school: "University Name",
        degree: "B.Tech / B.Sc / MBA",
        startDate: "2018",
        endDate: "2022",
      },
    ],
    skills: ["Resume writing", "ATS optimization", "Communication"],
  };

  return {
    ...draft,
    completionScore: calculateResumeCompletion(draft),
  };
}

export function calculateResumeCompletion(resume: ResumeDocument) {
  const checks = [
    Boolean(resume.personalInfo.fullName.trim()),
    Boolean(resume.personalInfo.email.trim()),
    Boolean(resume.personalInfo.phone.trim()),
    Boolean(resume.personalInfo.location.trim()),
    Boolean(resume.summary.trim()),
    resume.experience.some(
      (item) =>
        item.title.trim() &&
        item.company.trim() &&
        item.achievements.some((achievement) => achievement.trim()),
    ),
    resume.education.some((item) => item.school.trim() && item.degree.trim()),
    resume.skills.filter(Boolean).length >= 3,
  ];

  return Math.round(
    (checks.filter(Boolean).length / Math.max(checks.length, 1)) * 100,
  );
}

export function sanitizeResume(resume: ResumeDocument) {
  const parsed = resumeDocumentSchema.parse({
    ...resume,
    exports: {
      docx: resume.exports?.docx ?? 0,
      pdf: resume.exports?.pdf ?? 0,
      lastExportedAt: resume.exports?.lastExportedAt ?? null,
      lastFormat: resume.exports?.lastFormat ?? null,
    },
    title: resume.title.trim() || "Untitled Resume",
    summary: resume.summary.trim(),
    skills: resume.skills.map((skill) => skill.trim()).filter(Boolean),
    personalInfo: Object.fromEntries(
      Object.entries(resume.personalInfo).map(([key, value]) => [
        key,
        value.trim(),
      ]),
    ),
    experience: resume.experience.map((item) => ({
      ...item,
      title: item.title.trim(),
      company: item.company.trim(),
      startDate: item.startDate.trim(),
      endDate: item.endDate.trim(),
      achievements: item.achievements.map((entry) => entry.trim()).filter(Boolean),
    })),
    education: resume.education.map((item) => ({
      ...item,
      school: item.school.trim(),
      degree: item.degree.trim(),
      startDate: item.startDate.trim(),
      endDate: item.endDate.trim(),
    })),
  });

  return {
    ...parsed,
    completionScore: calculateResumeCompletion(parsed),
  };
}

export function createResumeWritePayload(resume: ResumeDocument) {
  const sanitized = sanitizeResume(resume);

  return {
    id: sanitized.id,
    userId: sanitized.userId,
    title: sanitized.title,
    personalInfo: sanitized.personalInfo,
    summary: sanitized.summary,
    experience: sanitized.experience,
    education: sanitized.education,
    skills: sanitized.skills,
    exports: sanitized.exports,
    atsScore: sanitized.atsScore,
    completionScore: sanitized.completionScore,
  };
}

export function formatResumeDate(dateLabel: string, fallback = "Present") {
  return dateLabel.trim() || fallback;
}

export function formatSavedAtLabel(value: string | null) {
  if (!value) {
    return "Not saved yet";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not saved yet";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
