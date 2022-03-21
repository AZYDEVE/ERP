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
  Tier: yup.string().required("required!"),
  Brand: yup.string().required("required!"),
  Company_name_ch: yup.string().required("required!"),
  Tel: yup.number().integer("no decimal").required("required!"),
  Address: yup.string().required("required!"),
});

let initialValue = {
  Area: "",
  Tier: "",
  Brand: "",
  Company_name_ch: "",
  Company_name_en: "",
  Tax_number: "",
  Website: "",
  Tel: "",
  Fax: "",
  Zip_Code: "",
  Address: "",
  Zip_code_2: "",
  Address_2: "",
  Payment_term: "",
  Sub_Date: null,
  Payment_date: null,
  Trade_Term: "",
  Courier: "",
  Courier_account: "",
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
              "http://localhost:3001/api/createCustomer",
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
              <TextField name="Website" label="Website" required />
            </Grid>

            <Grid item xs={3}>
              <TextField name="Area" label="Area" required />
            </Grid>

            <Grid item xs={3}>
              <TextField name="Brand" label="Brand" required />
            </Grid>

            <Grid item xs={10}>
              <TextField name="Address" label="Address" required />
            </Grid>
            <Grid item xs={2}>
              <TextField name="Zip_Code" label=" Zip Code" />
            </Grid>

            <Grid item xs={10}>
              <TextField name="Address_2" label="Address-2" />
            </Grid>

            <Grid item xs={2}>
              <TextField name="Zip_Code_2" label=" Zip Code-2" />
            </Grid>
          </Grid>

          <Grid container spacing={3} marginTop={1}>
            <Divider />
            <Grid item xs={3}>
              <CustomSelect
                name="Tier"
                label="Tier"
                options={["", "1", "2", "3"]}
                required
              />
            </Grid>
            <Grid item xs={3}>
              <TextField name="Payment_term" label="Payment_term" />
            </Grid>
            <Grid item xs={3}>
              <DatePicker name="Payment_date" label="Payment_date" />
            </Grid>

            <Grid item xs={3}>
              <TextField name="Tax_number" label="Tax_number" />
            </Grid>
          </Grid>
          <Grid container spacing={3} marginTop={1}>
            <Grid item xs={3}>
              <DatePicker name="Sub_Date" label="Sub_Date" />
            </Grid>

            <Grid item xs={3}>
              <TextField name="Trade_Term" label=" Trade_Term" />
            </Grid>

            <Grid item xs={3}>
              <TextField name="Courier" label="Courier" />
            </Grid>
            <Grid item xs={3}>
              <TextField name=" Courier_account" label="  Courier_account" />
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
