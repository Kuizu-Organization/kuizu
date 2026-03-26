import api from './auth';

export const saveFlashcardSet = async (setId) => {
    const response = await api.post(`/saved-sets/${setId}`);
    return response.data;
};

export const unsaveFlashcardSet = async (setId) => {
    const response = await api.delete(`/saved-sets/${setId}`);
    return response.data;
};

export const getSavedFlashcardSets = async () => {
    const response = await api.get('/saved-sets');
    return response.data;
};

export const getSavedStatus = async (setId) => {
    const response = await api.get(`/saved-sets/${setId}/status`);
    return response.data;
};
