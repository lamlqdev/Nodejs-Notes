export type EmailJobType =
  | 'job_posted'
  | 'application_received'
  | 'weekly_digest'
  | 'follow_up_reminder';

export interface JobPostedPayload {
  type: 'job_posted';
  recruiterEmail: string;
  recruiterName: string;
  jobTitle: string;
  company: string;
  jobId: string;
}

export interface ApplicationReceivedPayload {
  type: 'application_received';
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  company: string;
  applicationId: string;
}

export interface WeeklyDigestPayload {
  type: 'weekly_digest';
  candidateEmail: string;
  candidateName: string;
  jobCount: number;
  jobs: Array<{ title: string; company: string; id: string }>;
}

export interface FollowUpReminderPayload {
  type: 'follow_up_reminder';
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  company: string;
  applicationId: string;
}

export type EmailJobPayload =
  | JobPostedPayload
  | ApplicationReceivedPayload
  | WeeklyDigestPayload
  | FollowUpReminderPayload;
