import api from "./api";

// Create order

export const createOrder = async (data) => {
  const response = await api.post(
    "/orders",

    data,
  );

  return response.data;
};

// Get user orders

export const getOrders = async () => {
  const response = await api.get("/orders");

  return response.data;
};
