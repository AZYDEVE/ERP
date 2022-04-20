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
import { deletePo, getPo, updatePO } from "../../util/api_call/po_api_call";
import Router from "next/router";
import RingLoader from "react-spinners/RingLoader";
import Swal from "sweetalert2";
import moment from "moment";

export default function PoUpdateDelete({ poInfo }) {
  const validationSchema = yup.object().shape({
    Company_name_ch: yup.string().required("required!"),
    Tel: yup.number().integer("no decimal").required("required!"),
    Address: yup.string().required("required!"),
    // ID: yup.number().required("required!"),
    Currency: yup.string().required("required!"),
    orderProduct: yup.array().of(
      yup.object().shape({
        BurnOption: yup.object().shape({
          value: yup.string().required("required"),
        }),
        ETD: yup.date().required("required"),
        Packaging: yup.object().shape({
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
      })
    ),
  });

  const [suppliers, setSupplier] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState({});
  const [selected, setSelected] = useState(false);
  const [productList, setProductList] = useState(null);
  const [customerList, setCustomerList] = useState(null);
  const [spiner, setSpiner] = useState(false);
  const [po, setPo] = useState(null);
  const [isPoDeletable, setPoDeletable] = useState(true);

  useEffect(async () => {
    const result = await get_supplierList();
    if (result.data) {
      setSupplier(result.data);
    }
  }, []);

  useEffect(async () => {
    const result = await get_productList();
    if (result.data) {
      setProductList(result.data);
    }
  }, []);

  useEffect(async () => {
    const result = await get_customer_list();
    if (result.data) {
      setCustomerList(result.data);
    }
  }, []);

  useEffect(async () => {
    const result = await getPo(poInfo);
    if (result.data) {
      setPo({ ...result.data, poID: poInfo.poID });
      checkIfAnyReceived(result.data.orderProduct);
    }
  }, []);

  const checkIfAnyReceived = (data) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].ReceivedQTY > 0) {
        setPoDeletable(false);
        return;
      }
    }
  };

  const calculateTotalCost = (values, index) => {
    if (values) {
      return values.QTY * values.UnitCost;
    }
    return 0;
  };

  const handleDelete = async () => {
    const ID = poInfo.poID;
    Swal.fire({
      title: `confirm delete PO ${ID}?`,
      showDenyButton: true,
      confirmButtonText: "DELETE",
      denyButtonText: `CANCEL`,
    }).then(async (result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        try {
          const result = await deletePo({ ID });
          if (result.data.message == "success") {
            Swal.fire({
              title: "success",
              text: `PO ${ID} is deleted `,
              icon: "success",
              showConfirmButton: true,
            }).then((result) => {
              if (result.isConfirmed) {
                Router.reload(window.location.pathname);
              }
            });
          }

          console.log(result);
        } catch (err) {
          Swal.fire({
            title: `SOMETHING WENT WRONG `,
            text: err,
            icon: "error",
            showConfirmButton: true,
          });
        }
      }
    });
  };
  if (!po || !suppliers || !productList || !customerList) {
    return (
      <>
        <h1>Loading</h1>
      </>
    );
  }

  //************************************order detail form***********************************/
  const generateProductList = (values, index, formikArrayHelperFunction) => {
    const isReceived = values.ReceivedQTY > 0 ? true : false;
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
              <CustomAutocomplete
                disabled={isReceived}
                name={`orderProduct[${index}].product`}
                titlelabel="Part Number"
                selectionLabel="PartNumber"
                recordValueField={`orderProduct[${index}].product`}
                optionalSetValueforOtherfields={{
                  name: `orderProduct[${index}].UnitCost`,
                  field: "Cost",
                }}
                option={productList}
              />
            </Grid>
            <Grid item xs={3.5}>
              <CustomAutocomplete
                disabled={isReceived}
                name={`orderProduct[${index}].customer`}
                titlelabel="Customer Name"
                selectionLabel="Company_name_ch"
                recordValueField={`orderProduct[${index}].customer`}
                option={customerList}
              />
            </Grid>

            <Grid item xs={2}>
              <CustomAutocomplete
                disabled={isReceived}
                fullWidth
                name={`orderProduct[${index}].Application`}
                titlelabel="Application"
                selectionLabel="value"
                recordValueField={`orderProduct[${index}].Application`}
                option={[
                  { value: "None" },
                  { value: "Car" },
                  { value: "TV" },
                  { value: "home" },
                ]}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomAutocomplete
                disabled={isReceived}
                fullWidth
                name={`orderProduct[${index}].BurnOption`}
                titlelabel="Option"
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
            <Grid item xs={2}>
              <DatePicker
                disabled={isReceived}
                fullWidth
                name={`orderProduct[${index}].ETD`}
                label="Est delivery date"
              />
            </Grid>
            <Grid item xs={2}>
              <CustomAutocomplete
                disabled={isReceived}
                fullWidth
                name={`orderProduct[${index}].Packaging`}
                titlelabel="pkg"
                selectionLabel="value"
                recordValueField={`orderProduct[${index}].Packaging`}
                option={[
                  { value: "None" },
                  { value: "S" },
                  { value: "M" },
                  { value: "L" },
                ]}
              />
            </Grid>

            <Grid item xs={2}>
              <TextFieldWrapper
                fullWidth
                type="number"
                name={`orderProduct[${index}].QTY`}
                label="PO QTY"
              />
            </Grid>
            <Grid item xs={2}>
              <TextFieldWrapper
                fullWidth
                type="number"
                name={`orderProduct[${index}].ReceivedQTY`}
                label="Received QTY"
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
            <Grid item xs={2.5}>
              <TextField
                fullWidth
                name={`orderProduct[${index}].totalCost`}
                label="Total Cost"
                value={calculateTotalCost(values, index)}
                type="number"
                inputProps={{ readOnly: true, shrink: true }}
                disabled={isReceived}
              />
            </Grid>

            <Grid item xs={12}>
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
          xs={1}
          sx={{
            "& :hover": { color: "red" },
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
          {isReceived ? (
            ""
          ) : (
            <RemoveCircleOutlineIcon
              sx={{ fontSize: "2.1rem", cursor: "pointer" }}
              onClick={() => {
                formikArrayHelperFunction.remove(index);
              }}
            />
          )}
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
        }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          console.log(values);
          setSpiner(true);

          values.orderProduct.map((value, index) => {
            value.ETD = moment(value.ETD).format("YYYY-MM-DD") + "";
          });

          try {
            const result = await updatePO(values);

            setSpiner(false);
            if (result.status >= 200 || result.status <= 299) {
              Swal.fire({
                title: `SUCCESS`,
                text: `PO# : ${result.data.data}`,
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
          return (
            <Form>
              <Container>
                <Grid container spacing={0}>
                  <Grid item xs={12} align="center">
                    <Typography variant="h6">Update PO</Typography>
                  </Grid>
                  <Grid container spacing={1.5} mt={2}>
                    <Grid item xs={4}>
                      <TextFieldWrapper
                        disabled
                        fullWidth
                        name="Company_name_ch"
                        label="Vendor Name"
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextFieldWrapper
                        fullWidth
                        name="VendorID"
                        label="Vendor ID"
                        disabled
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={1.5} mt={0.2}>
                    <Grid item xs={2}>
                      <TextFieldWrapper
                        fullWidth
                        name="poID"
                        label="Po Number"
                        disabled
                      />
                    </Grid>

                    <Grid item xs={2}>
                      <DatePicker fullWidth name="PoDate" label="PO Date" />
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
                      />
                    </Grid>

                    <Grid item xs={2}>
                      <Selector
                        fullWidth
                        name="Currency"
                        label="Currency"
                        defaultValue=""
                        options={["", "USD", "TWD", "RMB"]}
                      />
                    </Grid>

                    <Grid item xs={10} sx={{ width: "100%" }}>
                      <TextFieldWrapper
                        fullWidth
                        name="Address"
                        label="Address"
                        disabled
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextFieldWrapper
                        name="Zip_Code"
                        label=" Zip Code"
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextFieldWrapper
                        fullWidth
                        name="Remark"
                        label="Remark"
                        multiline={true}
                        defaultValue=""
                        rows={3}
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
                            <Grid item>
                              {isPoDeletable ? (
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
                                    Submit
                                  </SubmitButtom>
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
                                    Application: { value: "" },
                                    BurnOption: { value: "" },
                                    ETD: "",
                                    Packaging: { value: "" },
                                    QTY: "",
                                    ReceivedQTY: 0,
                                    UnitCost: "",
                                    customer: "",
                                    product: "",
                                    Remark: "",
                                    PoItemIndex: "",
                                    ReceiveStatus: "open",
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
