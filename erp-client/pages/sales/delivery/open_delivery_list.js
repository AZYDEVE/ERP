import { DataGrid } from "@mui/x-data-grid";
import RingLoader from "react-spinners/RingLoader";
import { useEffect, useState } from "react";
import { Grid, Backdrop, Typography, Box, Modal } from "@mui/material";
import Swal from "sweetalert2";
import { get_list_open_deliveries } from "../../../util/api_call/delivery_api_call";
import { width } from "@mui/system";

const SOlist = () => {
  const [DeliveryList, setDeliveryList] = useState("");
  const [spiner, setSpiner] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState("");

  useEffect(() => {
    const getOpenDelivery = async () => {
      try {
        const result = await get_list_open_deliveries();

        setDeliveryList(result.data);
        console.log(DeliveryList);
      } catch (err) {
        Swal.fire({
          title: `SOMETHING WENT WRONG `,
          text: err,
          icon: "error",
          showConfirmButton: true,
        });
      }
    };
    getOpenDelivery();
  }, []);

  const columns = [
    {
      field: "id",
      headerName: "delivery#",
      headerClassName: "datagridHeader",
      align: "center",
      headerAlign: "center",
      flex: 0.8,
    },
    {
      field: "SalesOrderID",
      headerName: "Sales Order#",
      headerClassName: "datagridHeader",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "CreateDate",
      headerName: "Create Date",
      headerClassName: "datagridHeader",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "ShipDate",
      headerName: "Ship Date",
      headerClassName: "datagridHeader",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "Company_name_ch",
      headerName: "Customer Name",
      headerClassName: "datagridHeader",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "Amount",
      headerName: "Amount",
      headerClassName: "datagridHeader",
      align: "right",
      headerAlign: "right",
      flex: 0.8,
    },
    {
      field: "Status",
      headerName: "Status",
      headerClassName: "datagridHeader",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
  ];

  if (!DeliveryList) {
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
        <Typography variant="h6">Open Delivery List</Typography>
      </Grid>
      <Grid item xs={7.5} mt={3}>
        <Box sx={{ height: "85vh", width: "100%" }}>
          <DataGrid
            // align="center"
            checkboxSelection
            headerHeight={50}
            rowHeight={60}
            rows={DeliveryList}
            border
            columns={columns}
            // sx={{ ".datagridHeader": { backgroundColor: "primary.main" } }}
            onRowClick={(event, index) => {
              console.log(event.row.id);
              setModalIsOpen(true);
              setSelectedDelivery({
                DeliveryID: event.row.id,
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
          {/* <SalesOrderUpdateDelete salesOrderID={selectedDelivery} /> */}
        </Box>
      </Modal>
    </Grid>
  );
};

export default SOlist;
