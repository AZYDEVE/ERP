import React from "react";
import fetching from "../../util/fetchingUtil";

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
import ModalAddsupplier from "../../component/modal/supplier_add_modal";
import ClickableTableRow from "../../component/tableComponent/tableRow_custom";

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
                  <ClickableTableRow key={key} customerData={row}>
                    <TableCell component="th" scope="row">
                      {"AVC0" + row.id}
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
          <ModalAddsupplier justifyContent="left" />
        </Grid>
      </Grid>
    </>
  );
};

export async function getServerSideProps(context) {
  const supplierList = await fetching.get(
    "http://localhost:3001/supplier/supplierList"
  );

  return {
    props: {
      supplierList: supplierList.data,
    }, // will be passed to the page component as props
  };
}

export default Supplier_master;
