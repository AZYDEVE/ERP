import { useEffect, useState } from "react";
import { Container, Grid, Typography, Box, Backdrop } from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import TextFieldWrapper from "../../component/forms/formComponent/field";
import DatePicker from "../../component/forms/formComponent/datePicker";
import SubmitButtom from "../../component/forms/formComponent/submitButton";
import { FieldArray, Form, Formik } from "formik";
import * as yup from "yup";
import Router from "next/router";
import RingLoader from "react-spinners/RingLoader";
import Swal from "sweetalert2";
import {
  get_open_po_receiving_detail,
  insert_receive_documents,
} from "../../util/api_call/receive_api_call";

export default function Receiving({ poInfo }) {
  const validationSchema = yup.object().shape({
    Currency: yup.string().required("required!"),
    vendorInvoice: yup.string().required("required!"),
    poID: yup.number().required("required!"),

    orderProduct: yup.array().of(
      yup.object().shape({
        ProductID: yup.number().required("required!"),
        BurnOption: yup.string().required("required"),
        UnitCost: yup.number().required("required!"),
        ReceiveDate: yup
          .date("not date format")
          .test("require-based-recQTY", "this is required", (value, schema) => {
            const receiveItems = schema.from[0].value.ReceiveItems;
            if (receiveItems.length == 0) {
              return true;
            } else if (
              value !== null && value !== undefined && value
                ? value !== ""
                : false
            ) {
              return true;
            } else {
              return false;
            }
          }),
        ReceiveItems: yup
          .array()
          .of(
            yup.object().shape({
              ReceiveQTY: yup
                .number()
                .positive("must be greater then 0!")
                .required("required!")
                .test(
                  "test sum",
                  "Sum of Rec QTY > Open QTY",
                  (value, schema) => {
                    const sum = schema.from[1].value.ReceiveItems.reduce(
                      (previousValue, currentValue) =>
                        previousValue +
                        (currentValue.ReceiveQTY ? currentValue.ReceiveQTY : 0),
                      0
                    );
                    const openQTY = schema.from[1].value.OpenQTY;
                    if (sum <= openQTY) {
                      return true;
                    }
                    return false;
                  }
                ),
              Lot: yup.string().required("required!"),
              DateCode: yup.string().required("required!"),
              Location: yup.string().required("required!"),
              CodeVersion: yup
                .string()
                .test("checkIfApply", "this is required", (value, schema) => {
                  const codeVersion = schema.parent.CodeVersion;
                  const burnOption = schema.from[1].value.BurnOption;
                  if (burnOption == "None" || burnOption == "") {
                    return true;
                  } else if (
                    codeVersion !== null &&
                    codeVersion !== undefined &&
                    codeVersion
                      ? codeVersion.trim() !== ""
                      : false
                  ) {
                    return true;
                  } else {
                    return false;
                  }
                }),
            })
          )
          .test(
            "CheckIfAnyReceiveItem",
            "There is nothing to receive",
            (value, schema) => {
              const ordereProduct = schema.from[1].value.orderProduct;
              const numberOfReceive = ordereProduct.reduce(
                (pre, current) => pre + current.ReceiveItems.length,
                0
              );
              console.log(numberOfReceive);
              if (numberOfReceive == 0) {
                Swal.fire({
                  title: `There is nothing to receive `,
                  text: "Please insert items",
                  icon: "question",
                  showConfirmButton: true,
                });
                return false;
              }
              return true;
            }
          ),
      })
    ),
  });

  const [spiner, setSpiner] = useState(false);
  const [poReceiveDetail, setPoReceiveDetail] = useState(null);

  useEffect(async () => {
    const result = await get_open_po_receiving_detail(poInfo);
    if (result.data) {
      console.log(result.data);

      setPoReceiveDetail(result.data);
    }
  }, []);

  if (!poReceiveDetail) {
    return (
      <>
        <h1>Loading</h1>
      </>
    );
  }

  //************************************order detail form***********************************/
  const generateProductList = (values, index) => {
    return (
      <Grid
        key={index}
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
          <Grid container spacing={1.5}>
            <Grid item xs={3.5}>
              <TextFieldWrapper
                name={`orderProduct[${index}].PartNumber`}
                label="Part Number"
                disabled
              />
            </Grid>

            <Grid item xs={2}>
              <TextFieldWrapper
                name={`orderProduct[${index}].BurnOption`}
                label="Option"
                disabled
              />
            </Grid>

            <Grid item xs={1.5}>
              <TextFieldWrapper
                fullWidth
                type="number"
                name={`orderProduct[${index}].PoQTY`}
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
                name={`orderProduct[${index}].UnitCost`}
                label="Unit Cost"
                type="number"
              />
            </Grid>
            <Grid item xs={2}>
              <DatePicker
                fullWidth
                name={`orderProduct[${index}].ReceiveDate`}
                label="Receive Date"
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

            <Grid item xs={12}>
              <FieldArray
                name={`orderProduct[${index}].ReceiveItems`}
                render={(arrayHelper) => {
                  return (
                    <>
                      {values.ReceiveItems.map((value, QtyIndex) => {
                        return (
                          <Grid key={QtyIndex} container spacing={1} mt={1}>
                            <Grid item xs={2}>
                              <TextFieldWrapper
                                type="number"
                                name={`orderProduct[${index}].ReceiveItems[${QtyIndex}].ReceiveQTY`}
                                label="Receive QTY"
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <TextFieldWrapper
                                name={`orderProduct[${index}].ReceiveItems[${QtyIndex}].Lot`}
                                label="Lot"
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <TextFieldWrapper
                                name={`orderProduct[${index}].ReceiveItems[${QtyIndex}].DateCode`}
                                label="Date Code"
                              />
                            </Grid>
                            {!(values.BurnOption == "None") ? (
                              <Grid item xs={3}>
                                <TextFieldWrapper
                                  name={`orderProduct[${index}].ReceiveItems[${QtyIndex}].CodeVersion`}
                                  label="Code Version"
                                />
                              </Grid>
                            ) : (
                              ""
                            )}

                            <Grid item xs={2}>
                              <TextFieldWrapper
                                name={`orderProduct[${index}].ReceiveItems[${QtyIndex}].Location`}
                                label="Location"
                              />
                            </Grid>
                            <Grid
                              item
                              xs={1}
                              alignSelf="center"
                              sx={{
                                cursor: "pointer",
                                "& :hover": { color: "red" },
                              }}>
                              <RemoveCircleOutlineIcon
                                onClick={() => {
                                  arrayHelper.remove(QtyIndex);
                                }}
                              />
                            </Grid>
                          </Grid>
                        );
                      })}
                      <Grid item xs={12}>
                        <AddBoxIcon
                          sx={{ fontSize: "5vh" }}
                          onClick={() => {
                            if (values.OpenQTY > 0) {
                              arrayHelper.push({
                                CodeVersion: "",
                                DateCode: "",
                                Location: "",
                                Lot: "",
                                ReceiveQTY: "",
                              });
                            } else {
                              Swal.fire({
                                title: `0 open QTY`,
                                text: "This item is already received into Inventory",
                                icon: "question",
                                showConfirmButton: true,
                              });
                            }
                          }}
                        />
                      </Grid>
                    </>
                  );
                }}
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
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={{
          ...poReceiveDetail,
        }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          // if nothing to insert

          // if there are something to insert

          setSpiner(true);
          try {
            console.log(values);
            const result = await insert_receive_documents(values);
            console.log("hello");
            setSpiner(false);
            if (result.status >= 200 || result.status <= 299) {
              Swal.fire({
                title: `SUCCESS`,
                text: `${result.data.data}`,
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
                        name="vendorInvoice"
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
                              arrayHelper
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
