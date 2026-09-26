// SCRUM-103: types for the customer my-jobs list endpoint (SCRUM-104).

export type RepairJobStatus =
  | "Received"
  | "Diagnosing"
  | "Awaiting Approval"
  | "Approved"
  | "Estimate Rejected"
  | "In Repair"
  | "Waiting for Parts"
  | "Ready for Collection"
  | "Ready for Return"
  | "Collected";

export type CustomerRepairJobListItem = {
  id: string;
  reference: string;
  deviceType: string;
  makeModel: string;
  serialNumber: string | null;
  reportedFault: string | null;
  status: RepairJobStatus;
  receivedAt: string;
  hasEstimate: boolean;
};

export type MyJobsResponse = {
  count: number;
  jobs: CustomerRepairJobListItem[];
};
