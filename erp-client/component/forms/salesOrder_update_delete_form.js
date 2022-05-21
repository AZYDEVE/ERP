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
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { get_productList } from "../../util/api_call/product_api_call";
import TextFieldWrapper from "../../component/forms/formComponent/field";
import DatePicker from "../../component/forms/formComponent/datePicker";
import Selector from "../../component/forms/formComponent/select";
import SubmitButtom from "../../component/forms/formComponent/submitButton";
import { FieldArray, Form, Formik } from "formik";
import * as yup from "yup";
import moment from "moment";
import CustomAutocomplete from "../../component/forms/formComponent/autoComplete";

import Router from "next/router";
import RingLoader from "react-spinners/RingLoader";
import Swal from "sweetalert2";
import {
  get_sales_order_detail,
  delete_sales_order,
  update_sales_order,
} from "../../util/api_call/salesOrder_api_call";

import DeliveryCreation from "./delivery_create_form";

export default function salesorderUpdateDelete({ salesOrderID }) {
  const validationSchema = yup.object().shape({
    Company_name_ch: yup.string().required("required!"),
    CustomerOrderNumber: yup.string().required("required"),
    Incoterms: yup.string().required("required"),
    BillingAddress: yup.string().required("required!"),
    DeliveryAddress: yup.string().required("required!"),
    CustomerID: yup.number().required("required!"),
    Currency: yup.string().required("required!"),
    SalesOrderDate: yup.string().required("required!"),
    orderProduct: yup.array().of(
      yup.object().shape({
        BurnOption: yup.object().shape({
          value: yup.string().required("required"),
        }),
        ETD: yup.date().required("required"),
        QTY: yup
          .number()
          .moreThan(0, "Must be greater than 0")
          .required("required")
          .test(
            "checkIfSmallerThanDeliveryQTY",
            "Cannot be less than Delivery QTY",
            (value, schema) => {
              const d = schema.from[0].value;
              if (value < schema.from[0].value.DeliveryQTY) {
                return false;
              }
              return true;
            }
          ),
        UnitPrice: yup
          .number()
          .min(0, "cannot be negative")
          .required("required"),
        product: yup
          .object()
          .shape({
            PartNumber: yup.string().required("required"),
          })
          .required("required"),
      })
    ),
  });

  const [salesOrderDetail, setSalesOrderDetail] = useState(null);
  const [productList, setProductList] = useState(null);
  const [isSoDeletable, setSoDeletable] = useState(true);
  const [deliveryPage, setDeliveryPage] = useState(false);
  const [spiner, setSpiner] = useState(false);

  let deliveryButtonClicked = false;

  useEffect(async () => {
    const result = await get_productList();
    if (result.data) {
      setProductList(result.data);
    }
  }, []);

  useEffect(async () => {
    const result = await get_sales_order_detail(salesOrderID);

    if (result.data) {
      console.log(result);
      setSalesOrderDetail(result.data);
      checkIfAnyDelivery(result.data.orderProduct);
    }
  }, [deliveryPage]);

  const calculateTotalCost = (values, index) => {
    if (values) {
      return values.QTY * values.UnitPrice;
    }
    return 0;
  };

  const checkIfAnyDelivery = (data) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].DeliveryQTY > 0) {
        setSoDeletable(false);
        return;
      }
    }
  };

  const handleDelete = async () => {
    try {
      const result = await delete_sales_order(salesOrderID);
      setSpiner(false);
      if (result.status >= 200 || result.status <= 299) {
        Swal.fire({
          title: `SUCCESS`,
          text: `SALES ORDER# : ${result.data.message}`,
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
  };

  const checkSoComplete = (so) => {
    let numItemComplete = 0;
    so.orderProduct.map((item, index) => {
      if (item.QTY == item.DeliveryQTY) {
        item.ReceiveStatus = "Completed";
        numItemComplete += 1;
      }
    });

    if (so.orderProduct.length === numItemComplete) {
      so.Status = "completed";
    }
  };

  if (!productList || !salesOrderDetail) {
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
    formikArrayHelperFunction,
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
              <CustomAutocomplete
                required
                name={`orderProduct[${index}].product`}
                titlelabel="Part Number"
                selectionLabel="PartNumber"
                recordValueField={`orderProduct[${index}].product`}
                option={productList}
                disabled={values.DeliveryQTY == 0 ? false : true}
              />
            </Grid>

            <Grid item xs={3}>
              <CustomAutocomplete
                required
                fullWidth
                name={`orderProduct[${index}].BurnOption`}
                titlelabel="Burn Option"
                selectionLabel="value"
                recordValueField={`orderProduct[${index}].BurnOption`}
                option={[
                  { value: "NONE" },
                  { value: "CODED" },
                  { value: "KEYED" },
                  { value: "CODED & KEYED" },
                ]}
                disabled={values.DeliveryQTY == 0 ? false : true}
              />
            </Grid>
            <Grid item xs={2}>
              <DatePicker
                required
                fullWidth
                name={`orderProduct[${index}].ETD`}
                label="Est delivery date"
                disabled={values.DeliveryQTY == 0 ? false : true}
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={1} mt={0.1}>
                <Grid item xs={2}>
                  <TextFieldWrapper
                    required
                    fullWidth
                    type="number"
                    name={`orderProduct[${index}].QTY`}
                    label="Order QTY"
                  />
                </Grid>

                <Grid item xs={2}>
                  <TextFieldWrapper
                    disabled
                    fullWidth
                    type="number"
                    name={`orderProduct[${index}].DeliveryQTY`}
                    label="Delivery QTY"
                  />
                </Grid>

                <Grid item xs={2}>
                  <TextFieldWrapper
                    required
                    fullWidth
                    name={`orderProduct[${index}].UnitPrice`}
                    label="Unit Price"
                    type="number"
                    disabled={values.DeliveryQTY == 0 ? false : true}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    name={`orderProduct[${index}].totalPrice`}
                    label="Total Price"
                    value={calculateTotalCost(values, index)}
                    type="number"
                    inputProps={{ readOnly: true, shrink: true }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} mt={1}>
              <TextFieldWrapper
                fullWidth
                name={`orderProduct[${index}].Remark`}
                label="Remark"
                multiline={true}
                defaultValue=""
                rows={2}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          xs={0.8}
          sx={{
            "& :hover": { color: "red" },
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
          {values.DeliveryQTY == 0 ? (
            <RemoveCircleOutlineIcon
              sx={{ fontSize: "2.1rem", cursor: "pointer" }}
              onClick={() => {
                formikArrayHelperFunction.remove(index);
              }}
            />
          ) : (
            ""
          )}
        </Grid>
      </Grid>
    );
  };

  const updateChanges = async (values) => {
    try {
      const result = await update_sales_order(values);
      setSpiner(false);
      if (result.status >= 200 || result.status <= 299) {
        Swal.fire({
          title: `SUCCESS`,
          text: `SALES ORDER# : ${result.data.data}`,
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
  };

  // *****************************delivery button clicked***********************************************

  if (deliveryPage) {
    return (
      <DeliveryCreation
        salesOrderID={salesOrderID}
        CloseDeliveryPage={setDeliveryPage}
      />
    );
  }

  // **********************************customer form***************************************************
  return (
    <>
      <Formik
        enableReinitialize
        initialValues={{
          ...salesOrderDetail,
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          checkSoComplete(values);

          Swal.fire({
            title: `Save order changes`,
            showCancelButton: true,
            showConfirmButton: true,
          }).then(async (result) => {
            if (result.isConfirmed) {
              await updateChanges(values);
            }
            if (deliveryButtonClicked) {
              setDeliveryPage(true);
            }
          });
        }}>
        {({ values, ...others }) => {
          console.log(others);
          return (
            <Form>
              <Container>
                <Grid container spacing={3}>
                  <Grid item xs={12} align="center">
                    <Typography variant="h6">Sales Order Creation</Typography>
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
                      <TextFieldWrapper
                        fullWidth
                        name="ReferenceNumber"
                        label="Reference Number"
                      />
                    </Grid>

                    <Grid item xs={2}>
                      <DatePicker
                        fullWidth
                        name="SalesOrderDate"
                        label="Order Date"
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <Selector
                        fullWidth
                        required
                        name="Currency"
                        label="Currency"
                        defaultValue=""
                        options={["", "USD", "TWD", "RMB"]}
                      />
                    </Grid>

                    <Grid item xs={2}>
                      <TextFieldWrapper
                        fullWidth
                        required
                        name="Incoterms"
                        label="Incoterms"
                      />
                    </Grid>

                    <Grid item xs={2}>
                      <TextFieldWrapper
                        fullWidth
                        name="Tel"
                        label="Tel"
                        disabled
                      />
                    </Grid>

                    <Grid item xs={2}>
                      <TextFieldWrapper
                        fullWidth
                        name="Fax"
                        label="Fax"
                        disabled
                      />
                    </Grid>

                    <Grid item xs={2}>
                      <TextFieldWrapper
                        fullWidth
                        name="ContactPerson"
                        label="Contact Person"
                        disabled
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextFieldWrapper
                        fullWidth
                        name="Email"
                        label="Email"
                        disabled
                      />
                    </Grid>

                    <Grid item xs={10} sx={{ width: "100%" }}>
                      <TextFieldWrapper
                        fullWidth
                        name="BillingAddress"
                        label="Billing Address"
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextFieldWrapper name="BillingZip" label="Zip Code" />
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
                        rows={2}
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
                              arrayHelper,
                              values
                            );
                          })}
                          <Grid
                            container
                            justifyContent="center"
                            mt={2}
                            spacing={2}>
                            <Grid item>
                              {isSoDeletable ? (
                                <Button
                                  variant="contained"
                                  size="large"
                                  sx={{ color: "red" }}
                                  onClick={handleDelete}>
                                  <DeleteIcon />
                                </Button>
                              ) : (
                                ""
                              )}
                            </Grid>
                            {values.orderProduct.length > 0 ? (
                              <>
                                <Grid item>
                                  <SubmitButtom
                                    variant="contained"
                                    size="large"
                                    sx={{ color: "red" }}>
                                    update
                                  </SubmitButtom>
                                </Grid>

                                <Grid item>
                                  <Button
                                    variant="contained"
                                    size="large"
                                    sx={{ color: "red" }}
                                    onClick={() => {
                                      deliveryButtonClicked = true;
                                      others.handleSubmit();
                                    }}>
                                    create delivery
                                  </Button>
                                </Grid>
                              </>
                            ) : null}
                            <Grid item>
                              <Button
                                primary
                                variant="contained"
                                size="large"
                                sx={{}}
                                onClick={() => {
                                  arrayHelper.push({
                                    SoDetailID: "",
                                    BurnOption: { value: "" },
                                    DeliveryQTY: 0,
                                    DeliveryStatus: "open",
                                    ETD: "",
                                    QTY: "",
                                    UnitPrice: 0,
                                    product: "",
                                    Remark: "",
                                  });
                                }}>
                                Add Item
                              </Button>
                            </Grid>
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
