import { useEffect, useState } from "react";
import {
  Container,
  Grid,
  TextField,
  Typography,
  Button,
  Box,
  Backdrop,
  ListItem,
  List,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";

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
  release_delivery,
} from "../../util/api_call/delivery_api_call";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomSelect from "./formComponent/select";
import {
  delete_pickpack_set_delivery_status_to_block,
  get_Delivery_for_PickAndPack,
} from "../../util/api_call/pickpack_api_call";
import { DataGrid } from "@mui/x-data-grid";

const CustomDataGridPickPack = ({
  inventoryList,
  itemValue,
  formikFunction,
  orderProductIndex,
}) => {
  console.log(inventoryList);
  inventoryList = inventoryList.map((item, index) => ({ ...item, id: index }));
  const columns = [
    // {
    //   field: "id",
    //   headerName: "index",
    //   headerClassName: "datagridHeader",
    //   align: "center",
    //   headerAlign: "center",
    //   flex: 0.8,
    // },
    {
      field: "BurnOption",
      headerName: "BurnOption",
      headerClassName: "datagridHeader",
      align: "center",
      headerAlign: "center",
      flex: 0.8,
    },
    {
      field: "CodeVersion",
      headerName: "CodeVersion",
      headerClassName: "datagridHeader",
      align: "center",
      headerAlign: "center",
      flex: 2,
    },
    {
      field: "Marked",
      headerName: "Marked",
      headerClassName: "datagridHeader",
      align: "center",
      headerAlign: "center",
      flex: 0.5,
    },
    {
      field: "DateCode",
      headerName: "DateCode",
      headerClassName: "datagridHeader",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "LotNumber",
      headerName: "Lot",
      headerClassName: "datagridHeader",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "Location",
      headerName: "Location",
      headerClassName: "datagridHeader",
      align: "center",
      headerAlign: "center",
      flex: 0.8,
    },
    {
      field: "QTY",
      headerName: "Ava QTY",
      headerClassName: "datagridHeader",
      align: "center",
      headerAlign: "center",
      flex: 0.8,
    },
    {
      field: "PickQTY",
      headerName: "PickQTY",
      headerClassName: "datagridHeader",
      align: "center",
      headerAlign: "center",
      flex: 1,
      editable: true,
      type: "number",
    },
  ];

  const getError = () => {
    const fieldError = formikFunction.getFieldMeta(
      `orderProduct[${orderProductIndex}].onHandProduct[0].QtyByProductStatus`
    );
    console.log(fieldError);
    if (fieldError.error) {
      return (
        <>
          <List>
            {fieldError.error.map((item, index) => (
              <ListItem>
                <CircleIcon sx={{ fontSize: 8, color: "red" }} />
                <Typography sx={{ color: "red", paddingLeft: 2 }}>
                  {`Index ${index + 1}- ${Object.keys(item)[0]} : ${
                    Object.values(item)[0]
                  }`}
                </Typography>
              </ListItem>
            ))}
          </List>
        </>
      );
    }
  };

  return (
    <>
      <Box
        sx={{
          height: 300,
          width: "100%",
          overflow: "auto",
          "& .matching": {
            backgroundColor: "#E5F6DF",
          },
          "& .notMatching": {
            backgroundColor: "yellow",
          },
        }}>
        <DataGrid
          getRowClassName={(params) => {
            const rowStockStatus =
              params.row.BurnOption +
              params.row.CodeVersion +
              params.row.Marked;

            const requestStockStatus =
              itemValue.BurnOption + itemValue.CodeVersion + itemValue.Marked;

            if (rowStockStatus == requestStockStatus) {
              return "matching";
            }
          }}
          headerHeight={50}
          rowHeight={60}
          columns={columns}
          rows={inventoryList}
          hideFooter
          showErro
          onCellEditCommit={(params) => {
            formikFunction.setFieldValue(
              `orderProduct[${orderProductIndex}].onHandProduct[0].QtyByProductStatus[${params.id}].PickQTY`,
              params.value
            );
          }}
          isCellEditable={(params) => {
            if (
              params.row.BurnOption === itemValue.BurnOption &&
              params.row.CodeVersion === itemValue.CodeVersion &&
              params.row.Marked === itemValue.Marked
            ) {
              return true;
            }
            return false;
          }}
        />
      </Box>
      {getError()}
    </>
  );
};

