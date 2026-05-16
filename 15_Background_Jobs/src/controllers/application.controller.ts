import type { Request, Response, NextFunction } from 'express';
import { listApplications } from '../services/application.service';

export async function listApplicationsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { jobId } = req.query;
    const applications = await listApplications(jobId as string | undefined);
    res.status(200).json({
      success: true,
      message: 'Applications retrieved successfully',
      data: applications,
    });
  } catch (err) {
    next(err);
  }
}
