import { useFormikContext, useField } from "formik";
import { Autocomplete, TextField } from "@mui/material";

const CustomAutocomplete = ({
  name,
  titlelabel,
  selectionLabel,
  recordValueField,
  option,
  optionalSetValueforOtherfields,
  ...otherProps
}) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();

  //setFieldValue is a function for setting the values to the //formik submition object,
  // the "recordValuefield" indicate which option attibute should update the submition object
  const hangleChange = (event, value) => {
    if (value) {
      setFieldValue(recordValueField, value);
    } else {
      setFieldValue(recordValueField, "");
    }

    if (optionalSetValueforOtherfields) {
      setFieldValue(
        optionalSetValueforOtherfields.name,
        value ? value[optionalSetValueforOtherfields.field] : ""
      );
    }
  };

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

  console.log(field.value);
  return (
    <Autocomplete
      {...configSelect}
      value={field.value ? field.value : null}
      // inputValue={field.value ? field.value[selectionLable] : ""}
      isOptionEqualToValue={(option, value) => {
        // console.log("option====>", option, "value====>", value);
        return option.id === value.id;
      }}
      disablePortal
      options={option} // Option is for injecting the object data to the selection field
      getOptionLabel={(option) => option[selectionLabel]} // getOptionLabel indicates which attribute in the object should be used to display the selections
      renderInput={(params) => {
        return <TextField {...params} label={titlelabel} />; // render the inputlabel props, the titlelable is passed in from outside
      }}
    />
  );
};

export default CustomAutocomplete;
