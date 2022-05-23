import { useEffect, useState } from "react";
import {
  Container,
  Grid,
  TextField,
  Typography,
  Button,
  Box,
  Backdrop,
} from "@mui/material";

import TextFieldWrapper from "./formComponent/field";
import DatePicker from "./formComponent/datePicker";
import SubmitButtom from "./formComponent/submitButton";
import { FieldArray, Form, Formik } from "formik";
import * as yup from "yup";

import Router from "next/router";
import RingLoader from "react-spinners/RingLoader";
import Swal from "sweetalert2";

import {
  update_delivery,
  delete_delivery,
  get_delivery,
  release_delivery,
} from "../../util/api_call/delivery_api_call";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomSelect from "./formComponent/select";

export default function deliveryUpdateDelete({ DeliveryID }) {
  const [DeliveryDetail, setDeliveryDetail] = useState(null);
  const [availbleProductList, setAvailableProductList] = useState(null);
  const [spiner, setSpiner] = useState(false);

  useEffect(async () => {
    const result = await get_delivery(DeliveryID);

    if (result.data) {
      console.log(result.data);
      setDeliveryDetail(result.data);
    }
  }, []);

  const createValidationSchama = () => {
    return yup.object().shape({
      Company_name_ch: yup.string().required("required!"),
      CustomerOrderNumber: yup.string().required("required"),
      DeliveryAddress: yup.string().required("required!"),
      CustomerID: yup.number().required("required!"),
      CreateDate: yup.string().required("required!"),
      ShipDate: yup.string().required("required!"),
      orderProduct: yup.array().of(
        yup.object().shape({
          BurnOption: yup.string().required("required"),
          DeliveryQTY: yup.number().required("required"),
          ProductID: yup.number().required("required"),
        })
      ),
    });
  };

  const handleDelete = async () => {
    try {
      const result = await delete_delivery(DeliveryID);
      setSpiner(false);
      if (result.status >= 200 || result.status <= 299) {
        Swal.fire({
          title: ` ${result.data.data}`,
          showConfirmButton: true,
        }).then((result) => {
          if (result.isConfirmed) {
            Router.reload(window.location.pathname);
          }
        });
      }
    } catch (err) {
      setSpiner(false);
      Swal.fire({
        title: `SOMETHING WENT WRONG `,
        text: err,
        icon: "error",
        showConfirmButton: true,
      });
    }
  };

  const handleRelease = async () => {
    try {
      const result = await release_delivery(DeliveryID);
      setSpiner(false);
      if (result.status >= 200 || result.status <= 299) {
        Swal.fire({
          title: ` ${result.data.data}`,
          showConfirmButton: true,
        }).then((result) => {
          if (result.isConfirmed) {
            Router.reload(window.location.pathname);
          }
        });
      } else {
        Swal.fire({
          text: ` ${result.data.message}`,
          showConfirmButton: true,
        });
      }
    } catch (err) {
      setSpiner(false);
      Swal.fire({
        title: `SOMETHING WENT WRONG `,
        text: err,
        icon: "error",
        showConfirmButton: true,
      });
    }
  };

  if (!DeliveryDetail) {
    return (
      <>
        <h1>Loading</h1>
      </>
    );
  }

  //************************************order detail form***********************************/
  const generateProductList = (
    values,
    index,
    formikFunctions,
    formikValues
  ) => {
    return (
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
              width: "60%",
              height: "auto",
              background: "black",
              borderRadius: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>
            <Typography color="white">{index + 1}</Typography>
          </Box>
        </Grid>
        <Grid item xs={10.7}>
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <TextFieldWrapper
                name={`orderProduct[${index}].PartNumber`}
                label="Part Number"
                disabled
              />
            </Grid>

            <Grid item xs={2}>
              <TextFieldWrapper
                fullWidth
                name={`orderProduct[${index}].BurnOption`}
                label="Burn Option"
                disabled
              />
            </Grid>
            <Grid item xs={3}>
              <TextFieldWrapper
                fullWidth
                name={`orderProduct[${index}].CodeVersion`}
                label="Code Version"
              />
            </Grid>
            <Grid item xs={2}>
              <CustomSelect
                fullWidth
                name={`orderProduct[${index}].Marked`}
                label="Marked"
                options={["No", "Yes"]}
              />
            </Grid>

            <Grid item xs={2}>
              <TextFieldWrapper
                required
                fullWidth
                type="number"
                name={`orderProduct[${index}].DeliveryQTY`}
                label="Delivery QTY"
                disabled
              />
            </Grid>

            <Grid item xs={12} mt={1}>
              <TextFieldWrapper
                fullWidth
                name={`orderProduct[${index}].Remark`}
                label="Remark"
                multiline={true}
                defaultValue=""
                rows={1}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  // **********************************customer form***************************************************
  return (
    <>
      <Formik
        enableReinitialize
        initialValues={{
          ...DeliveryDetail,
        }}
        validationSchema={createValidationSchama()}
        onSubmit={async (values) => {
          // setSpiner(true);
          console.log("submitting");
          try {
            const result = await update_delivery(values);
            setSpiner(false);
            if (result.status >= 200 || result.status <= 299) {
              Swal.fire({
                title: `DELIVERY# : ${result.data.data}`,

                showConfirmButton: true,
              }).then((result) => {
                if (result.isConfirmed) {
                  Router.reload(window.location.pathname);
                }
              });
            }
          } catch (err) {
            setSpiner(false);
            Swal.fire({
              title: `SOMETHING WENT WRONG `,
              text: err,
              icon: "error",
              showConfirmButton: true,
            });
          }
        }}>
        {({ values, ...formikFunctions }) => {
          console.log(values);
          return (
            <Form>
              <Container>
                <Grid container spacing={3}>
                  <Grid item xs={12} align="center">
                    <Typography variant="h6">
                      Delivery # {values.DeliveryID}
                    </Typography>
                  </Grid>

                  <Grid container spacing={1.5} mt={0.5}>
                    <Grid item xs={2}>
                      <TextFieldWrapper
                        disabled
                        fullWidth
                        name="SalesOrderID"
                        label="Sales Order Number"
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextFieldWrapper
                        disabled
                        fullWidth
                        name="Company_name_ch"
                        label="Company name"
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextFieldWrapper
                        disabled
                        fullWidth
                        name="CustomerID"
                        label="Customer ID"
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextFieldWrapper
                        disabled
                        fullWidth
                        required
                        name="CustomerOrderNumber"
                        label="Customer Order #"
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <DatePicker
                        disabled
                        fullWidth
                        name="CreateDate"
                        label="Create Date"
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <DatePicker
                        required
                        fullWidth
                        name="ShipDate"
                        label="Ship Date"
                      />
                    </Grid>

                    <Grid item xs={10} sx={{ width: "100%" }}>
                      <TextFieldWrapper
                        disabled
                        fullWidth
                        name="DeliveryAddress"
                        label="Delivery Address"
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextFieldWrapper
                        disabled
                        name="DeliveryZip"
                        label="Zip Code"
                      />
                    </Grid>

                    <Grid item xs={10}>
                      <TextFieldWrapper
                        fullWidth
                        name="Remark"
                        label="Remark"
                        multiline={true}
                        defaultValue=""
                        rows={1}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextFieldWrapper
                        fullWidth
                        name="Status"
                        label="Status"
                        rows={1}
                        inputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
                  <FieldArray
                    name="orderProduct"
                    render={(arrayHelper) => {
                      return (
                        <>
                          {values.orderProduct.map((value, index) => {
                            return generateProductList(
                              value,
                              index,
                              formikFunctions,
                              values
                            );
                          })}
                          <Grid
                            container
                            justifyContent="center"
                            mt={2}
                            spacing={2}>
                            {values.Status == "block" ? (
                              <Grid item>
                                <Button
                                  variant="contained"
                                  size="large"
                                  sx={{ color: "red" }}
                                  onClick={handleDelete}>
                                  <DeleteIcon />
                                </Button>
                              </Grid>
                            ) : null}
                            <Grid item>
                              <SubmitButtom
                                variant="contained"
                                size="large"
                                sx={{ color: "red" }}>
                                update
                              </SubmitButtom>
                            </Grid>
                            {values.Status == "block" ? (
                              <Grid item>
                                <Button
                                  variant="contained"
                                  size="large"
                                  sx={{ color: "red" }}
                                  onClick={handleRelease}>
                                  Release
                                </Button>
                              </Grid>
                            ) : null}
                          </Grid>
                        </>
                      );
                    }}
                  />
                </Grid>
              </Container>
            </Form>
          );
        }}
      </Formik>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={spiner}>
        <RingLoader loading={spiner} />
      </Backdrop>
    </>
  );
}
