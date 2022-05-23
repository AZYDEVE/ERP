import React, { useState, useEffect } from "react";
import MUIDataTable, { ExpandButton } from "mui-datatables";

import {
  TableCell,
  TableRow,
  Container,
  Table,
  Box,
  Modal,
} from "@mui/material";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { getInventoryList } from "../../util/api_call/inventory_api_call";

import InventoryTransferConversionForm from "../../component/forms/inventory_transfer_conversion";
import { ConstructionOutlined } from "@mui/icons-material";
import { padding } from "@mui/system";

const muiCache = createCache({
  key: "mui-datatables",
  prepend: true,
});

export default function InventoryList() {
  const [data, setData] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(false);

  useEffect(async () => {
    const result = await getInventoryList();

    if (result.data) {
      console.log(result.data);
      setData(result.data);
    }
  }, []);

  const columns = [
    {
      name: "PartNumber",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "onHandQTY",
      options: {
        filter: true,
        sort: true,
      },
    },
  ];

  const options = {
    filter: true,
    filterType: "dropdown",
    responsive: "standard",
    selectableRows: "none",
    expandableRows: true,
    expandableRowsHeader: true,
    expandableRowsOnClick: true,
    isRowExpandable: (dataIndex, expandedRows) => {
      if (expandedRows.length !== 0) {
        return true;
      }
      return false;
    },

    renderExpandableRow: (rowData, rowMeta) => {
      return (
        <>
          <TableRow>
            <TableCell colSpan={3} />
            <TableCell>Location</TableCell>
            <TableCell>BurnOption</TableCell>
            <TableCell>Marked</TableCell>
            <TableCell>CodeVersion</TableCell>
            <TableCell>DateCode</TableCell>
            <TableCell>LotNumber</TableCell>
            <TableCell>QTY</TableCell>
            <TableCell align="center">Conversion & Transfer</TableCell>
          </TableRow>

          {data[rowMeta.dataIndex].QtyByProductStatus.map((item, index) => {
            return (
              <TableRow hover>
                <TableCell colSpan={3} />
                <TableCell>{item.Location}</TableCell>
                <TableCell>{item.BurnOption}</TableCell>
                <TableCell>{item.Marked}</TableCell>
                <TableCell>{item.CodeVersion}</TableCell>
                <TableCell>{item.DateCode}</TableCell>
                <TableCell>{item.LotNumber}</TableCell>
                <TableCell>{item.QTY}</TableCell>
                <TableCell
                  sx={{
                    "&:hover": {
                      cursor: "pointer",
                    },
                  }}
                  align="center"
                  onClick={() => {
                    setModalIsOpen(true);
                    setSelectedItem({ ...item, PartNumber: rowData[0] });
                  }}>
                  <ChangeCircleIcon />
                </TableCell>
              </TableRow>
            );
          })}
        </>
      );
    },
    onRowExpansionChange: (curExpanded, allExpanded, rowsExpanded) =>
      console.log(curExpanded, allExpanded, rowsExpanded),
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: "#B8B8B8",
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          // Name of the slot
          root: {
            // Some CSS
          },
        },
      },

      MUIDataTableHeadCell: {
        styleOverrides: {
          root: {},
        },
      },
    },
  });

  const components = {
    ExpandButton: function (props) {
      return (
        <div style={{ paddingLeft: "20px" }}>
          <ExpandButton {...props} />
        </div>
      );
    },
  };

  return (
    <Container>
      <MUIDataTable
        title={"INVENTORY LIST"}
        data={data}
        columns={columns}
        options={options}
        components={components}
      />
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
          <InventoryTransferConversionForm itemInfo={selectedItem} />
        </Box>
      </Modal>
    </Container>
  );
}
