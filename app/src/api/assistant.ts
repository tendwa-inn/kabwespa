import { apiRequest, ADMIN_TOKEN_KEY } from "./client";
import { AssistantCategory, AssistantQuestion } from "./types";

export function fetchAssistantQuestions() {
  return apiRequest<{ questions: AssistantQuestion[] }>("/api/assistant-questions");
}

export function addAssistantQuestion(question: string, answer: string, category: AssistantCategory) {
  return apiRequest<{ question: AssistantQuestion }>("/api/assistant-questions", {
    method: "POST",
    body: { question, answer, category },
    tokenKey: ADMIN_TOKEN_KEY,
  });
}

export function updateAssistantQuestion(
  id: string,
  changes: { question?: string; answer?: string; category?: AssistantCategory }
) {
  return apiRequest<{ question: AssistantQuestion }>(`/api/assistant-questions/${id}`, {
    method: "PUT",
    body: changes,
    tokenKey: ADMIN_TOKEN_KEY,
  });
}

export function deleteAssistantQuestion(id: string) {
  return apiRequest<{ ok: boolean }>(`/api/assistant-questions/${id}`, {
    method: "DELETE",
    tokenKey: ADMIN_TOKEN_KEY,
  });
}
