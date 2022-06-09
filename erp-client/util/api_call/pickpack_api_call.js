import axios from "axios";
export const get_Delivery_for_PickAndPack = async (DeliveryID) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST +
        "/pickpack/getDeliveryforPickAndPack",
      DeliveryID
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const delete_pickpack_set_delivery_status_to_block = async (
  DeliveryID
) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/pickpack/deletePickPack",
      DeliveryID
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const delete_pack_set_delivery_status_to_picking = async (
  DeliveryID
) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/pickpack/deletePack",
      DeliveryID
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const save_pick = async (pickPackDetail) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/pickpack/savepick",
      pickPackDetail
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const save_pack = async (pickPackDetail) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/pickpack/savepack",
      pickPackDetail
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const get_list_pick_pack_deliveries = async () => {
  try {
    const result = await axios.get(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/pickpack/listPickPackDelivery"
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const reverse_packed = async (DeliveryID) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST +
        "/pickpack/setDeliveryStatusToPacking",
      DeliveryID
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const reverse_goods_issue = async (DeliveryID) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST +
        "/pickpack/setDeliveryStatusToPacked",
      DeliveryID
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};

export const post_goods_issue = async (DeliveryID) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST +
        "/pickpack/setDeliveryStatusToShipped",
      DeliveryID
    );

    return result;
  } catch (err) {
    throw new Error(err);
  }
};
