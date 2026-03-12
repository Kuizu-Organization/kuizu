import api from "./auth";

export const getPendingFlashcardSets = async () => {
  const response = await api.get("/moderation/submissions/flashcards");
  return response.data;
};

export const getPendingClasses = async () => {
  const response = await api.get("/moderation/submissions/classes");
  return response.data;
};

export const getModerationHistory = async () => {
    const response = await api.get("/moderation/history");
    return response.data;
};

export const approveFlashcardSet = async (setId, notes = "") => {
    const response = await api.post(`/moderation/flashcards/${setId}/approve`, { notes });
    return response.data;
};

export const rejectFlashcardSet = async (setId, notes = "") => {
    const response = await api.post(`/moderation/flashcards/${setId}/reject`, { notes });
    return response.data;
};

export const approveClass = async (classId, notes = "") => {
    const response = await api.post(`/moderation/classes/${classId}/approve`, { notes });
    return response.data;
};

export const rejectClass = async (classId, notes = "") => {
    const response = await api.post(`/moderation/classes/${classId}/reject`, { notes });
    return response.data;
};
