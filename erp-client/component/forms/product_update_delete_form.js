import Grid from "@mui/material/Grid";
import { Form, Formik, Field } from "formik";
import * as yup from "yup";
import TextField from "./formComponent/field";
import SubmitButton from "./formComponent/submitButton";

import { useState } from "react";
import { Button } from "@mui/material/";

import Router from "next/router";

import {
  delete_product,
  update_product,
} from "../../util/api_call/product_api_call";

const customerSchema = yup.object().shape({
  PartNumber: yup.string().required("required!"),
  Description: yup.string().required("required!"),
  VendorNumber: yup.number().required("required!"),
  Cost: yup.number().required("required!"),
  Price: yup.number().required("required!"),
});

export default function UpdateDeleteProductForm({ productData }) {
  const [isDisable, setDisable] = useState(true);

  const toggleDisable = () => {
    if (isDisable) {
      setDisable(false);
      return;
    }
    setDisable(true);
  };

  const deleteProduct = async () => {
    const result = await delete_product({
      ID: productData.ID,
    });

    Router.reload(window.location.pathname);
  };

  const updateProduct = async (body) => {
    const result = await update_product(body);
    console.log(result);
    Router.reload(window.location.pathname);
  };

  return (
    <>
      <Formik
        initialValues={{ ...productData }}
        validationSchema={customerSchema}
        onSubmit={(values) => {
          // same shape as initial values
          console.log(values);
          updateProduct(values);
        }}>
        {({ initialValues, resetForm }) => (
          <Form>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Grid container justifyContent="start" spacing={1}>
                  <Grid item xs={1.25}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={toggleDisable}>
                      {isDisable ? "Update" : "Cancel"}
                    </Button>
                  </Grid>
                  {isDisable ? null : (
                    <>
                      <Grid item xs={1.1}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={resetForm}>
                          RESET
                        </Button>
                      </Grid>
                      <Grid item xs={3}>
                        {" "}
                        <Button
                          variant="contained"
                          color={"warning"}
                          onClick={deleteProduct}>
                          delete the supplier
                        </Button>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Grid>

              <Grid item xs={3}>
                <TextField
                  name="PartNumber"
                  label="Part Number"
                  required
                  disabled={isDisable}
                />
              </Grid>
              <Grid item xs={9}>
                <TextField
                  name="Description"
                  label="Description"
                  required
                  disabled={isDisable}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  name="VendorNumber"
                  label="Vendor code"
                  required
                  disabled={isDisable}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  name="Cost"
                  label="Cost"
                  required
                  disabled={isDisable}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  name="Price"
                  label="Price"
                  required
                  disabled={isDisable}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="Remark"
                  label="Remark"
                  multiline={true}
                  rows={4}
                  disabled={isDisable}
                />
              </Grid>

              <Grid item xs={12} height="40px">
                {isDisable ? null : <SubmitButton>submit update</SubmitButton>}
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </>
  );
}
