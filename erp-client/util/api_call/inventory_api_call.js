import axios from "axios";

export const getInventoryList = async () => {
  try {
    const result = await axios.get(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/inventory/inventoryList"
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const insertTransaction = async (body) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/inventory/insertTransaction",
      body
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};
