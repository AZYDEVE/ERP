import axios from "axios";

export const create_po = async (body) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/po/createPo",
      body
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const getListOpenPO = async () => {
  try {
    const result = await axios.get(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/po/getListOpenPo"
    );
    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const getPo = async (body) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/po/getPo",
      body
    );
    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const deletePo = async (body) => {
  try {
    const result = axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/po/deletePo",
      body
    );
    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const updatePO = async (body) => {
  console.log("hello");
  try {
    const result = axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/po/updatePo",
      body
    );
    return result;
  } catch (err) {
    throw new Error(err);
  }
};
