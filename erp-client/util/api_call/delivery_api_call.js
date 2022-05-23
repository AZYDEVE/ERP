import axios from "axios";

export const get_Sales_OrderDetail_For_CreateDelivery = async (
  salesOrderID
) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST +
        "/delivery/getSalesOrderDetailForCreateDelivery",
      salesOrderID
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const CREATE_DELIVERY = async (deliveryBody) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/delivery/createDelivery",
      deliveryBody
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const get_list_open_deliveries = async () => {
  try {
    const result = await axios.get(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/delivery/listOpenDelivery"
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const get_delivery = async (DeliveryID) => {
  console.log(DeliveryID);
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/delivery/getDelivery",
      DeliveryID
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const delete_delivery = async (DeliveryID) => {
  console.log(DeliveryID);
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/delivery/deleteDelivery",
      DeliveryID
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const release_delivery = async (DeliveryID) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/delivery/releaseDelivery",
      DeliveryID
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const update_delivery = async (DeliveryDetail) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/delivery/updateDelivery",
      DeliveryDetail
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};
