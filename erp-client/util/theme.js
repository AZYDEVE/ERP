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
  },
  zIndex: {
    modal: 2,
  },
});

export default Theme;
