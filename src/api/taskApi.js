import api from "./axios";

export const getAssignableUsers = async (token) => {
  const response = await api.get("/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.users || [];
};

export const createTask = async (taskData, token) => {
  const response = await api.post("/tasks", taskData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};