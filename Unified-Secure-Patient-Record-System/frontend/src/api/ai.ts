import client from './client';
import type {
  AiChatMessage,
  AiChatResponse,
  AiStatusResponse,
  ExplainRecordResponse,
} from '../types';

export async function fetchAiStatus(): Promise<AiStatusResponse> {
  const { data } = await client.get<AiStatusResponse>('/ai/status');
  return data;
}

export async function sendAiChat(
  message: string,
  history: AiChatMessage[],
): Promise<AiChatResponse> {
  const { data } = await client.post<AiChatResponse>('/ai/chat', { message, history });
  return data;
}

export async function explainRecord(
  recordId: string,
  followUpQuestion?: string,
): Promise<ExplainRecordResponse> {
  const { data } = await client.post<ExplainRecordResponse>('/ai/explain-record', {
    record_id: recordId,
    follow_up_question: followUpQuestion || null,
  });
  return data;
}
