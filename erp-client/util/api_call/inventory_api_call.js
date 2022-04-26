import axios from "axios";

export const getInventoryList = async (body) => {
  try {
    const result = await axios.get(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/inventory/inventoryList"
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};
