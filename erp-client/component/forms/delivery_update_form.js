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

import TextFieldWrapper from "../../component/forms/formComponent/field";
import DatePicker from "../../component/forms/formComponent/datePicker";
import SubmitButtom from "../../component/forms/formComponent/submitButton";
import { FieldArray, Form, Formik } from "formik";
import * as yup from "yup";

import Router from "next/router";
import RingLoader from "react-spinners/RingLoader";
import Swal from "sweetalert2";
import { get_delivery } from "../../util/api_call/salesOrder_api_call";

import {
  CREATE_DELIVERY,
  get_Sales_OrderDetail_For_CreateDelivery,
} from "../../util/api_call/delivery_api_call";

export default function deliveryCreation({ salesOrderID, CloseDeliveryPage }) {
  const [DeliveryDetail, setDeliveryDetail] = useState(null);
  const [availbleProductList, setAvailableProductList] = useState(null);
  const [spiner, setSpiner] = useState(false);

  useEffect(async () => {
    const result = await get_delivery(salesOrderID);

    if (result.data) {
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
          BurnOption: yup.object().shape({
            value: yup.string().required("required"),
          }),
          DeliveryQTY: yup
            .number()
            .typeError("must enter a number")
            .test(
              "validate delivery QTY",
              "Cannot be more than Open QTY and Available QTY",
              (value, schema) => {
                console.log(schema);
                const openQTY = schema.from[0].value.OpenQTY;
                const availableQTY =
                  schema.from[1].value.availableStock[
                    schema.from[0].value.product.ProductID
                  ].AvailableQTY;

                if (value > openQTY) {
                  return schema.createError({
                    message: "Cannot be more than Open QTY ",
                  });
                }

                if (availableQTY < 0) {
                  return schema.createError({
                    message: "Cannot deliver more than availableQTY",
                  });
                }

                return true;
              }
            ),
          product: yup
            .object()
            .shape({
              PartNumber: yup.string().required("required"),
            })
            .required("required"),
        })
      ),
    });
  };

  const handleDeliveryQTY = (value, formikValues, formikFunctions) => {};

  if (!availbleProductList || !salesOrderDetail) {
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
                name={`orderProduct[${index}].product.PartNumber`}
                label="Part Number"
                inputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={3}>
              <TextFieldWrapper
                fullWidth
                name={`orderProduct[${index}].BurnOption.value`}
                label="Burn Option"
                inputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={2}>
              <TextFieldWrapper
                fullWidth
                type="number"
                name={`availableStock[${values.product.ProductID}].AvailableQTY`}
                label="Available QTY"
                inputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={2}>
              <TextFieldWrapper
                fullWidth
                type="number"
                name={`orderProduct[${index}].OpenQTY`}
                label="Open QTY"
                inputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={2}>
              <TextFieldWrapper
                disabled={
                  formikValues.availableStock[values.product.ProductID]
                    .AvailableQTY == 0 && values.DeliveryQTY == 0
                    ? true
                    : false
                }
                required
                fullWidth
                type="number"
                name={`orderProduct[${index}].DeliveryQTY`}
                label="Delivery QTY"
                onKeyUp={(event) => {
                  console.log(event.target.valueAsNumber);
                  if (event.target.value < 0) {
                    event.target.value = 0;
                  }
                  formikFunctions.setFieldValue(
                    `orderProduct[${index}].DeliveryQTY`,
                    event.target.valueAsNumber
                  );
                  const SameProduct = formikValues.orderProduct.filter(
                    (obj) => obj.product.ProductID === values.product.ProductID
                  );

                  const sum = SameProduct.reduce((pre, cur) => {
                    return pre + (isNaN(cur.DeliveryQTY) ? 0 : cur.DeliveryQTY);
                  }, 0);

                  const availableQTY =
                    formikFunctions.initialValues.availableStock[
                      values.product.ProductID
                    ].AvailableQTY - sum;

                  formikFunctions.setFieldValue(
                    `availableStock[${values.product.ProductID}].AvailableQTY`,
                    availableQTY
                  );
                }}
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
          ...salesOrderDetail,
          availableStock: availbleProductList,
        }}
        validationSchema={createValidationSchama()}
        onSubmit={async (values) => {
          // setSpiner(true);

          const submitValues = { ...values };

          submitValues.orderProduct = values.orderProduct.filter(
            (item) => item.DeliveryQTY > 0
          );

          if (submitValues.orderProduct.length === 0) {
            Swal.fire({
              title: `Nothing In Delivery`,
              showConfirmButton: true,
            });
          } else {
            console.log("hello");
            try {
              const result = await CREATE_DELIVERY(submitValues);
              setSpiner(false);
              if (result.status >= 200 || result.status <= 299) {
                Swal.fire({
                  title: `SUCCESS`,
                  text: `DELIVERY# : ${result.data.data}`,
                  icon: "success",
                  showConfirmButton: true,
                }).then((result) => {
                  if (result.isConfirmed) {
                    // Router.reload(window.location.pathname);
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
          }
        }}>
        {({ values, ...formikFunctions }) => {
          console.log(values);
          return (
            <Form>
              <Container>
                <Grid container spacing={3}>
                  <Grid item xs={12} align="center">
                    <Typography variant="h6">Delivery </Typography>
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
                        fullWidth
                        required
                        name="CustomerOrderNumber"
                        label="Customer Order #"
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <DatePicker
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
                        fullWidth
                        name="DeliveryAddress"
                        label="Delivery Address"
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextFieldWrapper name="DeliveryZip" label="Zip Code" />
                    </Grid>

                    <Grid item xs={12}>
                      <TextFieldWrapper
                        fullWidth
                        name="Remark"
                        label="Remark"
                        multiline={true}
                        defaultValue=""
                        rows={1}
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
                            {values.orderProduct.length > 0 ? (
                              <>
                                <Grid item>
                                  <SubmitButtom
                                    variant="contained"
                                    size="large"
                                    sx={{ color: "red" }}>
                                    Create delivery
                                  </SubmitButtom>
                                </Grid>
                                <Grid item>
                                  <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => {
                                      CloseDeliveryPage(false);
                                    }}>
                                    close
                                  </Button>
                                </Grid>
                              </>
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
