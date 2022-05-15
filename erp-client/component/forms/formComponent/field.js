import React from "react";
import { TextField } from "@mui/material";
import { useField } from "formik";
import { useState, useEffect } from "react";

const TextFieldWrapper = ({ name, ...otherProps }) => {
  const [field, mata] = useField(name);

  const configTextField = {
    ...field,
    ...otherProps,
    fullWidth: true,
    variant: "outlined",
  };

  if (mata && mata.error && mata.touched) {
    configTextField.error = true;
    configTextField.helperText = mata.error;
  }

  return <TextField {...configTextField} InputLabelProps={{ shrink: true }} />;
};
export default TextFieldWrapper;
