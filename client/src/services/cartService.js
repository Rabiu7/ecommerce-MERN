import api from "./api";

// Get cart

export const getCart = async () => {
  const response = await api.get("/cart");

  return response.data;
};

// Add cart item

export const addCartItem = async (data) => {
  const response = await api.post(
    "/cart",

    data,
  );

  return response.data;
};

// Remove item

export const removeCartItem = async (id) => {
  const response = await api.delete(`/cart/${id}`);

  return response.data;
};
