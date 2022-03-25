import React from "react";

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
import { get_supplierList } from "../../util/api_call/supplier_api_call";
import CustomModal from "../../component/modal/custom_modal";
import AddSupplierForm from "../../component/forms/supplier_add_form";

const Supplier_master = ({ supplierList }) => {
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

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} sx={title}>
          <Typography variant="h4">Supplier Master</Typography>
        </Grid>
        <Grid item xs={1}></Grid>
        <Grid item xs={8}>
          <Container disableGutters sx={tableContainer}>
            <Table aria-label="sticky table" sx={table}>
              <TableHead sx={tableHead}>
                <TableRow>
                  <TableCell>Supplier_number</TableCell>
                  <TableCell align="left"> Company_name_ch</TableCell>
                  <TableCell align="left"> Address</TableCell>
                  <TableCell align="left">Tel</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {supplierList.map((row, key) => (
                  <ClickableTableRow
                    key={key}
                    data={row}
                    formType="supplier_update_delete_form">
                    <TableCell component="th" scope="row">
                      {"AVC0" + row.ID}
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
          <CustomModal addButtonText="ADD SUPPLIER">
            <AddSupplierForm />
          </CustomModal>
        </Grid>
      </Grid>
    </>
  );
};

export async function getServerSideProps(context) {
  const result = await get_supplierList();
  console.log(result);
  if (result.data) {
    return {
      props: {
        supplierList: result.data,
      }, // will be passed to the page component as props
    };
  }
  console.log(result);
}

export default Supplier_master;
