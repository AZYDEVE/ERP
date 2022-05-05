import { DataGrid } from "@mui/x-data-grid";
import RingLoader from "react-spinners/RingLoader";
import { useEffect, useState } from "react";
import { Grid, Backdrop, Typography, Box, Modal } from "@mui/material";
import { get_list_salesOrder } from "../../util/api_call/salesOrder_api_call";
import Swal from "sweetalert2";
import SalesOrderUpdateDelete from "../../component/forms/salesOrder_update_delete_form";

const SOlist = () => {
  const [salesList, setSalesList] = useState("");
  const [spiner, setSpiner] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedSales, setSelectedSales] = useState("");

  useEffect(() => {
    const getOpenSO = async () => {
      try {
        const result = await get_list_salesOrder();

        setSalesList(result.data);
        console.log(salesList);
      } catch (err) {
        Swal.fire({
          title: `SOMETHING WENT WRONG `,
          text: err,
          icon: "error",
          showConfirmButton: true,
        });
      }
    };
    getOpenSO();
  }, []);

  const generateColumn = () => {
    return Object.keys(salesList[0]).map((keyName, index) => {
      return {
        field: keyName,
        headerName: keyName,
        headerClassName: "datagridHeader",
        headerAlign: "left",
        flex: keyName == "id" ? 0.5 : 1,
      };
    });
  };

  if (!salesList) {
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
        <Typography variant="h6">Sales Order List</Typography>
      </Grid>
      <Grid item xs={7.5} mt={2}>
        <Box sx={{ height: "85vh", width: "100%" }}>
          <DataGrid
            // align="center"
            headerHeight={50}
            rowHeight={60}
            rows={salesList}
            border
            columns={generateColumn()}
            sx={{ ".datagridHeader": { backgroundColor: "primary.main" } }}
            onRowClick={(event, index) => {
              console.log(event.row.id);
              setModalIsOpen(true);
              setSelectedSales({
                salesOrderID: event.row.id,
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
          <SalesOrderUpdateDelete salesOrderID={selectedSales} />
        </Box>
      </Modal>
    </Grid>
  );
};

export default SOlist;
