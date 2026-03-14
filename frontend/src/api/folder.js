import api from './auth';

export const getMyFolders = async () => {
    const response = await api.get('/folders/me');
    return response.data;
};

export const getFolderDetail = async (folderId) => {
    const response = await api.get(`/folders/${folderId}`);
    return response.data;
};
