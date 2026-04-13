"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useExportLogger } from "@/hooks/useExportLogger";
import { captureAnalyticsEvent } from "@/lib/analytics";
import { getResumeFileName } from "@/lib/resume-export";
import type { ResumeDocument } from "@/lib/resume";

const PdfPreviewFrame = dynamic(
  () =>
    import("@/components/editor/PdfPreviewFrame").then(
      (module) => module.PdfPreviewFrame,
    ),
  {
    loading: () => (
      <div className="rounded-[1.75rem] border border-slate-200 bg-white/80 px-4 py-6 text-sm text-slate-600">
        Loading PDF preview tools...
      </div>
    ),
    ssr: false,
  },
);

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

function getDownloadFilename(headerValue: string | null, fallback: string) {
  if (!headerValue) {
    return fallback;
  }

  const utfMatch = headerValue.match(/filename\*=UTF-8''([^;]+)/i);

  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]);
  }

  const basicMatch = headerValue.match(/filename="?([^";]+)"?/i);
  return basicMatch?.[1] ?? fallback;
}

export function ExportPanel({ resume }: { resume: ResumeDocument }) {
  const [activeExport, setActiveExport] = useState<"docx" | "pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const { logExport } = useExportLogger(resume.id);

  const handlePdfDownload = async () => {
    setActiveExport("pdf");
    setError(null);
    setStatusMessage(null);

    try {
      const [{ pdf }, { ResumePDFDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/editor/ResumePDFDocument"),
      ]);
      const blob = await pdf(<ResumePDFDocument resume={resume} />).toBlob();

      downloadBlob(blob, getResumeFileName(resume, "pdf"));
      setStatusMessage("PDF downloaded from the browser.");
      captureAnalyticsEvent("resume_exported", {
        format: "pdf",
        resume_id: resume.id,
      });
      await logExport("pdf");
    } catch (downloadError) {
      console.error("PDF export failed", downloadError);
      setError("PDF export failed. Please try again.");
    } finally {
      setActiveExport(null);
    }
  };

  const handleDocxDownload = async () => {
    setActiveExport("docx");
    setError(null);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/export/docx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resume }),
      });

      if (!response.ok) {
        throw new Error("DOCX export failed.");
      }

      const blob = await response.blob();
      const filename = getDownloadFilename(
        response.headers.get("content-disposition"),
        getResumeFileName(resume, "docx"),
      );

      downloadBlob(blob, filename);
      setStatusMessage("DOCX downloaded from the export route.");
      captureAnalyticsEvent("resume_exported", {
        format: "docx",
        resume_id: resume.id,
      });
      await logExport("docx");
    } catch (downloadError) {
      console.error("DOCX export failed", downloadError);
      setError("DOCX export failed. Please check your auth session and try again.");
    } finally {
      setActiveExport(null);
    }
  };

  return (
    <section className="card-surface space-y-5 p-6 sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="pill">Phase 5</span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            PDF and DOCX export
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Download DOCX from a secure server route using the `docx` package, or
            generate PDF entirely in the browser with `@react-pdf/renderer`.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="button-secondary"
            disabled={activeExport !== null}
            onClick={() => {
              setShowPdfPreview((current) => !current);
            }}
            type="button"
          >
            {showPdfPreview ? "Hide PDF preview" : "Preview PDF"}
          </button>
          <button
            className="button-secondary"
            disabled={activeExport !== null}
            onClick={() => {
              void handlePdfDownload();
            }}
            type="button"
          >
            {activeExport === "pdf" ? "Generating PDF..." : "Download PDF"}
          </button>
          <button
            className="button-primary"
            disabled={activeExport !== null}
            onClick={() => {
              void handleDocxDownload();
            }}
            type="button"
          >
            {activeExport === "docx" ? "Building DOCX..." : "Download DOCX"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {statusMessage ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Browser PDF
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            No server rendering cost. The PDF is created and downloaded directly in
            the user&apos;s browser.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Server DOCX
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Uses a protected Next.js route so only the signed-in owner can export
            the current resume as a `.docx` file.
          </p>
        </div>
      </div>

      {showPdfPreview ? <PdfPreviewFrame resume={resume} /> : null}
    </section>
  );
}
