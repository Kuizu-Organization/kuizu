import api from './auth';

export const getMyFolders = async () => {
    const response = await api.get('/folders/me');
    return response.data;
};

export const getFolderDetail = async (folderId) => {
    const response = await api.get(`/folders/${folderId}`);
    return response.data;
};

export const createFolder = async (folderData) => {
    const response = await api.post('/folders', folderData);
    return response.data;
};

export const getPublicFolders = async () => {
    const response = await api.get('/folders/public');
    return response.data;
};
