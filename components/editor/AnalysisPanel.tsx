"use client";

import { useState, useTransition } from "react";
import { captureAnalyticsEvent } from "@/lib/analytics";
import type { AtsAnalysis, JdMatchAnalysis } from "@/lib/ats";
import type { ResumeDocument } from "@/lib/resume";

type AnalysisPanelProps = {
  onAtsScore: (score: number) => void;
  resume: ResumeDocument;
};

function scoreLabel(score: number) {
  if (score >= 80) {
    return "Strong";
  }
  if (score >= 60) {
    return "Good";
  }
  if (score >= 40) {
    return "Needs work";
  }

  return "Weak";
}

export function AnalysisPanel({ onAtsScore, resume }: AnalysisPanelProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [atsResult, setAtsResult] = useState<AtsAnalysis | null>(null);
  const [jdResult, setJdResult] = useState<JdMatchAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const runAtsScore = () => {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/ats-score", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resume }),
        });

        if (!response.ok) {
          throw new Error("ATS scoring failed.");
        }

        const result = (await response.json()) as AtsAnalysis;
        setAtsResult(result);
        onAtsScore(result.score);
        captureAnalyticsEvent("ats_score_run", {
          format_compliance: result.breakdown.formatCompliance,
          keyword_density: result.breakdown.keywordDensity,
          quantified_achievements: result.breakdown.quantifiedAchievements,
          resume_id: resume.id,
          score: result.score,
          section_completeness: result.breakdown.sectionCompleteness,
        });
      } catch (analysisError) {
        console.error(analysisError);
        setError("ATS scoring failed. Check your Firebase auth session and try again.");
      }
    });
  };

  const runJdMatch = () => {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/jd-match", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume,
            jobDescription,
          }),
        });

        if (!response.ok) {
          throw new Error("JD matching failed.");
        }

        const result = (await response.json()) as JdMatchAnalysis;
        setJdResult(result);
        captureAnalyticsEvent("jd_match_run", {
          coverage_score: result.coverageScore,
          matched_keywords: result.matchedKeywords.length,
          missing_keywords: result.missingKeywords.length,
          resume_id: resume.id,
          top_keywords: result.topKeywords.length,
        });
      } catch (analysisError) {
        console.error(analysisError);
        setError("JD matching failed. Paste a longer job description and try again.");
      }
    });
  };

  return (
    <section className="card-surface space-y-5 p-6 sm:p-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="pill">Phase 4</span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            ATS score and JD matcher
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Score the current resume for section completeness, keyword coverage,
            format compliance, and quantified achievements. Then compare it
            against a pasted job description.
          </p>
        </div>
        <button
          className="button-primary"
          disabled={isPending}
          onClick={runAtsScore}
          type="button"
        >
          {isPending ? "Analyzing..." : "Run ATS score"}
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {atsResult ? (
        <div className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white/85 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              ATS score
            </p>
            <p className="mt-3 text-5xl font-semibold text-slate-950">
              {atsResult.score}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {scoreLabel(atsResult.score)}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white/85 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Breakdown
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                Keyword density: {atsResult.breakdown.keywordDensity}/25
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                Format compliance: {atsResult.breakdown.formatCompliance}/25
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                Section completeness: {atsResult.breakdown.sectionCompleteness}/25
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                Quantified achievements: {atsResult.breakdown.quantifiedAchievements}/25
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {atsResult.suggestions.length > 0 ? (
                atsResult.suggestions.map((suggestion) => (
                  <div
                    className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"
                    key={suggestion}
                  >
                    {suggestion}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
                  This resume is in strong ATS shape for a general baseline.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-[1.75rem] border border-slate-200 bg-white/85 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              JD matcher
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Paste the target job description to extract likely keywords and
              identify which ones are still missing from the resume.
            </p>
          </div>
          <button
            className="button-secondary"
            disabled={isPending || jobDescription.trim().length < 30}
            onClick={runJdMatch}
            type="button"
          >
            Match against JD
          </button>
        </div>

        <textarea
          className="input-field mt-4 min-h-40 resize-y"
          onChange={(event) => {
            setJobDescription(event.target.value);
          }}
          placeholder="Paste a job description here..."
          value={jobDescription}
        />

        {jdResult ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Coverage
              </p>
              <p className="mt-3 text-4xl font-semibold text-slate-950">
                {jdResult.coverageScore}%
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {jdResult.matchedKeywords.length} matched / {jdResult.topKeywords.length} tracked keywords
              </p>
            </div>

            <div className="grid gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Top keywords</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {jdResult.topKeywords.map((keyword) => (
                    <span
                      className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700"
                      key={keyword}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Matched</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {jdResult.matchedKeywords.length > 0 ? (
                      jdResult.matchedKeywords.map((keyword) => (
                        <span
                          className="rounded-full bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                          key={keyword}
                        >
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-600">No strong keyword matches yet.</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">Missing</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {jdResult.missingKeywords.length > 0 ? (
                      jdResult.missingKeywords.map((keyword) => (
                        <span
                          className="rounded-full bg-rose-50 px-3 py-2 text-sm text-rose-800"
                          key={keyword}
                        >
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-600">No major gaps detected.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                {jdResult.suggestions.map((suggestion) => (
                  <div
                    className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-900"
                    key={suggestion}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
