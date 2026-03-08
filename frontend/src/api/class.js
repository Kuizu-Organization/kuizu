import api from './auth';

export const getMyClasses = async () => {
    const response = await api.get('/classes/me');
    return response.data;
};

export const getClassDetails = async (classId) => {
    const response = await api.get(`/classes/${classId}`);
    return response.data;
};

export const searchClasses = async (query) => {
    const response = await api.get(`/classes/search`, { params: { query } });
    return response.data;
};
