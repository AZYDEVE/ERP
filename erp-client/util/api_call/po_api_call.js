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

export const create_po = async (body) => {
  const result = await axios.post(
    process.env.NEXT_PUBLIC_SERVER_HOST + "/po/createPo",
    body
  );
  const handledResult = errorHandling(result);
  return handledResult;
};
