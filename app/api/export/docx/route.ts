import { NextResponse } from "next/server";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-server";
import {
  getEducationDateRange,
  getExperienceDateRange,
  getResumeContactItems,
  getResumeDisplayName,
  getResumeFileName,
  getResumeSkillsText,
} from "@/lib/resume-export";
import { resumeDocumentSchema, sanitizeResume } from "@/lib/resume";

export const runtime = "nodejs";

const exportRequestSchema = z.object({
  resume: resumeDocumentSchema,
});

const TEAL = "0F766E";
const INK = "0F172A";
const MUTED = "475569";

function makeTextRun(
  text: string,
  options?: {
    bold?: boolean;
    color?: string;
    size?: number;
  },
) {
  return new TextRun({
    bold: options?.bold ?? false,
    color: options?.color ?? INK,
    font: "Arial",
    size: options?.size ?? 20,
    text,
  });
}

function sectionHeading(title: string) {
  return new Paragraph({
    border: {
      bottom: {
        color: TEAL,
        size: 6,
        space: 2,
        style: BorderStyle.SINGLE,
      },
    },
    spacing: {
      after: 80,
      before: 200,
    },
    children: [
      makeTextRun(title.toUpperCase(), {
        bold: true,
        color: TEAL,
        size: 22,
      }),
    ],
  });
}

function bodyParagraph(text: string) {
  return new Paragraph({
    spacing: {
      after: 80,
    },
    children: [makeTextRun(text)],
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = exportRequestSchema.parse(await request.json());
    const resume = sanitizeResume(body.resume);

    if (resume.userId !== user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const name = getResumeDisplayName(resume);
    const contactLine = getResumeContactItems(resume).join(" | ");
    const skillsText = getResumeSkillsText(resume);

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                bottom: 1080,
                left: 1080,
                right: 1080,
                top: 1080,
              },
            },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: {
                after: 80,
              },
              children: [
                makeTextRun(name, {
                  bold: true,
                  color: INK,
                  size: 36,
                }),
              ],
            }),
            new Paragraph({
              spacing: {
                after: 140,
              },
              children: [
                makeTextRun(
                  contactLine ||
                    "Email | Phone | Location | LinkedIn | Portfolio",
                  {
                    color: MUTED,
                    size: 18,
                  },
                ),
              ],
            }),
            sectionHeading("Professional Summary"),
            bodyParagraph(
              resume.summary ||
                "Add a concise summary tailored to your target role before exporting.",
            ),
            sectionHeading("Experience"),
            ...(resume.experience.length > 0
              ? resume.experience.flatMap((item) => [
                  new Paragraph({
                    spacing: {
                      after: 20,
                      before: 120,
                    },
                    children: [
                      makeTextRun(item.title || "Role title", {
                        bold: true,
                        size: 22,
                      }),
                      makeTextRun(` | ${item.company || "Company"}`, {
                        bold: true,
                        color: TEAL,
                        size: 22,
                      }),
                    ],
                  }),
                  new Paragraph({
                    spacing: {
                      after: 40,
                    },
                    children: [
                      makeTextRun(getExperienceDateRange(item), {
                        color: MUTED,
                        size: 18,
                      }),
                    ],
                  }),
                  ...item.achievements.filter(Boolean).map(
                    (achievement) =>
                      new Paragraph({
                        bullet: { level: 0 },
                        spacing: {
                          after: 40,
                        },
                        children: [makeTextRun(achievement)],
                      }),
                  ),
                ])
              : [
                  bodyParagraph(
                    "Add experience entries before exporting the resume.",
                  ),
                ]),
            sectionHeading("Education"),
            ...(resume.education.length > 0
              ? resume.education.flatMap((item) => [
                  new Paragraph({
                    spacing: {
                      after: 20,
                      before: 120,
                    },
                    children: [
                      makeTextRun(item.degree || "Degree", {
                        bold: true,
                        size: 22,
                      }),
                      makeTextRun(` | ${item.school || "School"}`, {
                        bold: true,
                        color: TEAL,
                        size: 22,
                      }),
                    ],
                  }),
                  new Paragraph({
                    spacing: {
                      after: 40,
                    },
                    children: [
                      makeTextRun(getEducationDateRange(item), {
                        color: MUTED,
                        size: 18,
                      }),
                    ],
                  }),
                ])
              : [
                  bodyParagraph(
                    "Add education entries before exporting the resume.",
                  ),
                ]),
            sectionHeading("Skills"),
            bodyParagraph(
              skillsText ||
                "List hard skills, tools, and keywords before exporting.",
            ),
          ],
        },
      ],
    });
    const buffer = await Packer.toBuffer(doc);
    const filename = getResumeFileName(resume, "docx");

    return new Response(Uint8Array.from(buffer), {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
          filename,
        )}`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    });
  } catch (error) {
    console.error("DOCX export route failed", error);
    return NextResponse.json(
      { error: "Unable to export the resume." },
      { status: 400 },
    );
  }
}
