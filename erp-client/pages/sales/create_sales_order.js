import { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Collapse,
  TextField,
  Autocomplete,
  Typography,
  Button,
  Box,
  Backdrop,
} from "@mui/material";

import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { get_productList } from "../../util/api_call/product_api_call";
import { get_customer_list } from "../../util/api_call/customer_api_call";
import { Transition } from "react-transition-group";
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
import { create_salesOrder } from "../../util/api_call/salesOrder_api_call";

export default function CreatePo() {
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
          .required("required"),
        UnitPrice: yup
          .number()
          .min(0, "cannot be negative")
          .required("required"),
        product: yup
          .object()
          .shape({
            ID: yup.number().required("required"),
            PartNumber: yup.string().required("required"),
          })
          .required("required"),
      })
    ),
  });

  const [selectedCustomer, setSelectedCustomer] = useState({});
  const [selected, setSelected] = useState(false);
  const [productList, setProductList] = useState(null);
  const [customerList, setCustomerList] = useState(null);
  const [spiner, setSpiner] = useState(false);

  useEffect(async () => {
    const result = await get_productList();
    if (result.data) {
      setProductList(result.data);
    }
  }, []);

  useEffect(async () => {
    const result = await get_customer_list();
    if (result.data) {
      console.log(result.data);
      setCustomerList(result.data);
    }
  }, []);

  const SelectVendorBtnStyle = {
    width: 385,
    transition: `transform 500ms linear`,
  };

  const transitionStyle = {
    entered: {
      transform: "translateX(-106%)",
    },
  };

  const calculateTotalCost = (values, index) => {
    if (values) {
      return values.QTY * values.UnitPrice;
    }
    return 0;
  };
  if (!productList && !customerList) {
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
            <Grid item xs={3.2}>
              <CustomAutocomplete
                required
                name={`orderProduct[${index}].product`}
                titlelabel="Part Number"
                selectionLabel="PartNumber"
                recordValueField={`orderProduct[${index}].product`}
                option={productList}
              />
            </Grid>

            <Grid item xs={2.4}>
              <CustomAutocomplete
                required
                fullWidth
                name={`orderProduct[${index}].BurnOption`}
                titlelabel="Burn Option"
                selectionLabel="value"
                recordValueField={`orderProduct[${index}].BurnOption`}
                option={[
                  { value: "None" },
                  { value: "Coded" },
                  { value: "Keyed" },
                  { value: "Coded & Keyed" },
                ]}
              />
            </Grid>
            <Grid item xs={1.8}>
              <DatePicker
                required
                fullWidth
                name={`orderProduct[${index}].ETD`}
                label="Est delivery date"
              />
            </Grid>

            <Grid item xs={1.5}>
              <TextFieldWrapper
                required
                fullWidth
                type="number"
                name={`orderProduct[${index}].QTY`}
                label="QTY"
              />
            </Grid>

            <Grid item xs={1.5}>
              <TextFieldWrapper
                required
                fullWidth
                name={`orderProduct[${index}].UnitPrice`}
                label="Unit Price"
                type="number"
              />
            </Grid>
            <Grid item xs={1.6}>
              <TextField
                fullWidth
                name={`orderProduct[${index}].totalPrice`}
                label="Total Price"
                value={calculateTotalCost(values, index)}
                type="number"
                inputProps={{ readOnly: true, shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextFieldWrapper
                fullWidth
                name={`orderProduct[${index}].remark`}
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
          <RemoveCircleOutlineIcon
            sx={{ fontSize: "2.1rem", cursor: "pointer" }}
            onClick={() => {
              formikArrayHelperFunction.remove(index);
            }}
          />
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
          ...selectedCustomer,
          CustomerOrderNumber: "",
          SalesOrderDate: moment(new Date()).format("YYYY-MM-DD"),
          ReferenceNumber: "",
          Currency: "",
          Incoterms: "",
          ContactPerson: "",
          Email: "",
          orderProduct: [],
        }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          setSpiner(true);
          try {
            const result = await create_salesOrder(values);
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
        }}>
        {({ values, ...others }) => {
          console.log(values);
          return (
            <Form>
              <Container>
                <Grid container spacing={3}>
                  <Grid item xs={12} align="center">
                    <Typography variant="h6">Sales Order Creation</Typography>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sx={{
                      display: "grid",
                      justifyContent: "center",
                    }}>
                    <Transition in={selected} timeout={200}>
                      {(state) => (
                        <Autocomplete
                          disablePortal
                          sx={{
                            ...SelectVendorBtnStyle,
                            ...transitionStyle[state],
                          }}
                          options={customerList}
                          getOptionLabel={(option) => option.Company_name_ch}
                          renderInput={(params) => (
                            <TextField {...params} label="Customer Name" />
                          )}
                          onChange={(event, value) => {
                            setSelectedCustomer(value);
                            if (value) {
                              setSelected(true);
                            } else {
                              setSelected(false);
                            }
                          }}
                        />
                      )}
                    </Transition>
                  </Grid>

                  <Collapse in={selected} timeout={800} easing="linear">
                    <Grid container spacing={1.5} mt={0.5}>
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
                              {values.orderProduct.length > 0 ? (
                                <Grid item>
                                  <SubmitButtom
                                    variant="contained"
                                    size="large"
                                    sx={{ color: "red" }}>
                                    Submit
                                  </SubmitButtom>
                                </Grid>
                              ) : null}
                              <Grid item>
                                <Button
                                  primary
                                  variant="contained"
                                  size="large"
                                  sx={{}}
                                  onClick={() => {
                                    arrayHelper.push({
                                      BurnOption: { value: "" },
                                      ETD: "",
                                      QTY: "",
                                      UnitPrice: 0,
                                      product: "",
                                      remark: "",
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
                  </Collapse>
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
