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

export const createSetInFolder = async (folderId, setData) => {
    const response = await api.post(`/folders/${folderId}/sets/new`, setData);
    return response.data;
};

export const addSetToFolder = async (folderId, setId, category) => {
    const params = category ? { category } : {};
    const response = await api.post(`/folders/${folderId}/sets/${setId}`, null, { params });
    return response.data;
};

export const addFolderCategory = async (folderId, categoryName) => {
    const response = await api.post(`/folders/${folderId}/categories`, { name: categoryName });
    return response.data;
};

export const deleteFolderCategory = async (folderId, categoryName) => {
    const response = await api.delete(`/folders/${folderId}/categories/${categoryName}`);
    return response.data;
};
