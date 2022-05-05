import { createTheme } from "@mui/material/styles";

const Theme = createTheme({
  mode: "light",
  palette: {
    primary: {
      main: "#B8B8B8",
    },
    warning: {
      main: "#C41E3A",
    },
  },
  typography: {
    fontFamily: [
      "Noto Sans JP",
      "sans-serif",
      "Noto Sans TC",
      "PT Sans",
      "Raleway",
    ].join(","),
  },
  components: {
    MuiInputLabel: {
      styleOverrides: {
        outlined: {
          "&.MuiInputLabel-shrink": {
            backgroundColor: "white",
            paddingRight: "10px",
            paddingLeft: "10px",
          },
        },
      },
    },
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
  },
  zIndex: {
    modal: 999,
  },
});

export default Theme;
