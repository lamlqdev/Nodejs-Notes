import type { Request, Response, NextFunction } from 'express';
import { createJobPosting, listActiveJobs } from '../services/job.service';
import { applyToJob } from '../services/application.service';

export async function createJobController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const job = await createJobPosting(req.body);
    res.status(201).json({
      success: true,
      message: 'Job posting created. Confirmation email queued for recruiter.',
      data: job,
    });
  } catch (err) {
    next(err);
  }
}

export async function listJobsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const jobs = await listActiveJobs();
    res.status(200).json({ success: true, message: 'Jobs retrieved successfully', data: jobs });
  } catch (err) {
    next(err);
  }
}

export async function applyToJobController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const application = await applyToJob({
      jobId: req.params.id as string,
      candidateName: req.body.candidateName,
      candidateEmail: req.body.candidateEmail,
    });
    res.status(201).json({
      success: true,
      message:
        'Application submitted. Confirmation email queued. Follow-up reminder scheduled in 3 days.',
      data: application,
    });
  } catch (err) {
    next(err);
  }
}
