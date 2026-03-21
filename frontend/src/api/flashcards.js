import api from './auth';

export const getPublicFlashcardSets = async () => {
    const response = await api.get('/flashcard-sets');
    return response.data;
};

export const getMyFlashcardSets = async () => {
    const response = await api.get('/flashcard-sets/my');
    return response.data;
};

export const getFlashcardSetById = async (setId) => {
    const response = await api.get(`/flashcard-sets/${setId}`);
    return response.data;
};

export const createFlashcardSet = async (setData) => {
    const response = await api.post('/flashcard-sets', setData);
    return response.data;
};

export const updateFlashcardSet = async (setId, setData) => {
    const response = await api.put(`/flashcard-sets/${setId}`, setData);
    return response.data;
};

export const reRequestFlashcardSetReview = async (setId) => {
    const response = await api.post(`/flashcard-sets/${setId}/re-request`);
    return response.data;
};

export const deleteFlashcardSet = async (setId) => {
    await api.delete(`/flashcard-sets/${setId}`);
};

export const getFlashcardsBySetId = async (setId) => {
    const response = await api.get(`/flashcards/set/${setId}`);
    return response.data;
};

export const getFlashcardById = async (cardId) => {
    const response = await api.get(`/flashcards/${cardId}`);
    return response.data;
};

export const createFlashcard = async (setId, cardData) => {
    const response = await api.post(`/flashcards/set/${setId}`, cardData);
    return response.data;
};

export const updateFlashcard = async (cardId, cardData) => {
    const response = await api.put(`/flashcards/${cardId}`, cardData);
    return response.data;
};

export const deleteFlashcard = async (cardId) => {
    await api.delete(`/flashcards/${cardId}`);
};
