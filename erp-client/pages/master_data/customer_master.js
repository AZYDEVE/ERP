import { DataGrid } from "@mui/x-data-grid";
import RingLoader from "react-spinners/RingLoader";
import { useEffect, useState } from "react";
import { Grid, Backdrop, Typography, Box, Modal, Button } from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import Swal from "sweetalert2";
import Customer_update_delete from "../../component/forms/customer_update_delete_form";
import AddCustomerForm from "../../component/forms/customer_add_form";
import Router from "next/router";
import { get_customer_list } from "../../util/api_call/customer_api_call";
const CustomerList = () => {
  const [CustomerList, setCustomerList] = useState("");
  const [spiner, setSpiner] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedCustomer, setselectedCustomer] = useState("");
  const [ModalDispaly, setModalDisplay] = useState("");

  useEffect(async () => {
    await getListOfCustomer();
  }, []);

  const getListOfCustomer = async () => {
    const result = await get_customer_list();
    try {
      if (result.data) {
        setCustomerList(result.data);
      }
    } catch (err) {
      setSpiner(false);
      Swal.fire({
        title: `SOMETHING WENT WRONG `,
        text: err,
        icon: "error",
        showConfirmButton: true,
      });
    }
  };

  const columns = [
    {
      field: "id",
      headerName: "Customer ID",
      headerClassName: "datagridHeader",
      align: "center",
      headerAlign: "center",
      hide: true,
      flex: 0.8,
    },
    {
      field: "CustomerID",
      headerName: "CustomerID",
      headerClassName: "datagridHeader",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "Company_name_ch",
      headerName: "Company name",
      headerClassName: "datagridHeader",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "BillingTel",
      headerName: "Tel",
      headerClassName: "datagridHeader",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "Tier",
      headerName: "Tier",
      headerClassName: "datagridHeader",
      align: "center",
      headerAlign: "center",
      flex: 0.8,
    },
  ];

  if (!CustomerList) {
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
    <Grid container spacing={3} justifyContent="center">
      <Grid item xs={12} align="center">
        <Typography variant="h6">Customer List</Typography>
      </Grid>
      <Grid item xs={2}></Grid>
      <Grid item xs={8} mt={1}>
        <Box sx={{ height: "85vh", width: "100%" }}>
          <DataGrid
            // align="center"
            checkboxSelection
            headerHeight={50}
            rowHeight={60}
            rows={CustomerList}
            border
            columns={columns}
            // sx={{ ".datagridHeader": { backgroundColor: "primary.main" } }}
            onRowClick={(event, index) => {
              console.log(event.row.id);
              setModalDisplay("UPDATE_CUSTOMER");
              setModalIsOpen(true);
              setselectedCustomer(event.row.id);
              console.log(event);
            }}
          />
        </Box>
      </Grid>
      <Grid item xs={2} mt={1}>
        <Button
          variant="contained"
          onClick={() => {
            setModalDisplay("ADD_NEW_CUSTOMER");
            setModalIsOpen(true);
          }}>
          Add Customer
        </Button>
      </Grid>

      <Modal
        open={modalIsOpen}
        onClose={() => {
          setModalIsOpen(false);
          getListOfCustomer();
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
          {ModalDispaly === "UPDATE_CUSTOMER" ? (
            <Customer_update_delete CustomerID={selectedCustomer} />
          ) : (
            <AddCustomerForm />
          )}
        </Box>
      </Modal>
    </Grid>
  );
};

export default CustomerList;
