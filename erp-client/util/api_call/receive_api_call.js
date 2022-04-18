import axios from "axios";

export const get_open_po_receiving_detail = async (body) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/receive/getOpenPoReceivingDetail",
      body
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const insert_receive_documents = async (body) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/receive/insertReceiveDocument",
      body
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};
