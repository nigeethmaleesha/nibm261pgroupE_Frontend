// SCRUM-103: API call for the customer my-jobs list (SCRUM-104 backend).
import { requestJson } from "./http";
import type { MyJobsResponse } from "@/src/shared/types/repairJobs";

export function getMyJobs() {
  return requestJson<MyJobsResponse>("/customer/my-jobs", { method: "GET" });
}
