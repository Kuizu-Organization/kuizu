import api from "./auth";

export const getCurrentUser = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put("/users/profile", profileData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.post("/users/change-password", passwordData);
  return response.data;
};

export const getAllUsers = async (page = 0, size = 10, search = '', role = 'ALL', status = 'ALL') => {
  let url = `/users?page=${page}&size=${size}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (role && role !== 'ALL') url += `&role=${role}`;
  if (status && status !== 'ALL') url += `&status=${status}`;
  const response = await api.get(url);
  return response.data;
};

export const updateUserStatus = async (userId, status) => {
  const response = await api.patch(`/users/${userId}/status?status=${status}`);
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await api.patch(`/users/${userId}/role?role=${role}`);
  return response.data;
};

export const setPassword = async (passwordData) => {
  const response = await api.post("/users/set-password", passwordData);
  return response.data;
};
