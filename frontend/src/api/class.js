import api from './auth';

export const getMyClasses = async () => {
    const response = await api.get('/classes/me');
    return response.data;
};

export const createClass = async (classData) => {
    const response = await api.post('/classes', classData);
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

export const joinClass = async (classId, joinData) => {
    const response = await api.post(`/classes/${classId}/join`, joinData);
    return response.data;
};

export const leaveClass = async (classId) => {
    const response = await api.delete(`/classes/${classId}/leave`);
    return response.data;
};

export const getClassJoinCode = async (classId) => {
    const response = await api.get(`/classes/${classId}/join-code`);
    return response.data;
};
