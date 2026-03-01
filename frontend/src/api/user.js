import api from './auth';

export const getCurrentUser = async () => {
    const response = await api.get('/users/me');
    return response.data;
};

export const updateProfile = async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
};

export const changePassword = async (passwordData) => {
    const response = await api.post('/users/change-password', passwordData);
    return response.data;
};
