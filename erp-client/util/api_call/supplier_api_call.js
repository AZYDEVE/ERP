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

export const get_supplierList = async () => {
  const result = await axios.get(
    process.env.NEXT_PUBLIC_SERVER_HOST + "/supplier/supplierList"
  );
  const handledResult = errorHandling(result);
  return handledResult;
};

export const create_supplier = async (body) => {
  const result = await axios.post(
    process.env.NEXT_PUBLIC_SERVER_HOST + "/supplier/createSupplier",
    body
  );
  const handledResult = errorHandling(result);
  return handledResult;
};

export const delete_supplier = async (body) => {
  const result = await axios.post(
    process.env.NEXT_PUBLIC_SERVER_HOST + "/supplier/deleteSupplier",
    body
  );
  const handledResult = errorHandling(result);
  return handledResult;
};

export const update_supplier = async (body) => {
  const result = await axios.post(
    process.env.NEXT_PUBLIC_SERVER_HOST + "/supplier/updateSupplier",
    body
  );
  console.log(result);
  const handledResult = errorHandling(result);
  return handledResult;
};
