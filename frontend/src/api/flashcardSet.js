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

export const searchFlashcardSets = async (query) => {
    // Falls back to regular search or filtered public sets if /search is not available
    // But backend should have search. Adding it here for frontend consistency.
    const response = await api.get('/flashcard-sets/search', { params: { query } });
    return response.data;
};

export const getSuggestedSets = async (limit) => {
    const response = await api.get('/flashcard-sets/suggested', { params: { limit } });
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

export const deleteFlashcardSet = async (setId) => {
    await api.delete(`/flashcard-sets/${setId}`);
};
