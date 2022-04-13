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
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { get_supplierList } from "../../util/api_call/supplier_api_call";
import { get_productList } from "../../util/api_call/product_api_call";
import { get_customer_list } from "../../util/api_call/customer_api_call";

import TextFieldWrapper from "../../component/forms/formComponent/field";
import DatePicker from "../../component/forms/formComponent/datePicker";
import Selector from "../../component/forms/formComponent/select";
import SubmitButtom from "../../component/forms/formComponent/submitButton";
import { FieldArray, Form, Formik } from "formik";
import * as yup from "yup";

import CustomAutocomplete from "../../component/forms/formComponent/autoComplete";
import { create_po, deletePo, getPo } from "../../util/api_call/po_api_call";
import Router from "next/router";
import RingLoader from "react-spinners/RingLoader";
import Swal from "sweetalert2";

export default function Receiving({ poInfo }) {
  const validationSchema = yup.object().shape({
    Company_name_ch: yup.string().required("required!"),
    Tel: yup.number().integer("no decimal").required("required!"),
    Address: yup.string().required("required!"),
    ID: yup.number().required("required!"),
    Currency: yup.string().required("required!"),
    orderProduct: yup.array().of(
      yup.object().shape({
        BurnOption: yup.object().shape({
          value: yup.string().required("required"),
        }),

        QTY: yup.number().required("required"),
        UnitCost: yup.number().required("required"),
        customer: yup.object().shape({
          Company_name_ch: yup.string().required("required!"),
        }),
        product: yup.object().shape({
          PartNumber: yup.string().required("required"),
        }),
        unitMeasure: yup.object().shape({
          value: yup.string().required("required"),
        }),
      })
    ),
  });

  const [suppliers, setSupplier] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState({});
  const [selected, setSelected] = useState(false);
  const [productList, setProductList] = useState(null);

  const [spiner, setSpiner] = useState(false);
  const [po, setPo] = useState(null);

  useEffect(async () => {
    const result = await get_supplierList();
    if (result.data) {
      setSupplier(result.data);
      console.log(result.data);
    }
  }, []);

  useEffect(async () => {
    const result = await get_productList();
    if (result.data) {
      setProductList(result.data);
    }
  }, []);

  useEffect(async () => {
    const result = await getPo(poInfo);
    if (result.data) {
      console.log(result.data);

      setPo(result.data);
    }
  }, []);

  if (!po || !suppliers || !productList) {
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
        <Grid item xs={10.5}>
          <Grid container spacing={1.5}>
            <Grid item xs={3.5}>
              <TextFieldWrapper
                name={`orderProduct[${index}].product.PartNumber`}
                label="Part Number"
                disabled
              />
            </Grid>

            <Grid item xs={2}>
              <TextFieldWrapper
                name={`orderProduct[${index}].BurnOption.value`}
                label="Option"
                disabled
              />
            </Grid>

            <Grid item xs={2}>
              <TextFieldWrapper
                fullWidth
                name={`orderProduct[${index}].CodeVersion`}
                label="Code Version"
                defaultValue=""
              />
            </Grid>
          </Grid>
          <Grid container spacing={1.5} mt={0.5}>
            <Grid item xs={1.5}>
              <TextFieldWrapper
                fullWidth
                type="number"
                name={`orderProduct[${index}].QTY`}
                label="PO QTY"
                disabled
              />
            </Grid>

            <Grid item xs={1.5}>
              <TextFieldWrapper
                fullWidth
                type="number"
                name={`orderProduct[${index}].OpenQTY`}
                label="Open QTY"
                disabled
              />
            </Grid>
            <Grid item xs={1.5}>
              <TextFieldWrapper
                fullWidth
                type="number"
                name={`orderProduct[${index}].ReceiveQTY`}
                label="Receive QTY"
              />
            </Grid>
            <Grid item xs={1.5}>
              <TextFieldWrapper
                fullWidth
                name={`orderProduct[${index}].UnitCost`}
                label="Unit Cost"
                type="number"
              />
            </Grid>

            <Grid item xs={12}>
              <TextFieldWrapper
                fullWidth
                name={`orderProduct[${index}].remark`}
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
          ...po,
          poID: poInfo.poID,
        }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          setSpiner(true);
          try {
            const result = await create_po(values);
            setSpiner(false);
            if (result.status >= 200 || result.status <= 299) {
              Swal.fire({
                title: `SUCCESS`,
                text: `PO# : ${result.data.data}`,
                icon: "success",
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
        {({ values, ...others }) => {
          console.log(values);
          return (
            <Form>
              <Container>
                <Grid container spacing={0}>
                  <Grid item xs={12} align="center">
                    <Typography variant="h6">Goods Receive</Typography>
                  </Grid>
                  <Grid container spacing={2} mt={3}>
                    <Grid item xs={3}>
                      <TextFieldWrapper
                        disabled
                        name="Company_name_ch"
                        label="Vendor Name"
                      />
                    </Grid>
                    <Grid item xs={1.5}>
                      <TextFieldWrapper
                        disabled
                        name="VendorID"
                        label="Vendor ID"
                      />
                    </Grid>

                    <Grid item xs={1.5}>
                      <TextFieldWrapper
                        fullWidth
                        name="poID"
                        label="PO Number"
                        disabled
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <DatePicker
                        fullWidth
                        name="PoDate"
                        label="PO Date"
                        disabled
                      />
                    </Grid>
                    <Grid item xs={2.5}>
                      <TextFieldWrapper
                        name="orderProduct[${index}].VendorInvoiceNumber"
                        label="Vendor invoice number"
                      />
                    </Grid>

                    <Grid item xs={1.5}>
                      <TextFieldWrapper
                        fullWidth
                        name="Currency"
                        label="Currency"
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
                              <>
                                <Grid item>
                                  <SubmitButtom
                                    variant="contained"
                                    size="large"
                                    sx={{ color: "red" }}>
                                    Submit
                                  </SubmitButtom>
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
