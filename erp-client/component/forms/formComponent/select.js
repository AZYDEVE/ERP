import { TextField, MenuItem } from "@mui/material";
import { useFormikContext, useField } from "formik";

const CustomSelect = ({ name, options, ...otherProps }) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();

  const hangleChange = (event) => {
    setFieldValue(name, event.target.value);
  };

  console.log(field);

  const configSelect = {
    ...field,

    ...otherProps,
    select: true,
    varient: "outlined",
    fullWidth: true,
    onChange: hangleChange,
  };

  if (meta && meta.error && meta.touched) {
    (configSelect.error = true), (configSelect.helperText = meta.error);
  }

  return (
    <TextField {...configSelect} InputLabelProps={{ shrink: true }}>
      {options.map((value, pos) => {
        return (
          <MenuItem value={value} key={pos}>
            {value}
          </MenuItem>
        );
      })}
    </TextField>
  );
};

export default CustomSelect;
