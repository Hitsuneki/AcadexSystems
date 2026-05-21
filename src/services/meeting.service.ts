/**
 * Meeting service — stub.
 */
import type { Meeting, ActionItem } from '@/types';

export interface CreateMeetingPayload {
  title: string;
  date: string;
  attendeeIds: string[];
  notes?: string;
  actionItems: Omit<ActionItem, 'id'>[];
}

export async function createMeeting(_projectId: string, _payload: CreateMeetingPayload): Promise<Meeting> {
  await new Promise((r) => setTimeout(r, 400));
  return {
    id: `meeting-${Date.now()}`,
    projectId: _projectId,
    title: _payload.title,
    date: _payload.date,
    attendeeIds: _payload.attendeeIds,
    notes: _payload.notes,
    actionItems: _payload.actionItems.map((ai, i) => ({ ...ai, id: `ai-${Date.now()}-${i}` })),
    createdAt: new Date().toISOString(),
  };
}

export async function updateMeeting(_meetingId: string, _payload: Partial<CreateMeetingPayload>): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
}
