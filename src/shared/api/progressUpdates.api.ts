import { requestJson } from "./http";
import type { CustomerProgressUpdatesResponse } from "@/src/shared/types/progressUpdates";

/**
 * Public repair progress updates for one of the customer's own jobs, newest
 * first. Another customer's job returns 404.
 * Backend: GET /api/customer/jobs/:jobIdentifier/progress-updates
 */
export function getRepairProgressUpdates(jobIdentifier: string) {
  return requestJson<CustomerProgressUpdatesResponse>(
    `/customer/jobs/${encodeURIComponent(jobIdentifier.trim())}/progress-updates`,
    { method: "GET" },
  );
}
