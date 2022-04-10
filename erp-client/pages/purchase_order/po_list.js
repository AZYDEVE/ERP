import { DataGrid } from "@mui/x-data-grid";
import RingLoader from "react-spinners/RingLoader";
import { useEffect, useState } from "react";
import { Grid, Backdrop, Typography, Box, Modal } from "@mui/material";
import { getListOpenPO } from "../../util/api_call/po_api_call";
import Swal from "sweetalert2";
import PoUpdateDelete from "../../component/forms/po_update_delete";

const Polist = () => {
  const [poList, setPoList] = useState("");
  const [spiner, setSpiner] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState("");

  useEffect(() => {
    const getOpenPo = async () => {
      try {
        const result = await getListOpenPO();

        setPoList(result.data);
        console.log(poList);
      } catch (err) {
        Swal.fire({
          title: `SOMETHING WENT WRONG `,
          text: err,
          icon: "error",
          showConfirmButton: true,
        });
      }
    };
    getOpenPo();
  }, []);

  const generateColumn = () => {
    return Object.keys(poList[0]).map((keyName, index) => {
      return {
        field: keyName,
        headerName: keyName,
        width: 200,
        headerClassName: "datagridHeader",
        headerAlign: "left",
      };
    });
  };

  if (!poList) {
    return (
      <>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={true}>
          <RingLoader loading={true} />
        </Backdrop>
      </>
    );
  }

  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} align="center">
        <Typography variant="h6">PO List</Typography>
      </Grid>
      <Grid item xs={7.5} mt={2}>
        <Box sx={{ height: "85vh", width: "100%" }}>
          <DataGrid
            // align="center"
            headerHeight={50}
            rowHeight={60}
            rows={poList}
            border
            columns={generateColumn()}
            sx={{ ".datagridHeader": { backgroundColor: "primary.main" } }}
            onRowClick={(event, index) => {
              console.log(event.row.id);
              setModalIsOpen(true);
              setSelectedPo({
                poID: event.row.id,
                vendorID: event.row["Vendor ID"],
              });
              console.log(event);
            }}
          />
        </Box>
      </Grid>
      <Modal
        open={modalIsOpen}
        onClose={() => {
          setModalIsOpen(false);
        }}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80vw",
            height: "90vh",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            overflow: "scroll",
          }}>
          <PoUpdateDelete poInfo={selectedPo} />
        </Box>
      </Modal>
    </Grid>
  );
};

export default Polist;
