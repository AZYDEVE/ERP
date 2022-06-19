import { Divider, Typography, Box, Grid } from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { Form, Formik, Field, FieldArray } from "formik";
import * as yup from "yup";
import TextField from "./formComponent/field";
import SubmitButton from "./formComponent/submitButton";
import DatePicker from "./formComponent/datePicker";

import { create_customer } from "../../util/api_call/customer_api_call";
import Router from "next/router";
import CustomSelect from "./formComponent/select";

const customerSchema = yup.object().shape({
  Tier: yup.string().required("required"),
  Company_name_ch: yup.string().required("required"),
  BillingStreet: yup.string().required("required"),
  BillingCity: yup.string().required("required"),
  BillingCountry: yup.string().required("required"),
  BillingContactPerson: yup.string().required("required"),
  BillingTel: yup.string().required("required"),
  Payment_Date: yup.string().required("required"),
  Sub_Date: yup.string().required("required"),
  DeliveryAddress: yup.array().of(
    yup.object().shape({
      Street: yup.string().required("required"),
      City: yup.string().required("required"),
      Country: yup.string().required("required"),
      ContactPerson: yup.string().required("required"),
      Tel: yup.string().required("required"),
    })
  ),
});

let initialValue = {
  Tier: "",
  Company_name_ch: "",
  Company_name_en: "",
  Tax_number: "",
  Website: "",
  BillingStreet: "",
  BillingCity: "",
  BillingProvinceOrState: "",
  BillingCountry: "",
  BillingZip: "",
  BillingContactPerson: "",
  BillingTel: "",
  BillingFax: "",
  BillingEmail: "",
  Payment_term: "",
  Sub_Date: "",
  Payment_Date: "",
  Trade_Term: "",
  Courier: "",
  Courier_account: "",
  Remark: "",
  DeliveryAddress: [],
};

