import React, { useState, useEffect } from "react";
import MUIDataTable, { ExpandButton } from "mui-datatables";

import { TableCell, TableRow, Container, Table, Box, Tab } from "@mui/material";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { getInventoryList } from "../../util/api_call/inventory_api_call";
import { ConstructionOutlined } from "@mui/icons-material";
import { padding } from "@mui/system";

const muiCache = createCache({
  key: "mui-datatables",
  prepend: true,
});

export default function InventoryList() {
  const [data, setData] = useState([]);

  useEffect(async () => {
    const result = await getInventoryList();

    if (result.data) {
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
    selectableRows: false,
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
            <TableCell>codeVersion</TableCell>
            <TableCell>QTY</TableCell>
            <TableCell align="center">Conversion & Transfer</TableCell>
          </TableRow>

          {data[rowMeta.dataIndex].QtyByProductStatus.map((item, index) => {
            console.log(item.Location);
            return (
              <TableRow hover>
                <TableCell colSpan={3} />
                <TableCell>{item.Location}</TableCell>
                <TableCell>{item.BurnOption}</TableCell>
                <TableCell>{item.CodeVersion}</TableCell>
                <TableCell>{item.QTY}</TableCell>
                <TableCell
                  sx={{
                    "&:hover": {
                      cursor: "pointer",
                    },
                  }}
                  align="center">
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
    components: {
      MUIDataTable: {
        styleOverrides: {
          paper: {
            boxShadow: "none",
            border: "1px solid lightgray",
            borderRadius: "7px",
          },
        },
      },
      MUIDataTableBodyCell: {
        styleOverrides: {
          root: {
            fontWeight: 500,
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
      if (props.dataIndex === 3 || props.dataIndex === 4)
        return <div style={{ width: "24px" }} />;
      return (
        <div style={{ paddingLeft: "20px" }}>
          <ExpandButton {...props} />
        </div>
      );
    },
  };

  return (
    <Container>
      <CacheProvider value={muiCache}>
        <ThemeProvider theme={theme}>
          <MUIDataTable
            title={"INVENTORY LIST"}
            data={data}
            columns={columns}
            options={options}
            components={components}
          />
        </ThemeProvider>
      </CacheProvider>
    </Container>
  );
}
