import { Divider, Typography, Box, Stack, MenuItem } from "@mui/material";
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
});

const shipToSchema = yup.object().shape({
  Street: yup.string().required("required"),
  City: yup.string().required("required"),
  Country: yup.string().required("required"),
  ContactPerson: yup.string().required("required"),
  Tel: yup.string().required("required"),
});

export default function UpdateDeleteCustomerForm({ CustomerID }) {
  const [customer, setCustomer] = useState("");
  const [DeliveryAddress, setDeliveryAddress] = useState("");
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
        const { DeliveryAddress, ...customerProfile } = result.data;
        setCustomer(customerProfile);
        setDeliveryAddress(DeliveryAddress);
        const updateState = [];
        result.data.DeliveryAddress.map((item) => {
          updateState.push(true);
        });
        setIsUpdate({ customerProfile: true, DeliveryAddress: updateState });
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

  const initialObjCustomerProfileForm = () => {
    const { DeliveryAddress, ...customerProfile } = customer;

    return customerProfile;
  };

  if (!customer || !DeliveryAddress) {
    return (
      <>
        <h1>Loading....</h1>
      </>
    );
  }

  return (
    <>
      <Formik
        enableReinitialize
        initialValues={initialObjCustomerProfileForm()}
        validationSchema={customerSchema}
        onSubmit={(values) => {}}>
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
                        setIsUpdate({ ...isUpdate, customerProfile: true });
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
            </Grid>
          </Form>
        )}
      </Formik>

      {DeliveryAddress.map((item, index) => {
        return (
          <>
            <Formik
              enableReinitialize
              initialValues={item}
              validationSchema={shipToSchema}
              onSubmit={(values) => {}}>
              {({ values, ...formikfunctions }) => (
                <Form>
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
                        <Typography color="white" sx={{ fontSize: "2vh" }}>
                          {index + 1}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={10.5}>
                      <Grid container spacing={2}>
                        <Grid item xs={2}>
                          <TextFieldWrapper
                            disabled
                            name="CustomerShipToID"
                            label="Ship-to ID"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextFieldWrapper
                            disabled={isUpdate.DeliveryAddress[index]}
                            name="Street"
                            label="Street Address"
                            required
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextFieldWrapper
                            disabled={isUpdate.DeliveryAddress[index]}
                            name="City"
                            label="City"
                          />
                        </Grid>

                        <Grid item xs={4}>
                          <TextFieldWrapper
                            disabled={isUpdate.DeliveryAddress[index]}
                            name="ProvinceOrState"
                            label="State or Province"
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <TextFieldWrapper
                            disabled={isUpdate.DeliveryAddress[index]}
                            name="Country"
                            label="Country"
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <TextFieldWrapper
                            disabled={isUpdate.DeliveryAddress[index]}
                            name="Zip"
                            label="Zip"
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <TextFieldWrapper
                            required
                            disabled={isUpdate.DeliveryAddress[index]}
                            name="ContactPerson"
                            label="Contact Person"
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <TextFieldWrapper
                            disabled={isUpdate.DeliveryAddress[index]}
                            name="Tel"
                            label="Tel"
                            required
                          />
                        </Grid>

                        <Grid item xs={2}>
                          <TextFieldWrapper
                            disabled={isUpdate.DeliveryAddress[index]}
                            name="Fax"
                            label="Fax"
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <TextFieldWrapper
                            disabled={isUpdate.DeliveryAddress[index]}
                            name="Email"
                            label="Email"
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <TextField
                            disabled={isUpdate.DeliveryAddress[index]}
                            select={true}
                            name="Active"
                            label="Active"
                            onChange={(evt) => {
                              formikfunctions.setFieldValue(
                                `Active`,
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
                              if (values.CustomerShipToID) {
                                await updateCustomerDeliveryAddress(values);
                              } else {
                                await createNewShipTO(values);
                              }
                            }}>
                            <SaveTwoToneIcon />
                          </Button>
                        ) : (
                          ""
                        )}

                        {!formikfunctions.getFieldMeta(`CustomerShipToID`)
                          .value ? (
                          <Button
                            sx={{ width: 2 }}
                            variant="contained"
                            onClick={() => {
                              const updatedDeliveryAddress = [
                                ...DeliveryAddress,
                              ];
                              updatedDeliveryAddress.splice(index, 1);
                              setDeliveryAddress(updatedDeliveryAddress);
                              isUpdate.DeliveryAddress.splice(index, 1);
                            }}>
                            <RemoveCircleOutlineTwoToneIcon />
                          </Button>
                        ) : (
                          ""
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </>
        );
      })}
      <Grid item xs={12}>
        <AddBoxIcon
          sx={{ fontSize: "5vh", marginLeft: 4 }}
          onClick={() => {
            const updatedDeliveryAddress = [...DeliveryAddress];
            updatedDeliveryAddress.push({
              Street: "",
              CustomerID: customer.CustomerID,
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
            setDeliveryAddress(updatedDeliveryAddress);

            isUpdate.DeliveryAddress.push(true);
          }}
        />
      </Grid>
    </>
  );
}