export default function Pickpack({ DeliveryID }) {
  const [PickPackDetail, setPickPackDetail] = useState(null);
  const [spiner, setSpiner] = useState(false);

  useEffect(async () => {
    const result = await get_Delivery_for_PickAndPack(DeliveryID);

    if (result.data) {
      console.log(result.data);
      setPickPackDetail(result.data);
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
          DeliveryQTY: yup
            .number()
            .required("required")
            .test(
              "checkPickQTY",
              "PickQTY is more than DeliveryQTY",
              (value, schema) => {
                const listOfPickQTY =
                  schema.from[0].value.onHandProduct[0].QtyByProductStatus;
                const totalPick = listOfPickQTY.reduce(
                  (pre, current) => pre + current.PickQTY,
                  0
                );

                if (totalPick > value) {
                  return false;
                } else {
                  return true;
                }
              }
            ),
          ProductID: yup.number().required("required"),
          CodeVersion: yup
            .string()
            .nullable()
            .test(
              "checkIfNeeded",
              "please specify version#",
              (value, schema) => {
                if (
                  (schema.from[0].value.BurnOption === "CODED" ||
                    schema.from[0].value.BurnOption === "CODED & KEYED") &
                  (value == null || value.trim() === "")
                ) {
                  return schema.createError({
                    message: `${schema.from[0].value.BurnOption} -please specify version# `,
                  });
                }
                return true;
              }
            ),
          Marked: yup.string().required("required"),
          onHandProduct: yup.array().of(
            yup.object().shape({
              QtyByProductStatus: yup.array().of(
                yup.object().shape({
                  PickQTY: yup
                    .number()
                    .required("required")
                    .test(
                      "is it greater availableQTY",
                      "Cannot be greater than Available QTY",
                      (value, schema) => {
                        console.log(schema);
                        if (value > schema.from[0].value.QTY) {
                          return false;
                        } else {
                          return true;
                        }
                      }
                    ),
                })
              ),
            })
          ),
        })
      ),
    });
  };

  const handleDelete = async () => {
    try {
      const result = await delete_pickpack_set_delivery_status_to_block(
        DeliveryID
      );
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

  if (!PickPackDetail) {
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
                disabled={formikValues.Status === "block" ? false : true}
                fullWidth
                name={`orderProduct[${index}].CodeVersion`}
                label="Code Version"
              />
            </Grid>
            <Grid item xs={2}>
              <CustomSelect
                disabled={formikValues.Status === "block" ? false : true}
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
                inputProps={{ readOnly: true }}
                fullWidth
                name={`orderProduct[${index}].Remark`}
                label="Remark"
                rows={1}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDataGridPickPack
                inventoryList={values.onHandProduct[0].QtyByProductStatus}
                itemValue={values}
                formikFunction={formikFunctions}
                orderProductIndex={index}
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
        validateOnChange
        initialValues={{
          ...PickPackDetail,
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
          console.log(
            formikFunctions.getFieldMeta(
              `orderProduct[0].onHandProduct[0].QtyByProductStatus`
            )
          );
          return (
            <Form>
              <Container>
                <Grid container spacing={3}>
                  <Grid item xs={12} align="center">
                    <Typography variant="h6">
                      Pick&Pack Delivery # {values.DeliveryID}
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
                            <Grid item>
                              <Button
                                variant="contained"
                                size="large"
                                sx={{ color: "red" }}
                                onClick={handleDelete}>
                                <DeleteIcon />
                              </Button>
                            </Grid>

                            <Grid item>
                              <SubmitButtom
                                variant="contained"
                                size="large"
                                sx={{ color: "red" }}>
                                save
                              </SubmitButtom>
                            </Grid>

                            <Grid item>
                              <Button
                                variant="contained"
                                size="large"
                                onClick={handleRelease}>
                                Packing
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
