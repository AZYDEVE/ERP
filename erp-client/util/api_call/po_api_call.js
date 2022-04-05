import axios from "axios";
import Swal from "sweetalert2";

export const create_po = async (body) => {
  try {
    const result = await axios.post(
      process.env.NEXT_PUBLIC_SERVER_HOST + "/po/createPo",
      body
    );

    if (result.status == 200) {
      Swal.fire({
        title: `SUCCESS`,
        text: `PO# : ${result.data.data}`,
        icon: "success",
        showConfirmButton: true,
      });
    }
  } catch (err) {
    Swal.fire({
      title: `SOMETHING WENT WRONG `,
      text: err,
      icon: "error",
      showConfirmButton: true,
    });
  }
};
