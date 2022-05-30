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
