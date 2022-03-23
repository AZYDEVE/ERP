import { Divider, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Form, Formik, Field } from "formik";
import * as yup from "yup";
import TextField from "./formComponent/field";
import SubmitButton from "./formComponent/submitButton";
import DatePicker from "./formComponent/datePicker";
import axios from "axios";
import fetching from "../../util/fetchingUtil";
import Router from "next/router";
import CustomSelect from "./formComponent/select";

const customerSchema = yup.object().shape({
  Area: yup.string().required("required!"),
  email: yup.string().email("invalid email format"),
  Company_name_ch: yup.string().required("required!"),
  Tel: yup.number().integer("no decimal").required("required!"),
  Address: yup.string().required("required!"),
});

let initialValue = {
  Area: "",
  Company_name_ch: "",
  Company_name_en: "",
  Website: "",
  Tel: "",
  Fax: "",
  Zip_Code: "",
  Address: "",
  Remark: "",
};

export default function AddCustomerForm() {
  return (
    <>
      <Formik
        initialValues={{ ...initialValue }}
        validationSchema={customerSchema}
        onSubmit={async (values) => {
          // same shape as initial values

          try {
            const result = await fetching.post(
              "http://localhost:3001/customer/createCustomer",
              values
            );
          } catch (err) {
            console.log(err);
          }

          Router.reload(window.location.pathname);
        }}>
        <Form>
          <Grid container spacing={3}>
            <Grid
              container
              xs={12}
              justifyContent="center"
              sx={{ marginTop: "10px" }}>
              <Typography justifyContent="center">Add New Customer</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="Company_name_ch"
                label="Company name"
                required
                defaultValue={initialValue.Company_name_ch}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField name="Company_name_en" label="Company Name English" />
            </Grid>
            <Grid item xs={3}>
              <TextField name="Tel" label="Tel" required />
            </Grid>
            <Grid item xs={3}>
              <TextField name="Email" label="Email" />
            </Grid>
            <Grid item xs={3}>
              <TextField name="Fax" label="Fax" />
            </Grid>

            <Grid item xs={3}>
              <TextField name="Area" label="Area" required />
            </Grid>

            <Grid item xs={10}>
              <TextField name="Address" label="Address" required />
            </Grid>
            <Grid item xs={2}>
              <TextField name="Zip_Code" label=" Zip Code" />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="Remark"
                label="Remark"
                multiline={true}
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <SubmitButton>submit</SubmitButton>
            </Grid>
          </Grid>
        </Form>
      </Formik>
    </>
  );
}
