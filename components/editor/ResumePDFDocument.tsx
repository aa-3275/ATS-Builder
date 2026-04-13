"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  getEducationDateRange,
  getExperienceDateRange,
  getResumeContactItems,
  getResumeDisplayName,
  getResumeSkillsText,
} from "@/lib/resume-export";
import type { ResumeDocument } from "@/lib/resume";

const TEAL = "#0F766E";
const INK = "#0F172A";
const MUTED = "#475569";
const BORDER = "#CBD5E1";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    color: INK,
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 42,
    paddingBottom: 44,
    paddingHorizontal: 40,
  },
  header: {
    borderBottomColor: BORDER,
    borderBottomWidth: 1,
    marginBottom: 14,
    paddingBottom: 12,
  },
  name: {
    color: INK,
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    marginBottom: 4,
  },
  contact: {
    color: MUTED,
    fontSize: 9,
    lineHeight: 1.4,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    borderBottomColor: TEAL,
    borderBottomWidth: 1,
    color: TEAL,
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    letterSpacing: 0.8,
    marginBottom: 6,
    paddingBottom: 3,
    textTransform: "uppercase",
  },
  bodyText: {
    color: INK,
    fontSize: 9.5,
    lineHeight: 1.5,
  },
  entry: {
    marginTop: 8,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  entryTitle: {
    color: INK,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    maxWidth: "68%",
  },
  entryOrg: {
    color: TEAL,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    maxWidth: "30%",
    textAlign: "right",
  },
  entryMeta: {
    color: MUTED,
    fontSize: 8.5,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 2.5,
    paddingLeft: 2,
  },
  bulletMarker: {
    color: INK,
    fontSize: 9.5,
    width: 10,
  },
  bulletText: {
    color: INK,
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.45,
  },
});

function Section({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function ResumePDFDocument({ resume }: { resume: ResumeDocument }) {
  const name = getResumeDisplayName(resume);
  const contactLine = getResumeContactItems(resume).join(" | ");
  const skillsText = getResumeSkillsText(resume);

  return (
    <Document
      author={name}
      subject="ATS-friendly resume"
      title={`${name} Resume`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.contact}>
            {contactLine || "Email | Phone | Location | LinkedIn | Portfolio"}
          </Text>
        </View>

        <Section title="Professional Summary">
          <Text style={styles.bodyText}>
            {resume.summary || "Add a concise summary tailored to your target role."}
          </Text>
        </Section>

        <Section title="Experience">
          {resume.experience.length > 0 ? (
            resume.experience.map((item) => (
              <View key={item.id} style={styles.entry} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{item.title || "Role title"}</Text>
                  <Text style={styles.entryOrg}>{item.company || "Company"}</Text>
                </View>
                <Text style={styles.entryMeta}>{getExperienceDateRange(item)}</Text>
                {item.achievements.filter(Boolean).map((achievement) => (
                  <View key={achievement} style={styles.bulletRow}>
                    <Text style={styles.bulletMarker}>-</Text>
                    <Text style={styles.bulletText}>{achievement}</Text>
                  </View>
                ))}
              </View>
            ))
          ) : (
            <Text style={styles.bodyText}>Add experience entries before exporting.</Text>
          )}
        </Section>

        <Section title="Education">
          {resume.education.length > 0 ? (
            resume.education.map((item) => (
              <View key={item.id} style={styles.entry} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{item.degree || "Degree"}</Text>
                  <Text style={styles.entryOrg}>{item.school || "School"}</Text>
                </View>
                <Text style={styles.entryMeta}>{getEducationDateRange(item)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.bodyText}>Add education entries before exporting.</Text>
          )}
        </Section>

        <Section title="Skills">
          <Text style={styles.bodyText}>
            {skillsText || "List hard skills, tools, and keywords before exporting."}
          </Text>
        </Section>
      </Page>
    </Document>
  );
}
