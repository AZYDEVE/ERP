import {
  Divider,
  Typography,
  Box,
  Stack,
  Checkbox,
  Select,
  MenuItem,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Form, Formik, Field, FieldArray } from "formik";
import * as yup from "yup";
import TextField from "./formComponent/field";
import SubmitButton from "./formComponent/submitButton";
import DatePicker from "./formComponent/datePicker";
import { useState, useEffect } from "react";
import { Button } from "@mui/material/";

import CustomSelect from "./formComponent/select";
import {
  get_customer,
  update_customerInfo,
  update_customerShipto,
  createShipTO,
} from "../../util/api_call/customer_api_call";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DriveFileRenameOutlineTwoToneIcon from "@mui/icons-material/DriveFileRenameOutlineTwoTone";
import SaveTwoToneIcon from "@mui/icons-material/SaveTwoTone";
import RemoveCircleOutlineTwoToneIcon from "@mui/icons-material/RemoveCircleOutlineTwoTone";
import Swal from "sweetalert2";
import TextFieldWrapper from "./formComponent/field";

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

export default function UpdateDeleteCustomerForm({ CustomerID }) {
  const [customer, setCustomer] = useState("");
  const [isUpdate, setIsUpdate] = useState({
    customerProfile: true,
    DeliveryAddress: [],
  });

  useEffect(async () => {
    await getCustomer();
  }, []);

  const getCustomer = async () => {
    const result = await get_customer({ CustomerID: 10224 });
    try {
      if (result.data) {
        setCustomer(result.data);
        const updateState = [];
        result.data.DeliveryAddress.map((item) => {
          updateState.push(true);
        });
        setIsUpdate({ ...isUpdate, DeliveryAddress: updateState });
      }
    } catch (err) {
      Swal.fire({
        title: `SOMETHING WENT WRONG `,
        text: err,
        icon: "error",
        showConfirmButton: true,
      });
    }
  };

  const updateCustomerProfile = async (customerProfile) => {
    try {
      const result = await update_customerInfo(customerProfile);
      Swal.fire({
        title: ` ${result.data}`,
        showConfirmButton: true,
      });
    } catch (err) {
      Swal.fire({
        title: `SOMETHING WENT WRONG `,
        text: err,
        icon: "error",
        showConfirmButton: true,
      });
    }
  };

  const updateCustomerDeliveryAddress = async (shiptoInfo) => {
    try {
      const result = await update_customerShipto(shiptoInfo);
      Swal.fire({
        title: ` ${result.data}`,
        showConfirmButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          getCustomer();
        }
      });
    } catch (err) {
      Swal.fire({
        title: `SOMETHING WENT WRONG `,
        text: err,
        icon: "error",
        showConfirmButton: true,
      });
    }
  };

  const createNewShipTO = async (shiptoInfo) => {
    try {
      const result = await createShipTO(shiptoInfo);
      Swal.fire({
        title: `${result.data}`,
        showConfirmButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          getCustomer();
        }
      });
    } catch (err) {
      Swal.fire({
        title: `SOMETHING WENT WRONG `,
        text: err,
        icon: "error",
        showConfirmButton: true,
      });
    }
  };

  if (!customer) {
    return (
      <>
        <h1>Loading....</h1>
      </>
    );
  }

  return (
    <>
      <Formik
        initialValues={{ ...customer }}
        validationSchema={customerSchema}
        onSubmit={(values) => {
          // same shape as initial values
          // updateCustomer(values);
        }}>
        {({ values, ...others }) => (
          <Form>
            <Grid container spacing={2} sx={{ padding: 4 }}>
              <Grid
                container
                xs={12}
                justifyContent="center"
                sx={{ marginTop: "10px" }}>
                <Typography justifyContent="center">Update Customer</Typography>
              </Grid>
              <Grid container mt={2}>
                <Grid item xs="auto" sx={{ paddingLeft: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setIsUpdate({
                        ...isUpdate,
                        customerProfile: isUpdate.customerProfile
                          ? false
                          : true,
                      });
                    }}>
                    <DriveFileRenameOutlineTwoToneIcon />
                  </Button>
                </Grid>
                {isUpdate.customerProfile === false ? (
                  <Grid item xs={1} sx={{ paddingLeft: 1 }}>
                    <Button
                      variant="contained"
                      onClick={async () => {
                        const { DeliveryAddress, ...customerInfo } = values;
                        await updateCustomerProfile(customerInfo);
                      }}>
                      <SaveTwoToneIcon />
                    </Button>
                  </Grid>
                ) : (
                  ""
                )}
              </Grid>
              <Grid item xs={5}>
                <TextFieldWrapper
                  name="Company_name_ch"
                  label="Company name"
                  disabled={isUpdate.customerProfile}
                  required
                />
              </Grid>
              <Grid item xs={5}>
                <TextFieldWrapper
                  name="Company_name_en"
                  label="Company Name English"
                  disabled={isUpdate.customerProfile}
                />
              </Grid>

              <Grid item xs={2}>
                <TextFieldWrapper
                  name="Website"
                  label="Website"
                  disabled={isUpdate.customerProfile}
                />
              </Grid>

              <Grid item xs={2}>
                <CustomSelect
                  name="Tier"
                  label="Tier"
                  options={["", "1", "2", "3"]}
                  disabled={isUpdate.customerProfile}
                  required
                />
              </Grid>
              <Grid item xs={2}>
                <TextFieldWrapper
                  name="Trade_Term"
                  label=" Trade_Term"
                  disabled={isUpdate.customerProfile}
                />
              </Grid>

              <Grid item xs={2}>
                <TextFieldWrapper
                  name="Payment_term"
                  label="Payment_term"
                  disabled={isUpdate.customerProfile}
                />
              </Grid>
              <Grid item xs={2}>
                <DatePicker
                  fullWidth
                  name="Payment_Date"
                  label="Payment_date"
                  required
                  disabled={isUpdate.customerProfile}
                />
              </Grid>

              <Grid item xs={2}>
                <DatePicker
                  fullWidth
                  name="Sub_Date"
                  label="Sub_Date"
                  required
                  disabled={isUpdate.customerProfile}
                />
              </Grid>

              <Grid item xs={3}>
                <TextFieldWrapper
                  name="Tax_number"
                  label="Tax_number"
                  disabled={isUpdate.customerProfile}
                />
              </Grid>
              <Grid item xs={3}>
                <TextFieldWrapper
                  name="Courier"
                  label="Courier"
                  disabled={isUpdate.customerProfile}
                />
              </Grid>
              <Grid item xs={4}>
                <TextFieldWrapper
                  name="Courier_account"
                  label="Courier_account"
                  disabled={isUpdate.customerProfile}
                />
              </Grid>
              <Grid item xs={10}>
                <TextFieldWrapper
                  name="Remark"
                  label="Remark"
                  multiline={true}
                  rows={2}
                  disabled={isUpdate.customerProfile}
                />
              </Grid>

              <Grid item xs={12} mt={2} mb={2}>
                <Divider style={{ borderColor: "#000" }}>
                  <Typography sx={{ fontSize: 12 }}>Billing Address</Typography>
                </Divider>
              </Grid>

              <Grid item xs={12}>
                <TextFieldWrapper
                  name="BillingStreet"
                  label="Street Address"
                  disabled={isUpdate.customerProfile}
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <TextFieldWrapper
                  name="BillingCity"
                  label="City"
                  required
                  disabled={isUpdate.customerProfile}
                />
              </Grid>

              <Grid item xs={4}>
                <TextFieldWrapper
                  name="BillingProvinceOrState"
                  label="State or Province"
                  disabled={isUpdate.customerProfile}
                />
              </Grid>
              <Grid item xs={2}>
                <TextFieldWrapper
                  name="BillingCountry"
                  label="Country"
                  required
                  disabled={isUpdate.customerProfile}
                />
              </Grid>
              <Grid item xs={2}>
                <TextFieldWrapper
                  name="BillingZip"
                  label="Zip"
                  disabled={isUpdate.customerProfile}
                />
              </Grid>
              <Grid item xs={2}>
                <TextFieldWrapper
                  required
                  name="BillingContactPerson"
                  label="Contact Person"
                  disabled={isUpdate.customerProfile}
                />
              </Grid>
              <Grid item xs={2}>
                <TextFieldWrapper
                  name="BillingTel"
                  label="Tel"
                  required
                  disabled={isUpdate.customerProfile}
                />
              </Grid>

              <Grid item xs={2}>
                <TextFieldWrapper
                  name="BillingFax"
                  label="Fax"
                  disabled={isUpdate.customerProfile}
                />
              </Grid>
              <Grid item xs={2}>
                <TextFieldWrapper
                  name="BillingEmail"
                  label="Email"
                  disabled={isUpdate.customerProfile}
                />
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
                                    <TextFieldWrapper
                                      disabled={isUpdate.DeliveryAddress[index]}
                                      name={`DeliveryAddress[${index}].Street`}
                                      label="Street Address"
                                      required
                                    />
                                  </Grid>
                                  <Grid item xs={4}>
                                    <TextFieldWrapper
                                      disabled={isUpdate.DeliveryAddress[index]}
                                      name={`DeliveryAddress[${index}].City`}
                                      label="City"
                                    />
                                  </Grid>

                                  <Grid item xs={4}>
                                    <TextFieldWrapper
                                      disabled={isUpdate.DeliveryAddress[index]}
                                      name={`DeliveryAddress[${index}].ProvinceOrState`}
                                      label="State or Province"
                                    />
                                  </Grid>
                                  <Grid item xs={2}>
                                    <TextFieldWrapper
                                      disabled={isUpdate.DeliveryAddress[index]}
                                      name={`DeliveryAddress[${index}].Country`}
                                      label="Country"
                                    />
                                  </Grid>
                                  <Grid item xs={2}>
                                    <TextFieldWrapper
                                      disabled={isUpdate.DeliveryAddress[index]}
                                      name={`DeliveryAddress[${index}].Zip`}
                                      label="Zip"
                                    />
                                  </Grid>
                                  <Grid item xs={2}>
                                    <TextFieldWrapper
                                      required
                                      disabled={isUpdate.DeliveryAddress[index]}
                                      name={`DeliveryAddress[${index}].ContactPerson`}
                                      label="Contact Person"
                                    />
                                  </Grid>
                                  <Grid item xs={2}>
                                    <TextFieldWrapper
                                      disabled={isUpdate.DeliveryAddress[index]}
                                      name={`DeliveryAddress[${index}].Tel`}
                                      label="Tel"
                                      required
                                    />
                                  </Grid>

                                  <Grid item xs={2}>
                                    <TextFieldWrapper
                                      disabled={isUpdate.DeliveryAddress[index]}
                                      name={`DeliveryAddress[${index}].Fax`}
                                      label="Fax"
                                    />
                                  </Grid>
                                  <Grid item xs={2}>
                                    <TextFieldWrapper
                                      disabled={isUpdate.DeliveryAddress[index]}
                                      name={`DeliveryAddress[${index}].Email`}
                                      label="Email"
                                    />
                                  </Grid>
                                  <Grid item xs={2}>
                                    <TextField
                                      disabled={isUpdate.DeliveryAddress[index]}
                                      select={true}
                                      name={`DeliveryAddress[${index}].Active`}
                                      label="Active"
                                      onChange={(evt) => {
                                        others.setFieldValue(
                                          `DeliveryAddress[${index}].Active`,
                                          evt.target.value
                                        );
                                      }}>
                                      <MenuItem value="YES">YES</MenuItem>
                                      <MenuItem value="NO">NO</MenuItem>
                                    </TextField>
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
                                <Stack
                                  justifyContent="center"
                                  alignItems="center"
                                  spacing={1}>
                                  <Button
                                    sx={{ width: 2 }}
                                    variant="contained"
                                    onClick={() => {
                                      const StateObj = { ...isUpdate };
                                      StateObj.DeliveryAddress[index] = StateObj
                                        .DeliveryAddress[index]
                                        ? false
                                        : true;

                                      setIsUpdate(StateObj);
                                    }}>
                                    <DriveFileRenameOutlineTwoToneIcon />
                                  </Button>
                                  {isUpdate.DeliveryAddress[index] === false ? (
                                    <Button
                                      sx={{ width: 2 }}
                                      variant="contained"
                                      onClick={async () => {
                                        const address =
                                          values.DeliveryAddress[index];

                                        if (address.CustomerShipToID) {
                                          await updateCustomerDeliveryAddress(
                                            address
                                          );
                                        } else {
                                          address.CustomerID =
                                            values.CustomerID;
                                          await createNewShipTO(address);
                                        }
                                      }}>
                                      <SaveTwoToneIcon />
                                    </Button>
                                  ) : (
                                    ""
                                  )}

                                  {!others.getFieldMeta(
                                    `DeliveryAddress[${index}]`
                                  ).value.CustomerShipToID ? (
                                    <Button
                                      sx={{ width: 2 }}
                                      variant="contained"
                                      onClick={() => {
                                        arrayHelper.remove(index);
                                      }}>
                                      <RemoveCircleOutlineTwoToneIcon />
                                    </Button>
                                  ) : (
                                    ""
                                  )}
                                </Stack>
                              </Grid>
                            </Grid>
                          </>
                        );
                      })}
                      <Grid item xs={12}>
                        <AddBoxIcon
                          sx={{ fontSize: "5vh", marginLeft: 4 }}
                          onClick={() => {
                            arrayHelper.push({
                              Street: "",
                              City: "",
                              ProvinceOrState: "",
                              Country: "",
                              Zip: "",
                              ContactPerson: "",
                              Tel: "",
                              Fax: "",
                              Email: "",
                              Active: "YES",
                            });

                            isUpdate.DeliveryAddress.push(true);
                          }}
                        />
                      </Grid>
                    </>
                  );
                }}
              />
            </Grid>
          </Form>
        )}
      </Formik>
    </>
  );
}
