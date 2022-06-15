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

export const get_customer_list = async () => {
  const result = await axios.get(
    process.env.NEXT_PUBLIC_SERVER_HOST + "/customer/customerlist"
  );
  const handledResult = errorHandling(result);
  return handledResult;
};

export const create_customer = async (body) => {
  const result = await axios.post(
    process.env.NEXT_PUBLIC_SERVER_HOST + "/customer/createCustomer",
    body
  );
  const handledResult = errorHandling(result);
  return handledResult;
};

export const delete_customer = async (body) => {
  await axios.post(
    process.env.NEXT_PUBLIC_SERVER_HOST + "/customer/deleteCustomer",
    body
  );
  const handledResult = errorHandling(result);
  return handledResult;
};

export const update_customerInfo = async (body) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/customer/updateCustomerInfo",
      body
    );
    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const update_customerShipto = async (body) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/customer/updateCustomerShipTO",
      body
    );
    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const createShipTO = async (shipTo) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/customer/createShipTO",
      shipTo
    );
    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const get_customer = async (DeliveryID) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/customer/getCustomer",
      DeliveryID
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};
