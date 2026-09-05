export interface CounterProposal {
  id: string;
  meetingRequestId: string;
  proposedById: string;
  startAt: Date;
  endAt: Date;
  message: string | null;
  createdAt: Date;
}
