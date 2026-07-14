import api from "./axios";

const authConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getAssignableUsers = async (token) => {
  const response = await api.get("/users", authConfig(token));

  return response.data.users || [];
};

export const createTask = async (taskData, token) => {
  const response = await api.post(
    "/tasks",
    taskData,
    authConfig(token)
  );

  return response.data;
};

export const getTaskById = async (taskId, token) => {
  const response = await api.get(
    `/tasks/${taskId}`,
    authConfig(token)
  );

  return response.data.task || response.data;
};

export const updateTask = async (taskId, taskData, token) => {
  const response = await api.patch(
    `/tasks/${taskId}`,
    taskData,
    authConfig(token)
  );

  return response.data;
};

export const deleteTask = async (taskId, token) => {
  const response = await api.delete(
    `/tasks/${taskId}`,
    authConfig(token)
  );

  return response.data;
};