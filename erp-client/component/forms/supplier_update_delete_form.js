import Grid from "@mui/material/Grid";
import { Form, Formik, Field } from "formik";
import * as yup from "yup";
import TextField from "./formComponent/field";
import SubmitButton from "./formComponent/submitButton";

import { useState } from "react";
import { Button } from "@mui/material/";

import Router from "next/router";

import {
  delete_supplier,
  update_supplier,
} from "../../util/api_call/supplier_api_call";

const customerSchema = yup.object().shape({
  Area: yup.string().required("required!"),
  email: yup.string().email("invalid email format"),
  Company_name_ch: yup.string().required("required!"),
  Tel: yup.number().integer("no decimal").required("required!"),
  Address: yup.string().required("required!"),
});

export default function UpdateDeleteSupplierForm({ supplierData }) {
  const [isDisable, setDisable] = useState(true);

  const toggleDisable = () => {
    if (isDisable) {
      setDisable(false);
      return;
    }
    setDisable(true);
  };

  const deleteCustomer = async () => {
    console.log(supplierData);
    const result = await delete_supplier({
      ID: supplierData.ID,
    });

    Router.reload(window.location.pathname);
  };

  const updateSupplier = async (body) => {
    const result = await update_supplier(body);
    console.log(result);
    Router.reload(window.location.pathname);
  };

  return (
    <>
      <Formik
        initialValues={{ ...supplierData }}
        validationSchema={customerSchema}
        onSubmit={(values) => {
          // same shape as initial values
          updateSupplier(values);
        }}>
        {({ initialValues, resetForm }) => (
          <Form>
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
                      onClick={deleteCustomer}>
                      delete the supplier
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
            <Grid container spacing={3} marginTop={1}>
              <Grid item xs={6}>
                <TextField
                  name="Company_name_ch"
                  label="Company name"
                  required
                  disabled={isDisable}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="Company_name_en"
                  label="Company Name English"
                  disabled={isDisable}
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  name="Tel"
                  label="Tel"
                  disabled={isDisable}
                  required
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField name="Email" label="Email" disabled={isDisable} />
              </Grid>
              <Grid item xs={2.4}>
                <TextField name="Fax" label="Fax" disabled={isDisable} />
              </Grid>

              <Grid item xs={2.4}>
                <TextField
                  name="Area"
                  label="Area"
                  disabled={isDisable}
                  required
                />
              </Grid>

              <Grid item xs={2.4}>
                <TextField
                  name="Tax_number"
                  label="Tax_number"
                  disabled={isDisable}
                  required
                />
              </Grid>

              <Grid item xs={10}>
                <TextField
                  name="Address"
                  label="Address"
                  disabled={isDisable}
                  required
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  name="Zip_Code"
                  label=" Zip Code"
                  disabled={isDisable}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3} marginTop={1}>
              <Grid item xs={12}>
                <TextField
                  name="Remark"
                  label="Remark"
                  multiline={true}
                  rows={2}
                  disabled={isDisable}
                />
              </Grid>
              <Grid item xs={12} height="20px">
                {isDisable ? null : <SubmitButton>submit update</SubmitButton>}
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </>
  );
}
