import {
  DataGrid,
  GridToolbarExport,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import RingLoader from "react-spinners/RingLoader";
import { useEffect, useState } from "react";
import { Grid, Backdrop, Typography, Box, Modal } from "@mui/material";
import { getListOpenPO } from "../../util/api_call/po_api_call";
import Swal from "sweetalert2";
import Receiving from "../../component/forms/receiveGoods_form";

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

  const column = [
    {
      field: "id",
      headerName: "PO ID",
      flex: 0.5,
      headerClassName: "datagridHeader",
      headerAlign: "left",
    },
    {
      field: "Po Date",
      headerName: "PO Date",
      flex: 1,
      headerClassName: "datagridHeader",
      headerAlign: "left",
    },
    {
      field: "Vendor ID",
      headerName: "Vendor ID",
      flex: 1,
      headerClassName: "datagridHeader",
      headerAlign: "left",
    },
    {
      field: "Company Name",
      headerName: "Company Name",
      flex: 1,
      headerClassName: "datagridHeader",
      headerAlign: "left",
    },

    {
      field: "Total cost",
      headerName: "Total cost",
      flex: 1,
      headerClassName: "datagridHeader",
      headerAlign: "left",
    },
    {
      field: "Status",
      headerName: "Status",
      flex: 1,
      headerClassName: "datagridHeader",
      headerAlign: "left",
    },
  ];

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

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport sx={{ color: "black" }} />
      </GridToolbarContainer>
    );
  }

  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} align="center">
        <Typography variant="h6">Receiving Goods</Typography>
      </Grid>
      <Grid item xs={7.5} mt={2}>
        <Box sx={{ height: "85vh", width: "100%" }}>
          <DataGrid
            // align="center"
            headerHeight={50}
            rowHeight={60}
            rows={poList}
            border
            components={{ Toolbar: CustomToolbar }}
            columns={column}
            sx={{
              border: "1px solid black",
              ".datagridHeader": {},
            }}
            onRowClick={(event, index) => {
              setModalIsOpen(true);
              setSelectedPo({
                poID: event.row.id,
                vendorID: event.row["Vendor ID"],
              });
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
          <Receiving poInfo={selectedPo} />
        </Box>
      </Modal>
    </Grid>
  );
};

export default Polist;
