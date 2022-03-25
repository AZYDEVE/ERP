import axios from "axios";

const errorHandling = (result) => {
  if (result.data) {
    return result; // return success object
  }

  const responseError = {
    type: "Error",
    message: result.message || "Something went wrong",
    data: result.data || "",
    code: result.code || "",
  };

  const error = new Error();
  error.info = responseError;

  return error;
};

export const get_productList = async () => {
  const result = await axios.get(
    process.env.NEXT_PUBLIC_SERVER_HOST + "/product/productList"
  );
  const handledResult = errorHandling(result);
  return handledResult;
};

export const create_product = async (body) => {
  const result = await axios.post(
    process.env.NEXT_PUBLIC_SERVER_HOST + "/product/createProduct",
    body
  );
  const handledResult = errorHandling(result);
  return handledResult;
};

export const delete_product = async (body) => {
  const result = await axios.post(
    process.env.NEXT_PUBLIC_SERVER_HOST + "/product/deleteProduct",
    body
  );
  const handledResult = errorHandling(result);
  return handledResult;
};

export const update_product = async (body) => {
  const result = await axios.post(
    process.env.NEXT_PUBLIC_SERVER_HOST + "/product/updateProduct",
    body
  );
  console.log(result);
  const handledResult = errorHandling(result);
  return handledResult;
};
