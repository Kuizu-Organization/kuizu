import api from "./auth";

export const createFlashcardSet = async (request) => {
  const response = await api.post("/flashcard-sets", request);
  return response.data;
};

export const getMyFlashcardSets = async () => {
  const response = await api.get("/flashcard-sets/me");
  return response.data;
};

export const getFlashcardSet = async (setId) => {
  const response = await api.get(`/flashcard-sets/${setId}`);
  return response.data;
};

export const searchFlashcardSets = async (query) => {
  const response = await api.get("/flashcard-sets/search", {
    params: { query },
  });
  return response.data;
};

export const getSuggestedSets = async (limit = 4) => {
  const response = await api.get("/flashcard-sets", {
    params: { type: "suggested", limit },
  });
  return response.data;
};
