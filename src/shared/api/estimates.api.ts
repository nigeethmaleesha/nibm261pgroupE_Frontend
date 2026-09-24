import { requestJson } from "./http";
import type {
  CurrentEstimateResponse,
  EstimateDecisionResponse,
} from "@/src/shared/types/estimates";

export function getCurrentEstimate(jobIdentifier: string) {
  return requestJson<CurrentEstimateResponse>(
    `/customer/jobs/${encodeURIComponent(jobIdentifier.trim())}/current-estimate`,
    { method: "GET" },
  );
}

export function submitEstimateDecision(
  jobIdentifier: string,
  payload: { action: "APPROVE" | "REJECT"; versionNumber: number; total: string },
) {
  return requestJson<EstimateDecisionResponse>(
    `/jobs/${encodeURIComponent(jobIdentifier.trim())}/estimate-decision`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
