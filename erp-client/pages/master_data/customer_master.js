import React from "react";
// import Table from "@mui/material/Table";
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
  Container,
  Grid,
  Typography,
} from "@mui/material";

import ClickableTableRow from "../../component/tableComponent/tableRow_custom";
import { get_customer_list } from "../../util/api_call/customer_api_call";
import CustomModal from "../../component/modal/custom_modal";
import AddCustomerForm from "../../component/forms/customer_add_form";

const Customer_master = ({ customerList }) => {
  const tableContainer = {
    width: "auto",
    height: "80vh",
    display: "flex",
    justifyContent: `center`,
    overflow: "scroll",
    marginLeft: "12vw",
    border: "2px solid gray",
  };

  const table = {
    backgroundColor: `palette.action.selected`,
  };

  const tableHead = {
    position: "sticky",
    top: "0",
    backgroundColor: "primary.main",
    zindex: `0`,
  };

  const title = {
    display: "flex",
    justifyContent: "center",
  };

  console.log(customerList);

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} sx={title}>
          <Typography variant="h4">Customer Master</Typography>
        </Grid>
        <Grid item xs={1}></Grid>
        <Grid item xs={8}>
          <Container disableGutters sx={tableContainer}>
            <Table aria-label="sticky table" sx={table}>
              <TableHead sx={tableHead}>
                <TableRow>
                  <TableCell>Customer_number</TableCell>
                  <TableCell align="left"> Company_name_ch</TableCell>
                  <TableCell align="left"> Address</TableCell>
                  <TableCell align="left">Tel</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {customerList.map((row, key) => (
                  <ClickableTableRow
                    key={key}
                    data={row}
                    formType="customer_update_delete_form">
                    <TableCell component="th" scope="row">
                      {"ABC0" + row.ID}
                    </TableCell>
                    <TableCell align="left">{row.Company_name_ch}</TableCell>
                    <TableCell align="left">{row.Address}</TableCell>
                    <TableCell align="left">{row.Tel}</TableCell>
                  </ClickableTableRow>
                ))}
              </TableBody>
            </Table>
          </Container>
        </Grid>
        <Grid item xs={2}>
          <CustomModal addButtonText="ADD CUSTOMER">
            <AddCustomerForm />
          </CustomModal>
        </Grid>
      </Grid>
    </>
  );
};

export async function getServerSideProps(context) {
  const result = await get_customer_list();

  if (result.data) {
    return {
      props: {
        customerList: result.data,
      }, // will be passed to the page component as props
    };
  }
}

export default Customer_master;
