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

export const getAvailableSets = async (folderId) => {
    const response = await api.get(`/folders/${folderId}/available-sets`);
    return response.data;
};

export const addSetToFolder = async (folderId, setId) => {
    const response = await api.post(`/folders/${folderId}/sets/${setId}`);
    return response.data;
};

export const removeSetFromFolder = async (folderId, setId) => {
    const response = await api.delete(`/folders/${folderId}/sets/${setId}`);
    return response.data;
};

export const getMySets = async () => {
    const response = await api.get('/folders/my-sets');
    return response.data;
};

export const updateFolder = async (folderId, updateData) => {
    const response = await api.put(`/folders/${folderId}`, updateData);
    return response.data;
};

export const deleteFolder = async (folderId) => {
    const response = await api.delete(`/folders/${folderId}`);
    return response.data;
};