export default function AddCustomerForm() {
  return (
    <>
      <Formik
        initialValues={{ ...initialValue }}
        validationSchema={customerSchema}
        onSubmit={async (values) => {
          // same shape as initial values
          console.log(values);

          try {
            const result = await create_customer(values);
          } catch (err) {
            console.log(err);
          }

          // Router.reload(window.location.pathname);
        }}>
        {({ values, ...others }) => {
          console.log(values);
          return (
            <Form>
              <Grid container spacing={2} sx={{ padding: 4 }}>
                <Grid
                  container
                  xs={12}
                  justifyContent="center"
                  sx={{ marginTop: "10px" }}>
                  <Typography justifyContent="center">
                    Add New Customer
                  </Typography>
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    name="Company_name_ch"
                    label="Company name"
                    required
                    defaultValue={initialValue.Company_name_ch}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    name="Company_name_en"
                    label="Company Name English"
                  />
                </Grid>

                <Grid item xs={2}>
                  <TextField name="Website" label="Website" />
                </Grid>

                <Grid item xs={2}>
                  <CustomSelect
                    name="Tier"
                    label="Tier"
                    options={["", "1", "2", "3"]}
                    required
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField name="Trade_Term" label=" Trade_Term" />
                </Grid>

                <Grid item xs={2}>
                  <TextField name="Payment_term" label="Payment_term" />
                </Grid>
                <Grid item xs={2}>
                  <DatePicker
                    fullWidth
                    name="Payment_Date"
                    label="Payment_date"
                    required
                  />
                </Grid>

                <Grid item xs={2}>
                  <DatePicker
                    fullWidth
                    name="Sub_Date"
                    label="Sub_Date"
                    required
                  />
                </Grid>

                <Grid item xs={3}>
                  <TextField name="Tax_number" label="Tax_number" />
                </Grid>
                <Grid item xs={3}>
                  <TextField name="Courier" label="Courier" />
                </Grid>
                <Grid item xs={4}>
                  <TextField name="Courier_account" label="Courier_account" />
                </Grid>
                <Grid item xs={10}>
                  <TextField
                    name="Remark"
                    label="Remark"
                    multiline={true}
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12} mt={2} mb={2}>
                  <Divider style={{ borderColor: "#000" }}>
                    <Typography sx={{ fontSize: 12 }}>
                      Billing Address
                    </Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12}>
                  <TextField name="FullAddress" label="FullAddress" required />
                </Grid>

                <Grid item xs={12}>
                  <TextField name="BillingStreet" label="Street" required />
                </Grid>
                <Grid item xs={4}>
                  <TextField name="BillingCity" label="City" required />
                </Grid>

                <Grid item xs={4}>
                  <TextField
                    name="BillingProvinceOrState"
                    label="State or Province"
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField name="BillingCountry" label="Country" required />
                </Grid>
                <Grid item xs={2}>
                  <TextField name="BillingZip" label="Zip" />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    required
                    name="BillingContactPerson"
                    label="Contact Person"
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField name="BillingTel" label="Tel" required />
                </Grid>

                <Grid item xs={2}>
                  <TextField name="BillingFax" label="Fax" />
                </Grid>
                <Grid item xs={2}>
                  <TextField name="BillingEmail" label="Email" />
                </Grid>

                <Grid item xs={12} mt={2} mb={2}>
                  <Divider style={{ borderColor: "#000" }}>
                    <Typography sx={{ fontSize: 12 }}>
                      Delivery Addresses
                    </Typography>
                  </Divider>
                </Grid>

                <FieldArray
                  name="DeliveryAddress"
                  render={(arrayHelper) => {
                    return (
                      <>
                        {values.DeliveryAddress.map((item, index) => {
                          return (
                            <>
                              <Grid
                                container
                                spacing={1}
                                mt={2}
                                sx={{
                                  border: 1,
                                  borderColor: "primary.main",
                                  borderRadius: 4,
                                  paddingBottom: 2,
                                  paddingTop: 1,
                                  transform: "scale(0.93)",
                                }}>
                                <Grid
                                  item
                                  xs={0.5}
                                  sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}>
                                  <Box
                                    sx={{
                                      width: "3vh",
                                      height: "3vh",
                                      background: "black",
                                      borderRadius: "50%",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}>
                                    <Typography
                                      color="white"
                                      sx={{ fontSize: "2vh" }}>
                                      {index + 1}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={10.5}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                      <TextField
                                        name="FullAddress"
                                        label="FullAddress"
                                        required
                                      />
                                    </Grid>
                                    <Grid item xs={12}>
                                      <TextField
                                        name={`DeliveryAddress[${index}].Street`}
                                        label="Street"
                                        required
                                      />
                                    </Grid>
                                    <Grid item xs={4}>
                                      <TextField
                                        name={`DeliveryAddress[${index}].City`}
                                        label="City"
                                      />
                                    </Grid>

                                    <Grid item xs={4}>
                                      <TextField
                                        name={`DeliveryAddress[${index}].ProvinceOrState`}
                                        label="State or Province"
                                      />
                                    </Grid>
                                    <Grid item xs={2}>
                                      <TextField
                                        name={`DeliveryAddress[${index}].Country`}
                                        label="Country"
                                      />
                                    </Grid>
                                    <Grid item xs={2}>
                                      <TextField
                                        name={`DeliveryAddress[${index}].Zip`}
                                        label="Zip"
                                      />
                                    </Grid>
                                    <Grid item xs={2}>
                                      <TextField
                                        required
                                        name={`DeliveryAddress[${index}].ContactPerson`}
                                        label="Contact Person"
                                      />
                                    </Grid>
                                    <Grid item xs={2}>
                                      <TextField
                                        name={`DeliveryAddress[${index}].Tel`}
                                        label="Tel"
                                        required
                                      />
                                    </Grid>

                                    <Grid item xs={2}>
                                      <TextField
                                        name={`DeliveryAddress[${index}].Fax`}
                                        label="Fax"
                                      />
                                    </Grid>
                                    <Grid item xs={2}>
                                      <TextField
                                        name={`DeliveryAddress[${index}].Email`}
                                        label="Email"
                                      />
                                    </Grid>
                                  </Grid>
                                </Grid>
                                <Grid
                                  item
                                  xs={1}
                                  alignSelf="center"
                                  align="center"
                                  sx={{
                                    cursor: "pointer",
                                    "& :hover": { color: "red" },
                                  }}>
                                  <RemoveCircleOutlineIcon
                                    sx={{ fontSize: "4vh " }}
                                    onClick={() => {
                                      arrayHelper.remove(index);
                                    }}
                                  />
                                </Grid>
                              </Grid>
                            </>
                          );
                        })}
                        <Grid item xs={12}>
                          <AddBoxIcon
                            sx={{ fontSize: "5vh", marginLeft: 2 }}
                            onClick={() => {
                              arrayHelper.push({
                                FullAddress: "",
                                Street: "",
                                City: "",
                                ProvinceOrState: "",
                                Country: "",
                                Zip: "",
                                ContactPerson: "",
                                Tel: "",
                                Fax: "",
                                Email: "",
                              });
                            }}
                          />
                        </Grid>
                      </>
                    );
                  }}
                />

                <Grid item xs={12}>
                  <SubmitButton>submit</SubmitButton>
                </Grid>
              </Grid>
            </Form>
          );
        }}
      </Formik>
    </>
  );
}
