export type PublicTrackingEventType =
  | "INTAKE"
  | "STATUS_CHANGE"
  | "DIAGNOSIS"
  | "ESTIMATE_ISSUED"
  | "ESTIMATE_APPROVED"
  | "ESTIMATE_REJECTED"
  | "PROGRESS_UPDATE"
  | "PARTS_DELAY"
  | "PARTS_ARRIVED"
  | "READY_COLLECTION"
  | "READY_RETURN"
  | "COLLECTED"
  | string;

export interface PublicTrackingEvent {
  id: string;
  eventType: PublicTrackingEventType;
  status: string;
  title: string;
  description: string;
  timestamp: string;
  date?: string;
}

export interface TrackingJobSummary {
  id: string;
  reference: string;
  status: string;
  deviceType: string;
  makeModel: string;
  serialNumber?: string;
  reportedFault?: string;
  receivedAt: string;
  updatedAt?: string;
}

export interface EstimateDecisionData {
  estimateId: string;
  versionNumber: number;
  total: string;
  totalMinor?: number;
  status: string;
  canDecide: boolean;
  decisionUrl?: string;
  viewEstimateUrl?: string;
}

export interface PartsDelayData {
  requiredPart?: string;
  reason?: string;
  publicDelayReason?: string;
  placedAt?: string;
}

export interface CollectionDetailsData {
  collectedAt?: string;
  collectionTime?: string;
  outcome?: "repaired" | "unrepaired" | string;
  outcomeDescription?: string;
}

export interface CustomerRepairTrackingResponse {
  job: TrackingJobSummary;
  currentStatus: string;
  status: string;
  actionRequired?: boolean;
  actionType?: "ESTIMATE_DECISION" | string | null;
  actionMessage?: string | null;
  estimateDecision?: EstimateDecisionData | null;
  estimateDecisionLink?: string | null;
  currentEstimateLink?: string | null;
  publicDelayReason?: string | null;
  partsDelay?: PartsDelayData | null;
  handoverInstruction?: string | null;
  collection?: CollectionDetailsData | null;
  collectedAt?: string | null;
  collectionTime?: string | null;
  collectionOutcome?: string | null;
  publicEvents: PublicTrackingEvent[];
}
