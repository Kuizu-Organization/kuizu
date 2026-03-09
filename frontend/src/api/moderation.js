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
