import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TableRow from "@mui/material/TableRow";
import Customer_update_delete_form from "../forms/customer_update_delete_form";
import Supplier_update_delete_form from "../forms/supplier_update_delete_form";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1000,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  overflow: "scroll",
};

const ClickableTableRow = ({ children, data, formType }) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const displayUsedForm = () => {
    switch (formType) {
      case "customer_update_delete_form":
        return <Customer_update_delete_form customerData={data} />;
        break;
      case "supplier_update_delete_form":
        return <Supplier_update_delete_form supplierData={data} />;
        break;
      default:
        return null;
    }
  };

  return (
    <>
      <TableRow hover onClick={handleOpen}>
        {children}
      </TableRow>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={style}>{displayUsedForm()}</Box>
      </Modal>
    </>
  );
};

export default ClickableTableRow;
