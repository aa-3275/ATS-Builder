import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-server";
import { analyzeJobDescriptionMatch } from "@/lib/ats";
import { resumeDocumentSchema, sanitizeResume } from "@/lib/resume";

const jdRequestSchema = z.object({
  jobDescription: z.string().trim().min(30).max(8000),
  resume: resumeDocumentSchema,
});

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = jdRequestSchema.parse(await request.json());
    const resume = sanitizeResume(body.resume);

    if (resume.userId !== user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const analysis = analyzeJobDescriptionMatch(resume, body.jobDescription);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("JD match route failed", error);
    return NextResponse.json(
      { error: "Unable to analyze the job description." },
      { status: 400 },
    );
  }
}
