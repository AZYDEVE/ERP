import { Divider, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Form, Formik, Field } from "formik";
import * as yup from "yup";
import TextField from "./formComponent/field";
import SubmitButton from "./formComponent/submitButton";
import DatePicker from "./formComponent/datePicker";
import { useState } from "react";
import { Button } from "@mui/material/";
import { palette } from "@mui/system";
import axios from "axios";
import Router from "next/router";
import moment from "moment";
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

export default function UpdateDeleteCustomerForm({ customerData }) {
  const [isDisable, setDisable] = useState(true);

  const toggleDisable = () => {
    if (isDisable) {
      setDisable(false);
      return;
    }
    setDisable(true);
  };

  const deleteCustomer = async () => {
    const result = await axios.post(
      "http://localhost:3001/customer/deletecustomer",
      {
        ID: customerData.ID,
      }
    );

    Router.reload(window.location.pathname);
  };

  const updateCustomer = async (body) => {
    if (body.Payment_date !== null) {
      body["Payment_date"] = moment(body["Payment_date"]).format("YYYY-MM-DD");
    } else {
      body.Payment_date == null;
    }

    if (body.Sub_Date !== null) {
      body["Sub_Date"] = moment(body["Sub_Date"]).format("YYYY-MM-DD");
    } else {
      body.Sub_Date == null;
    }

    const result = await axios.post(
      "http://localhost:3001/customer/updateCustomer",
      body
    );

    Router.reload(window.location.pathname);
  };

  return (
    <>
      <Formik
        initialValues={{ ...customerData }}
        validationSchema={customerSchema}
        onSubmit={(values) => {
          // same shape as initial values
          updateCustomer(values);
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
                      delete the customer
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
              <Grid item xs={3}>
                <TextField
                  name="Tel"
                  label="Tel"
                  disabled={isDisable}
                  required
                />
              </Grid>
              <Grid item xs={3}>
                <TextField name="Email" label="Email" disabled={isDisable} />
              </Grid>
              <Grid item xs={3}>
                <TextField name="Fax" label="Fax" disabled={isDisable} />
              </Grid>

              <Grid item xs={3}>
                <TextField
                  name="Website"
                  label="Website"
                  disabled={isDisable}
                  required
                />
              </Grid>

              <Grid item xs={3}>
                <TextField
                  name="Area"
                  label="Area"
                  disabled={isDisable}
                  required
                />
              </Grid>

              <Grid item xs={3}>
                <TextField
                  name="Brand"
                  label="Brand"
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

              <Grid item xs={10}>
                <TextField
                  name="Address_2"
                  label="Address-2"
                  disabled={isDisable}
                />
              </Grid>

              <Grid item xs={2}>
                <TextField
                  name="Zip_Code_2"
                  label=" Zip Code-2"
                  disabled={isDisable}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3} marginTop={1}>
              <Grid item xs={3}>
                <CustomSelect
                  name="Tier"
                  label="Tier"
                  options={["", "1", "2", "3"]}
                  disabled={isDisable}
                  required
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  name="Payment_term"
                  label="Payment_term"
                  disabled={isDisable}
                />
              </Grid>
              <Grid item xs={3}>
                <DatePicker
                  name="Payment_date"
                  label="Payment_date"
                  disabled={isDisable}
                />
              </Grid>

              <Grid item xs={3}>
                <TextField
                  name="Tax_number"
                  label="Tax_number"
                  disabled={isDisable}
                />
              </Grid>
            </Grid>
            <Grid container spacing={3} marginTop={1}>
              <Grid item xs={3}>
                <DatePicker
                  name="Sub_Date"
                  label="Sub_Date"
                  disabled={isDisable}
                />
              </Grid>

              <Grid item xs={3}>
                <TextField
                  name="Trade_Term"
                  label=" Trade_Term"
                  disabled={isDisable}
                />
              </Grid>

              <Grid item xs={3}>
                <TextField
                  name="Courier"
                  label="Courier"
                  disabled={isDisable}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  name="Courier_account"
                  label="Courier_account"
                  disabled={isDisable}
                />
              </Grid>
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
