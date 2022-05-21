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

export const get_delivery = async () => {
  try {
    const result = await axios.get(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/delivery/getDelivery"
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};
