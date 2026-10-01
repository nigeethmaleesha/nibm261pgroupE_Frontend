// SCRUM-109: Customer Public Repair Tracking API client
import { requestJson } from "./http";
import type { CustomerRepairTrackingResponse } from "@/src/shared/types/tracking";

export function getCustomerRepairTracking(jobIdentifier: string) {
  return requestJson<CustomerRepairTrackingResponse>(
    `/customer/jobs/${encodeURIComponent(jobIdentifier.trim())}/track`,
    { method: "GET" },
  );
}
