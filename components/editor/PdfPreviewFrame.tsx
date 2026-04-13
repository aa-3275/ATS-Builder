"use client";

import { BlobProvider } from "@react-pdf/renderer";
import { ResumePDFDocument } from "@/components/editor/ResumePDFDocument";
import { getResumeFileName } from "@/lib/resume-export";
import type { ResumeDocument } from "@/lib/resume";

export function PdfPreviewFrame({ resume }: { resume: ResumeDocument }) {
  return (
    <BlobProvider document={<ResumePDFDocument resume={resume} />}>
      {({ error, loading, url }) => {
        if (error) {
          return (
            <div className="rounded-[1.75rem] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              PDF preview failed. You can still use the download button to try again.
            </div>
          );
        }

        if (loading || !url) {
          return (
            <div className="rounded-[1.75rem] border border-slate-200 bg-white/80 px-4 py-6 text-sm text-slate-600">
              Building the inline PDF preview...
            </div>
          );
        }

        return (
          <div className="space-y-3 rounded-[1.75rem] border border-slate-200 bg-white/85 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  PDF Preview
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This is generated from the same browser-side PDF document used for
                  download.
                </p>
              </div>
              <a
                className="button-secondary"
                download={getResumeFileName(resume, "pdf")}
                href={url}
                rel="noreferrer"
                target="_blank"
              >
                Open in new tab
              </a>
            </div>

            <iframe
              className="min-h-[640px] w-full rounded-[1.5rem] border border-slate-200 bg-white"
              src={`${url}#toolbar=0&navpanes=0&view=FitH`}
              title="Resume PDF preview"
            />
          </div>
        );
      }}
    </BlobProvider>
  );
}
