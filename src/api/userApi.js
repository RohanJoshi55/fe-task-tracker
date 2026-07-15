import api from "./axios";

const authConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getUsers = async (token) => {
  const response = await api.get("/users", authConfig(token));

  return response.data.users || response.data || [];
};

export const updateUser = async (userId, userData, token) => {
  const response = await api.patch(
    `/users/${userId}`,
    userData,
    authConfig(token)
  );

  return response.data;
};

export const resetUserPassword = async (
  userId,
  newPassword,
  token
) => {
  const response = await api.patch(
    `/users/reset-password/${userId}`,
    { newPassword },
    authConfig(token)
  );

  return response.data;
};

export const deleteUser = async (userId, token) => {
  const response = await api.delete(
    `/users/${userId}`,
    authConfig(token)
  );

  return response.data;
};