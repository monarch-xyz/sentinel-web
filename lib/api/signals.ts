import { createApiClient } from '@/lib/api/client';
import {
  CreateSignalRequest,
  SignalHistoryResponse,
  SignalPlanLimits,
  SignalRecord,
  UpdateSignalRequest,
} from '@/lib/types/signal';

const client = createApiClient({ baseUrl: '' });

export const listSignals = () => client.get<SignalRecord[]>('/api/iruka/signals');

export const getSignalLimits = () => client.get<SignalPlanLimits>('/api/iruka/me/limits');

export const getSignal = (id: string) => client.get<SignalRecord>(`/api/iruka/signals/${id}`);

export const createSignal = (payload: CreateSignalRequest) =>
  client.post<SignalRecord, CreateSignalRequest>('/api/iruka/signals', payload);

export const updateSignal = (id: string, payload: UpdateSignalRequest) =>
  client.patch<SignalRecord, UpdateSignalRequest>(`/api/iruka/signals/${id}`, payload);

export const toggleSignal = (id: string) => client.patch<SignalRecord, Record<string, never>>(`/api/iruka/signals/${id}/toggle`, {});

export const deleteSignal = (id: string) => client.del<void>(`/api/iruka/signals/${id}`);

export const simulateSignal = (id: string, payload: Record<string, unknown>) =>
  client.post<Record<string, unknown>, Record<string, unknown>>(`/api/iruka/simulate/${id}/simulate`, payload);

export const findFirstTrigger = (id: string, payload: Record<string, unknown>) =>
  client.post<Record<string, unknown>, Record<string, unknown>>(`/api/iruka/simulate/${id}/first-trigger`, payload);

export const getSignalLogs = (id: string) => client.get<SignalHistoryResponse>(`/api/iruka/signals/${id}/history?include_notifications=true`);

export const getSignalHistory = (id: string) =>
  client.get<SignalHistoryResponse>(`/api/iruka/signals/${id}/history?include_notifications=true`);
