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

export const updateClass = async (classId, classData) => {
    const response = await api.put(`/classes/${classId}`, classData);
    return response.data;
};

export const deleteClass = async (classId) => {
    const response = await api.delete(`/classes/${classId}`);
    return response.data;
};

export const removeMember = async (classId, userId) => {
    const response = await api.delete(`/classes/${classId}/members/${userId}`);
    return response.data;
};

export const processJoinRequest = async (classId, requestId, status) => {
    const response = await api.post(`/classes/${classId}/join-requests/${requestId}/process`, { status });
    return response.data;
};
