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
