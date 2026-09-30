// Customer-safe repair progress updates. The backend only returns
// job_progress_logs rows with is_public: true; technician internal notes,
// technician identity and correction reasons are never included.

import type { RepairJobStatus } from "./repairJobs";

// Job statuses where repair work has started, so progress is worth showing.
export const PROGRESS_VISIBLE_STATUSES: string[] = [
  "In Repair",
  "Waiting for Parts",
  "Ready for Collection",
  "Collected",
];

export type CustomerProgressUpdate = {
  id: string;
  message: string;
  estimateVersionNumber: number;
  // True when this update replaces an earlier one (the earlier one is hidden).
  isCorrection: boolean;
  recordedAt: string;
};

export type CustomerProgressUpdatesResponse = {
  job: {
    reference: string;
    status: RepairJobStatus;
  };
  updates: CustomerProgressUpdate[];
};
