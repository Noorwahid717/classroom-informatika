export const Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MENTOR: "MENTOR",
  STUDENT: "STUDENT"
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const SubmissionStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  PROCESSING: "PROCESSING",
  GRADED: "GRADED",
  RETURNED: "RETURNED"
} as const;

export type SubmissionStatus = (typeof SubmissionStatus)[keyof typeof SubmissionStatus];
