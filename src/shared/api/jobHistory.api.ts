// SCRUM-125: Completed repair history API client
import { requestJson } from "./http";
import type {
  JobHistoryApiResponse,
  CompletedRepairRecord,
} from "@/src/shared/types/jobHistory";

export type CompletedJobsResult = {
  count: number;
  jobs: CompletedRepairRecord[];
};

export async function getCompletedJobsHistory(): Promise<CompletedJobsResult> {
  const res = await requestJson<JobHistoryApiResponse>(
    "/customer/jobs/history",
    { method: "GET" }
  );

  const jobs = res.data?.jobs ?? res.jobs ?? [];
  const count = res.data?.count ?? res.count ?? jobs.length;

  return { count, jobs };
}
