import api from "./api";

export const getAddress = async (userId) => {
  const response = await api.get(`/addresses/${userId}`);

  return response.data;
};

export const saveAddress = async (userId, data) => {
  const response = await api.post(`/addresses/${userId}`, data);

  return response.data;
};
