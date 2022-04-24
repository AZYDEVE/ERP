import Potemplate from "../component/pdf_template/po_template";
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@mui/material";

const PdfViewer = () => {
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <div>
      <div style={{ display: "none" }}>
        <div ref={componentRef}>
          <Potemplate />
        </div>
      </div>

      <Button variant="contained" onClick={handlePrint}>
        Print this out!
      </Button>
    </div>
  );
};

export default PdfViewer;
