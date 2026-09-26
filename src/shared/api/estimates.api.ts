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
  payload: {
    action: "APPROVE" | "REJECT";
    estimateId: string;
    versionNumber: number;
    total: string;
  },
) {
  return requestJson<EstimateDecisionResponse>(
    `/jobs/${encodeURIComponent(jobIdentifier.trim())}/estimate-decision`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function getEstimateHistory(jobIdentifier: string) {
  return requestJson<import("@/src/shared/types/estimates").EstimateHistoryResponse>(
    `/jobs/${encodeURIComponent(jobIdentifier.trim())}/estimates/history`,
    { method: "GET" },
  );
}
