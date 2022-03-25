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
import { get_productList } from "../../util/api_call/product_api_call";
import CustomModal from "../../component/modal/custom_modal";
import AddProductForm from "../../component/forms/product_add_form";

const Product_master = ({ productList }) => {
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
          <Typography variant="h4">Product Master</Typography>
        </Grid>
        <Grid item xs={1}></Grid>
        <Grid item xs={8}>
          <Container disableGutters sx={tableContainer}>
            <Table aria-label="sticky table" sx={table}>
              <TableHead sx={tableHead}>
                <TableRow>
                  <TableCell align="left">Part_ID</TableCell>
                  <TableCell align="left">Part_number</TableCell>
                  <TableCell align="left"> Description</TableCell>
                  <TableCell align="left"> Vendor_number</TableCell>
                  <TableCell align="left"> Cost</TableCell>
                  <TableCell align="left">Sale Price</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {productList.map((row, key) => (
                  <ClickableTableRow
                    key={key}
                    data={row}
                    formType="product_update_delete_form">
                    <TableCell component="th" scope="row">
                      {row.ID}
                    </TableCell>
                    <TableCell align="left">{row.PartNumber}</TableCell>
                    <TableCell align="left">{row.Description}</TableCell>
                    <TableCell align="left">{row.VendorNumber}</TableCell>
                    <TableCell align="left">{row.Cost}</TableCell>
                    <TableCell align="left">{row.Price}</TableCell>
                  </ClickableTableRow>
                ))}
              </TableBody>
            </Table>
          </Container>
        </Grid>
        <Grid item xs={2}>
          <CustomModal addButtonText="ADD PRODUCT">
            <AddProductForm />
          </CustomModal>
        </Grid>
      </Grid>
    </>
  );
};

export async function getServerSideProps(context) {
  const result = await get_productList();
  console.log(result);
  if (result.data) {
    return {
      props: {
        productList: result.data,
      }, // will be passed to the page component as props
    };
  }
  console.log(result);
}

export default Product_master;
