// app/(main)/resume/_components/resume-builder.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import html2pdf from "html2pdf.js/dist/html2pdf.min.js";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveResume } from "@/actions/resume";
import EntryForm from "./entry-form";
import useFetch from "@/hooks/use-fetch";
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";

const buildContactMarkdown = (contactInfo = {}, fullName = "Resume") => {
  const parts = [];

  if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
  if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
  if (contactInfo.linkedin) parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
  if (contactInfo.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`);

  if (!parts.length) return "";

  return `## <div align="center">${fullName}</div>

<div align="center">

${parts.join(" | ")}

</div>`;
};

const buildResumeMarkdown = (values, fullName) => {
  const { contactInfo, summary, skills, experience, education, projects } = values ?? {};

  return [
    buildContactMarkdown(contactInfo, fullName),
    summary && `## Professional Summary\n\n${summary}`,
    skills && `## Skills\n\n${skills}`,
    entriesToMarkdown(experience, "Work Experience"),
    entriesToMarkdown(education, "Education"),
    entriesToMarkdown(projects, "Projects"),
  ]
    .filter(Boolean)
    .join("\n\n");
};

const ResumeBuilder = ({ initialContent = "" }) => {
  const [activeTab, setActiveTab] = useState(initialContent ? "preview" : "edit");
  const [resumeMode, setResumeMode] = useState("preview");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const pdfRef = useRef(null);

  const { user } = useUser();

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {
        email: "",
        mobile: "",
        linkedin: "",
        twitter: "",
      },
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  const formValues = watch();

  const generatedContent = useMemo(() => {
    return buildResumeMarkdown(formValues, user?.fullName || "Resume");
  }, [formValues, user?.fullName]);

  useEffect(() => {
    if (initialContent) {
      setPreviewContent(initialContent);
      setActiveTab("preview");
    }
  }, [initialContent]);

  useEffect(() => {
    if (activeTab === "edit") {
      setPreviewContent(generatedContent || initialContent || "");
    }
  }, [activeTab, generatedContent, initialContent]);

  useEffect(() => {
    if (saveResult) {
      toast.success("Resume saved successfully!");
    }
  }, [saveResult]);

  useEffect(() => {
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveError]);

  const generatePDF = async () => {
    if (!pdfRef.current) return;

    try {
      await html2pdf()
        .set({
          margin: [15, 15],
          filename: "resume.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(pdfRef.current)
        .save();
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleSave = async () => {
    const contentToSave = (activeTab === "edit" ? generatedContent : previewContent).trim();

    if (!contentToSave) {
      toast.error("Please add some resume content before saving");
      return;
    }

    try {
      await saveResumeFn(contentToSave);
    } catch (error) {
      toast.error(error.message || "Failed to save resume");
    }
  };

  const handleSaveClick =
    activeTab === "edit" ? handleSubmit(handleSave) : handleSave;

  return (
    <div data-color-mode="light" className="space-y-4">
      <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
        <h1 className="gradient-title text-5xl font-bold md:text-6xl">
          Resume Builder
        </h1>

        <div className="space-x-2">
          <Button
            variant="destructive"
            type="button"
            onClick={handleSaveClick}
            disabled={isSaving}
            className="cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </Button>

          <Button
            className="cursor-pointer"
            onClick={generatePDF}
            disabled={!previewContent || isSaving}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Markdown</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <form onSubmit={handleSubmit(handleSave)} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/50 p-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    {...register("contactInfo.email")}
                    type="email"
                    placeholder="your@email.com"
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile Number</label>
                  <Input
                    {...register("contactInfo.mobile")}
                    type="tel"
                    placeholder="+1 234 567 8900"
                  />
                  {errors.contactInfo?.mobile && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.mobile.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">LinkedIn URL</label>
                  <Input
                    {...register("contactInfo.linkedin")}
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                  {errors.contactInfo?.linkedin && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.linkedin.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Twitter/X Profile</label>
                  <Input
                    {...register("contactInfo.twitter")}
                    type="url"
                    placeholder="https://twitter.com/your-handle"
                  />
                  {errors.contactInfo?.twitter && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.twitter.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Summary</h3>
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="Write a compelling professional summary..."
                  />
                )}
              />
              {errors.summary && (
                <p className="text-sm text-red-500">{errors.summary.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Skills</h3>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="List your key skills..."
                  />
                )}
              />
              {errors.skills && (
                <p className="text-sm text-red-500">{errors.skills.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Work Experience</h3>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Experience"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.experience && (
                <p className="text-sm text-red-500">{errors.experience.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Education</h3>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Education"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.education && (
                <p className="text-sm text-red-500">{errors.education.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Projects</h3>
              <Controller
                name="projects"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Project"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.projects && (
                <p className="text-sm text-red-500">{errors.projects.message}</p>
              )}
            </div>
          </form>
        </TabsContent>

        <TabsContent value="preview">
          {activeTab === "preview" && (
            <Button
              variant="link"
              type="button"
              className="mb-2 cursor-pointer"
              onClick={() =>
                setResumeMode(resumeMode === "preview" ? "edit" : "preview")
              }
            >
              {resumeMode === "preview" ? (
                <>
                  <Edit className="h-4 w-4" />
                  Edit Resume
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4" />
                  Show Preview
                </>
              )}
            </Button>
          )}

          {activeTab === "preview" && resumeMode !== "preview" && (
            <div className="mb-2 flex items-center gap-2 rounded border-2 border-yellow-600 p-3 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                You will lose edited markdown if you update the form data.
              </span>
            </div>
          )}

          <div className="rounded-lg border">
            <MDEditor
              value={previewContent}
              onChange={(value) => setPreviewContent(value || "")}
              height={800}
              preview={resumeMode}
            />
          </div>

          <div className="hidden">
            <div ref={pdfRef}>
              <MDEditor.Markdown
                source={previewContent}
                style={{
                  background: "white",
                  color: "black",
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResumeBuilder;
