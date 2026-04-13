import nlp from "compromise";
import {
  calculateResumeCompletion,
  sanitizeResume,
  type ResumeDocument,
} from "@/lib/resume";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "is",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
  "you",
  "your",
  "will",
  "our",
  "we",
]);

export type AtsAnalysis = {
  breakdown: {
    formatCompliance: number;
    keywordDensity: number;
    quantifiedAchievements: number;
    sectionCompleteness: number;
  };
  score: number;
  suggestions: string[];
};

export type KeywordMatch = {
  keyword: string;
  matched: boolean;
};

export type JdMatchAnalysis = {
  coverageScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  topKeywords: string[];
};

function normalizeKeyword(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9+#./ -]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitKeywordParts(input: string) {
  return normalizeKeyword(input)
    .split(/[\s/+-]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 2 && !STOP_WORDS.has(part));
}

function uniqueKeywords(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => normalizeKeyword(value))
        .filter((value) => value.length > 2 && !STOP_WORDS.has(value)),
    ),
  );
}

function extractKeywordsFromText(text: string) {
  const doc = nlp(text);
  const phraseCandidates = [
    ...doc.nouns().out("array"),
    ...doc.adjectives().out("array"),
    ...text.match(/\b[A-Za-z][A-Za-z0-9+#./-]{2,}\b/g) ?? [],
  ];

  const normalized = phraseCandidates.flatMap((candidate) => {
    const clean = normalizeKeyword(candidate);

    if (!clean) {
      return [];
    }

    const parts = splitKeywordParts(clean);
    return [clean, ...parts];
  });

  return uniqueKeywords(normalized);
}

function getResumeKeywordInventory(resume: ResumeDocument) {
  const sanitized = sanitizeResume(resume);
  const textBlocks = [
    sanitized.title,
    sanitized.summary,
    sanitized.personalInfo.fullName,
    sanitized.skills.join(" "),
    sanitized.experience
      .map((item) => [item.title, item.company, ...item.achievements].join(" "))
      .join(" "),
    sanitized.education
      .map((item) => [item.degree, item.school].join(" "))
      .join(" "),
  ];

  return extractKeywordsFromText(textBlocks.join(" "));
}

function countQuantifiedAchievements(resume: ResumeDocument) {
  const pattern = /(\d+|\d+%|\$|₹|x\b|years?\b|months?\b|weeks?\b|days?\b|hours?\b)/i;

  return resume.experience.reduce(
    (total, item) =>
      total +
      item.achievements.filter((achievement) => pattern.test(achievement)).length,
    0,
  );
}

function getFormatComplianceScore(resume: ResumeDocument) {
  let score = 16;

  if (resume.personalInfo.email.trim()) {
    score += 2;
  }
  if (resume.personalInfo.phone.trim()) {
    score += 2;
  }
  if (resume.personalInfo.location.trim()) {
    score += 1;
  }
  if (resume.summary.trim().length >= 80 && resume.summary.trim().length <= 450) {
    score += 2;
  }
  if (resume.experience.every((item) => item.achievements.length <= 6)) {
    score += 2;
  }

  return Math.min(score, 25);
}

function getKeywordDensityScore(resume: ResumeDocument) {
  const keywordCount = getResumeKeywordInventory(resume).length;

  if (keywordCount >= 35) {
    return 25;
  }
  if (keywordCount >= 28) {
    return 22;
  }
  if (keywordCount >= 20) {
    return 18;
  }
  if (keywordCount >= 12) {
    return 12;
  }

  return 7;
}

function getQuantifiedScore(resume: ResumeDocument) {
  const totalAchievements = resume.experience.reduce(
    (total, item) => total + item.achievements.filter(Boolean).length,
    0,
  );

  if (totalAchievements === 0) {
    return 0;
  }

  const quantified = countQuantifiedAchievements(resume);
  return Math.min(25, Math.round((quantified / totalAchievements) * 25));
}

export function analyzeResumeForAts(input: ResumeDocument): AtsAnalysis {
  const resume = sanitizeResume(input);
  const sectionCompleteness = Math.round(
    (calculateResumeCompletion(resume) / 100) * 25,
  );
  const keywordDensity = getKeywordDensityScore(resume);
  const formatCompliance = getFormatComplianceScore(resume);
  const quantifiedAchievements = getQuantifiedScore(resume);
  const score = Math.min(
    100,
    formatCompliance + keywordDensity + sectionCompleteness + quantifiedAchievements,
  );

  const suggestions = [
    !resume.personalInfo.phone.trim()
      ? "Add a phone number so recruiters can quickly contact you."
      : null,
    keywordDensity < 18
      ? "Include more role-specific tools, skills, and domain keywords."
      : null,
    quantifiedAchievements < 14
      ? "Rewrite experience bullets with metrics like %, revenue, volume, or time saved."
      : null,
    sectionCompleteness < 20
      ? "Fill in missing sections like location, education, or stronger experience details."
      : null,
    resume.summary.trim().length < 100
      ? "Expand the professional summary with target-role language and impact."
      : null,
  ].filter((value): value is string => Boolean(value));

  return {
    score,
    breakdown: {
      keywordDensity,
      formatCompliance,
      sectionCompleteness,
      quantifiedAchievements,
    },
    suggestions,
  };
}

function isKeywordMatched(keyword: string, resumeKeywords: Set<string>, resumeText: string) {
  if (resumeKeywords.has(keyword)) {
    return true;
  }

  if (resumeText.includes(keyword)) {
    return true;
  }

  const parts = splitKeywordParts(keyword);

  if (parts.length > 1 && parts.every((part) => resumeKeywords.has(part) || resumeText.includes(part))) {
    return true;
  }

  return false;
}

export function analyzeJobDescriptionMatch(
  input: ResumeDocument,
  jobDescription: string,
): JdMatchAnalysis {
  const resume = sanitizeResume(input);
  const resumeKeywords = new Set(getResumeKeywordInventory(resume));
  const resumeText = normalizeKeyword(
    [
      resume.summary,
      resume.skills.join(" "),
      resume.experience.map((item) => item.achievements.join(" ")).join(" "),
      resume.experience.map((item) => item.title).join(" "),
    ].join(" "),
  );
  const topKeywords = extractKeywordsFromText(jobDescription).slice(0, 20);
  const matches = topKeywords.map((keyword) => ({
    keyword,
    matched: isKeywordMatched(keyword, resumeKeywords, resumeText),
  }));
  const matchedKeywords = matches
    .filter((item) => item.matched)
    .map((item) => item.keyword);
  const missingKeywords = matches
    .filter((item) => !item.matched)
    .map((item) => item.keyword);
  const coverageScore =
    topKeywords.length > 0
      ? Math.round((matchedKeywords.length / topKeywords.length) * 100)
      : 0;

  const suggestions = [
    missingKeywords.length > 0
      ? `Consider adding these missing keywords where they honestly fit: ${missingKeywords
          .slice(0, 6)
          .join(", ")}.`
      : null,
    coverageScore < 45
      ? "Tailor the summary and skills sections more closely to this job description."
      : null,
    matchedKeywords.length < 5
      ? "Mirror the employer's terminology in experience bullets and skills."
      : null,
  ].filter((value): value is string => Boolean(value));

  return {
    coverageScore,
    matchedKeywords,
    missingKeywords,
    suggestions,
    topKeywords,
  };
}
