import axios from "axios";

export const create_salesOrder = async (body) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/salesOrder/createSalesOrder",
      body
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const get_list_salesOrder = async () => {
  try {
    const result = await axios.get(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/salesOrder/getOpenSalesList"
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const get_sales_order_detail = async (salesOrderID) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/salesOrder/getSalesOrderDetail",
      salesOrderID
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const delete_sales_order = async (salesOrderID) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/salesOrder/deleteSalesOrder",
      salesOrderID
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const update_sales_order = async (salesOrder) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/salesOrder/updateSalesOrder",
      salesOrder
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};
