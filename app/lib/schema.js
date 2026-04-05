import { z } from "zod";

const splitSkills = (value) =>
  String(value ?? "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

const optionalTrimmedString = z
  .string()
  .transform((value) => value.trim())
  .optional();

const urlOrEmpty = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || /^https?:\/\/.+/i.test(value), {
    message: "Please enter a valid URL",
  });

export const onboardingSchema = z.object({
  industry: z
    .string({
      required_error: "Please select an industry",
    })
    .trim()
    .min(1, "Please select an industry"),
  subIndustry: z
    .string({
      required_error: "Please select a specialization",
    })
    .trim()
    .min(1, "Please select a specialization"),
  bio: z
    .string()
    .trim()
    .max(500, "Bio cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  experience: z.coerce
    .number()
    .int("Experience must be a whole number")
    .min(0, "Experience must be at least 0 years")
    .max(50, "Experience cannot exceed 50 years"),
  skills: z
    .string({
      required_error: "Please add at least one skill",
    })
    .trim()
    .min(1, "Please add at least one skill")
    .transform(splitSkills)
    .refine((skills) => skills.length > 0, {
      message: "Please add at least one skill",
    }),
});

export const contactSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  mobile: optionalTrimmedString,
  linkedin: urlOrEmpty,
  twitter: urlOrEmpty,
});

export const entrySchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    organization: z.string().trim().min(1, "Organization is required"),
    startDate: z.string().trim().min(1, "Start date is required"),
    endDate: z.string().trim().optional(),
    description: z.string().trim().min(1, "Description is required"),
    current: z.boolean().default(false),
  })
  .refine((data) => data.current || Boolean(data.endDate?.trim()), {
    message: "End date is required unless this is your current position",
    path: ["endDate"],
  });

export const resumeSchema = z.object({
  contactInfo: contactSchema,
  summary: z
    .string()
    .trim()
    .min(1, "Professional summary is required")
    .max(1000, "Summary is too long"),
  skills: z
    .string()
    .trim()
    .min(1, "Skills are required")
    .max(2000, "Skills field is too long"),
  experience: z.array(entrySchema).default([]),
  education: z.array(entrySchema).default([]),
  projects: z.array(entrySchema).default([]),
});

export const coverLetterSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(120, "Company name is too long"),
  jobTitle: z
    .string()
    .trim()
    .min(1, "Job title is required")
    .max(120, "Job title is too long"),
  jobDescription: z
    .string()
    .trim()
    .min(1, "Job description is required")
    .max(8000, "Job description is too long"),
});
