import {
  AvailabilityConflictError,
  ForbiddenMeetingRequestActionError,
  MeetingRequestConcurrentlyModifiedError,
  MeetingRequestNotFoundError,
  MeetingRequestNotOpenError,
  NotAPartyError,
  NotAResponderError,
  InvalidTimeRangeError,
} from "@/modules/meeting-requests";
import { apiError } from "./api-error";
import type { NextResponse } from "next/server";

export function mapMeetingRequestError(error: unknown): NextResponse | null {
  if (error instanceof MeetingRequestNotFoundError) return apiError(404, "not_found", error.message);
  if (error instanceof NotAPartyError) return apiError(403, "forbidden", error.message);
  if (error instanceof NotAResponderError) return apiError(403, "forbidden", error.message);
  if (error instanceof ForbiddenMeetingRequestActionError) return apiError(403, "forbidden", error.message);
  if (error instanceof MeetingRequestNotOpenError) return apiError(409, "not_open", error.message);
  if (error instanceof AvailabilityConflictError) return apiError(409, "availability_conflict", error.message);
  if (error instanceof MeetingRequestConcurrentlyModifiedError) return apiError(409, "conflict", error.message);
  if (error instanceof InvalidTimeRangeError) return apiError(400, "invalid_input", error.message);
  return null;
}
