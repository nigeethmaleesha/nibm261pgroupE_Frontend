// SCRUM-125: Customer Completed Repair Records & Past Repairs types

export type CompletedRepairOutcome = "repaired" | "unrepaired";

export type CompletedEstimateItem = {
  description: string;
  quantity: number;
  unitPrice: string | number;
  totalPrice: string | number;
};

export type CompletedCustomerDecision = {
  action: string;
  decidedAt?: string | null;
};

export type CompletedJobEstimate = {
  versionNumber?: number;
  status?: string;
  currency?: string;
  total?: string | number;
  customerDecision?: CompletedCustomerDecision | null;
  items?: CompletedEstimateItem[];
};

export type CompletedRepairDevice = {
  brand: string;
  model: string;
  serialNumber?: string | null;
};

export type CompletedRepairRecord = {
  reference: string;
  device: CompletedRepairDevice;
  reportedFault?: string | null;
  status: string;
  outcome: CompletedRepairOutcome | string;
  outcomeDisplay?: string;
  outcomeDescription?: string | null;
  collectedAt?: string | null;
  collectionTime?: string | null;
  publicRepairSummary?: string | null;
  returnReason?: string | null;
  returnNotes?: string | null;
  latestEstimate?: CompletedJobEstimate | null;
  estimateHistory?: CompletedJobEstimate[];
};

export type JobHistoryApiResponse = {
  status?: string;
  data?: {
    count: number;
    jobs: CompletedRepairRecord[];
  };
  count?: number;
  jobs?: CompletedRepairRecord[];
};
