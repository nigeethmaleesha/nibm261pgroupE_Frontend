export type CustomerEstimateLineType = "PART" | "LABOUR";

export type CustomerEstimateItem = {
  id: string;
  lineNumber: number;
  type: CustomerEstimateLineType;
  description: string;
  quantity: number;
  unitPriceMinor: number;
  unitPrice: string;
  lineTotalMinor: number;
  lineTotal: string;
};

export type CustomerEstimateDecisionState =
  | "SUPERSEDED"
  | "AWAITING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "ISSUED";

export type CustomerEstimate = {
  id: string;
  versionNumber: number;
  currency: "LKR";
  totalMinor: number;
  total: string;
  issuedAt: string;
  status: "Issued" | "Approved" | "Rejected";
  decisionState: CustomerEstimateDecisionState;
  isLatest: boolean;
  isSuperseded: boolean;
  canDecide: boolean;
  decision: {
    action: "APPROVED" | "REJECTED";
    decidedAt: string | null;
  } | null;
  proposedWork: string[];
  items: CustomerEstimateItem[];
};

export type CustomerEstimateJob = {
  id: string;
  reference: string;
  status: string;
  deviceType: string;
  makeModel: string;
  serialNumber: string | null;
  receivedAt: string;
};

export type CurrentEstimateResponse = {
  job: CustomerEstimateJob;
  hasEstimate: boolean;
  message: string | null;
  estimate: CustomerEstimate | null;
};

export type EstimateDecisionResponse = {
  created: boolean;
  idempotentReplay: boolean;
  message: string;
  jobStatus: string;
  estimateStatus: string;
};
