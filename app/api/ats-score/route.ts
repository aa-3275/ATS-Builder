import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-server";
import { analyzeResumeForAts } from "@/lib/ats";
import { getAdminDb } from "@/lib/firebase-admin";
import { resumeDocumentSchema, sanitizeResume } from "@/lib/resume";

const atsRequestSchema = z.object({
  resume: resumeDocumentSchema,
});

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = atsRequestSchema.parse(await request.json());
    const resume = sanitizeResume(body.resume);

    if (resume.userId !== user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const analysis = analyzeResumeForAts(resume);

    await getAdminDb().collection("resumes").doc(resume.id).set(
      {
        atsScore: analysis.score,
      },
      { merge: true },
    );

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("ATS score route failed", error);
    return NextResponse.json(
      { error: "Unable to analyze the resume." },
      { status: 400 },
    );
  }
}
