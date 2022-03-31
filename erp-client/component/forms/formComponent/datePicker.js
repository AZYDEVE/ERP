import { useField } from "formik";
import { TextField } from "@mui/material";
import moment from "moment";

const DatePicker = ({ name, ...otherProps }) => {
  const [field, meta] = useField(name);

  const dateValue = () => {
    if (field.value) {
      return moment(field.value).format("YYYY-MM-DD") + "";
    }
    return "";
  };

  const configureDatePicker = {
    ...field,
    ...otherProps,
    type: "date",
    variant: "outlined",
    value: dateValue(),
    InputLabelProps: {
      shrink: true,
    },
  };

  if (meta && meta.error && meta.touched) {
    configureDatePicker.error = true;
    configureDatePicker.helperText = meta.error;
  }

  return <TextField {...configureDatePicker} />;
};
export default DatePicker;
