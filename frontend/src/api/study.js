import api from './auth';

export const submitQuiz = async (quizData) => {
    const response = await api.post('/study/quiz/submit', quizData);
    return response.data;
};

export const getQuizResults = async (setId) => {
    const response = await api.get(`/study/quiz/results/${setId}`);
    return response.data;
};

export const getStudyProgress = async (setId) => {
    const response = await api.get(`/study/progress/${setId}`);
    return response.data;
};

export const resetStudyProgress = async (setId) => {
    await api.post(`/study/progress/reset/${setId}`);
};

export const updateStudyProgress = async (cardId, isCorrect) => {
    const response = await api.post('/study/study/update', { cardId, isCorrect });
    return response.data;
};

export const initializeQuiz = async (quizConfig) => {
    const response = await api.post('/study/quiz/initialize', quizConfig);
    return response.data;
};
