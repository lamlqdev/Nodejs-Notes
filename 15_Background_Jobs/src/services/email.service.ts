import { Resend, type CreateEmailOptions } from 'resend';
import config from '../config/config';
import type {
  EmailJobPayload,
  JobPostedPayload,
  ApplicationReceivedPayload,
  WeeklyDigestPayload,
  FollowUpReminderPayload,
} from '../types/index';

const resend = new Resend(config.resendApiKey);
const from = `${config.fromName} <${config.fromEmail}>`;

function buildJobPostedEmail(p: JobPostedPayload): CreateEmailOptions {
  return {
    from,
    to: p.recruiterEmail,
    subject: `Your job posting "${p.jobTitle}" is live!`,
    html: `
      <h2>Job Posting Confirmed</h2>
      <p>Hi ${p.recruiterName},</p>
      <p>Your job posting <strong>${p.jobTitle}</strong> at <strong>${p.company}</strong> is now live.</p>
      <p>Job ID: <code>${p.jobId}</code></p>
      <p>Good luck finding great candidates!</p>
    `,
  } as CreateEmailOptions;
}

function buildApplicationReceivedEmail(p: ApplicationReceivedPayload): CreateEmailOptions {
  return {
    from,
    to: p.candidateEmail,
    subject: `Application received for ${p.jobTitle}`,
    html: `
      <h2>Application Confirmed</h2>
      <p>Hi ${p.candidateName},</p>
      <p>We received your application for <strong>${p.jobTitle}</strong> at <strong>${p.company}</strong>.</p>
      <p>Application ID: <code>${p.applicationId}</code></p>
      <p>The recruiter will review your profile and get back to you soon.</p>
    `,
  } as CreateEmailOptions;
}

function buildWeeklyDigestEmail(p: WeeklyDigestPayload): CreateEmailOptions {
  const jobList = p.jobs
    .map((j) => `<li><strong>${j.title}</strong> at ${j.company}</li>`)
    .join('');

  return {
    from,
    to: p.candidateEmail,
    subject: `Weekly Job Digest — ${p.jobCount} new jobs this week`,
    html: `
      <h2>Weekly Job Digest</h2>
      <p>Hi ${p.candidateName},</p>
      <p>Here are <strong>${p.jobCount}</strong> active job postings for you:</p>
      <ul>${jobList}</ul>
      <p>Visit the job board to apply!</p>
    `,
  } as CreateEmailOptions;
}

function buildFollowUpReminderEmail(p: FollowUpReminderPayload): CreateEmailOptions {
  return {
    from,
    to: p.candidateEmail,
    subject: `Following up on your application for ${p.jobTitle}`,
    html: `
      <h2>Application Follow-Up</h2>
      <p>Hi ${p.candidateName},</p>
      <p>It has been 3 days since you applied for <strong>${p.jobTitle}</strong> at <strong>${p.company}</strong>.</p>
      <p>Your application (ID: <code>${p.applicationId}</code>) is still under review.</p>
      <p>Feel free to check back later — we will notify you of any updates.</p>
    `,
  } as CreateEmailOptions;
}

export async function sendEmailForJob(payload: EmailJobPayload): Promise<void> {
  let options: CreateEmailOptions;

  switch (payload.type) {
    case 'job_posted':
      options = buildJobPostedEmail(payload);
      break;
    case 'application_received':
      options = buildApplicationReceivedEmail(payload);
      break;
    case 'weekly_digest':
      options = buildWeeklyDigestEmail(payload);
      break;
    case 'follow_up_reminder':
      options = buildFollowUpReminderEmail(payload);
      break;
  }

  const { error } = await resend.emails.send(options);
  if (error) throw new Error(`Resend error: ${error.message}`);
}
