import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { AuthenticatedUser } from "@/lib/auth-server";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  calculateResumeCompletion,
  createDefaultResume,
  createResumeWritePayload,
  resumeDocumentSchema,
  type ResumeDocument,
} from "@/lib/resume";

function toIsoString(value: unknown) {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return null;
}

function normalizeResume(data: Record<string, unknown>) {
  return resumeDocumentSchema.parse({
    id: typeof data.id === "string" ? data.id : "",
    userId: typeof data.userId === "string" ? data.userId : "",
    title: typeof data.title === "string" ? data.title : "Untitled Resume",
    personalInfo: data.personalInfo,
    summary: typeof data.summary === "string" ? data.summary : "",
    experience: data.experience,
    education: data.education,
    skills: data.skills,
    atsScore: typeof data.atsScore === "number" ? data.atsScore : null,
    completionScore:
      typeof data.completionScore === "number" ? data.completionScore : 0,
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
    lastSavedAt: toIsoString(data.lastSavedAt),
  });
}

export async function getOrCreatePrimaryResume(
  user: AuthenticatedUser,
): Promise<ResumeDocument> {
  const db = getAdminDb();
  const existingSnapshot = await db
    .collection("resumes")
    .where("userId", "==", user.uid)
    .limit(1)
    .get();

  if (!existingSnapshot.empty) {
    const firstDoc = existingSnapshot.docs[0];
    return normalizeResume(firstDoc.data());
  }

  const draft = createDefaultResume({
    uid: user.uid,
    name: user.name,
    email: user.email,
  });
  const docRef = db.collection("resumes").doc(draft.id);
  const payload = createResumeWritePayload(draft);

  await docRef.set({
    ...payload,
    completionScore: calculateResumeCompletion(draft),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    lastSavedAt: FieldValue.serverTimestamp(),
  });

  return {
    ...draft,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSavedAt: new Date().toISOString(),
  };
}

export async function listUserResumes(userId: string) {
  const db = getAdminDb();
  const snapshot = await db
    .collection("resumes")
    .where("userId", "==", userId)
    .limit(20)
    .get();

  return snapshot.docs
    .map((doc) => normalizeResume(doc.data()))
    .sort((left, right) => {
      const leftTime = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
      const rightTime = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;

      return rightTime - leftTime;
    });
}
