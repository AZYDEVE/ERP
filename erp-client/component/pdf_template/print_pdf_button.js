import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button, Typography } from "@mui/material";

const PrintPDFButton = ({ children }) => {
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <div>
      <div style={{ display: "none" }}>
        <div ref={componentRef}>{children}</div>
      </div>
      <Button variant="contained" onClick={handlePrint}>
        <Typography> Print PDF!</Typography>
      </Button>
    </div>
  );
};

export default PrintPDFButton;
