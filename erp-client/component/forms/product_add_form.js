import { Divider, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Form, Formik, Field } from "formik";
import * as yup from "yup";
import TextField from "./formComponent/field";
import SubmitButton from "./formComponent/submitButton";

import Router from "next/router";
import { create_supplier } from "../../util/api_call/supplier_api_call";
import { create_product } from "../../util/api_call/product_api_call";

const customerSchema = yup.object().shape({
  PartNumber: yup.string().required("required!"),
  Description: yup.string().required("required!"),
  VendorNumber: yup.number().required("required!"),
  Cost: yup.number().required("required!"),
  Price: yup.number().required("required!"),
});

let initialValue = {
  PartNumber: "",
  Description: "",
  VendorNumber: "",
  Cost: "",
  Price: "",
  Remark: "",
};

export default function AddProductForm() {
  return (
    <>
      <Formik
        initialValues={{ ...initialValue }}
        validationSchema={customerSchema}
        onSubmit={async (values) => {
          // same shape as initial values

          try {
            const result = await create_product(values);
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
              <Typography justifyContent="center">Add Product</Typography>
            </Grid>
            <Grid item xs={3}>
              <TextField name="PartNumber" label="Part Number" required />
            </Grid>
            <Grid item xs={9}>
              <TextField name="Description" label="Description" />
            </Grid>
            <Grid item xs={3}>
              <TextField name="VendorNumber" label="Vendor code" required />
            </Grid>
            <Grid item xs={3}>
              <TextField name="Cost" label="Cost" />
            </Grid>
            <Grid item xs={3}>
              <TextField name="Price" label="Price" />
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
