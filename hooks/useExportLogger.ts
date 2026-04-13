"use client";

import { useCallback } from "react";
import { doc, increment, serverTimestamp, updateDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { getFirebaseDb } from "@/lib/firebase";

type ExportFormat = "docx" | "pdf";

export function useExportLogger(resumeId: string) {
  const { user } = useAuth();

  const logExport = useCallback(
    async (format: ExportFormat) => {
      if (!user || !resumeId) {
        return;
      }

      try {
        await updateDoc(doc(getFirebaseDb(), "resumes", resumeId), {
          [`exports.${format}`]: increment(1),
          "exports.lastExportedAt": serverTimestamp(),
          "exports.lastFormat": format,
        });
      } catch (error) {
        console.warn("Export log failed", error);
      }
    },
    [resumeId, user],
  );

  return { logExport };
}
