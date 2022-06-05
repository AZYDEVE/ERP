import { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Backdrop,
  ListItem,
  List,
  Divider,
  TextField,
  MenuItem,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import TextFieldWrapper from "./formComponent/field";
import DatePicker from "./formComponent/datePicker";

import { FieldArray, Form, Formik } from "formik";
import * as yup from "yup";

import Router from "next/router";
import RingLoader from "react-spinners/RingLoader";
import Swal from "sweetalert2";

import CustomSelect from "./formComponent/select";
import CustomAutocomplete from "./formComponent/autoComplete";
import {
  delete_pickpack_set_delivery_status_to_block,
  delete_pack_set_delivery_status_to_picking,
  get_Delivery_for_PickAndPack,
  save_pick_pack,
} from "../../util/api_call/pickpack_api_call";
import { DataGrid } from "@mui/x-data-grid";
import GridBreak from "./formComponent/gridBreaker";

import { useFormikContext, useField } from "formik";

export default function Pickpack({ DeliveryID }) {
  const [PickPackDetail, setPickPackDetail] = useState(null);
  const [spiner, setSpiner] = useState(false);

  useEffect(async () => {
    const result = await get_Delivery_for_PickAndPack(DeliveryID);

    if (result.data) {
      setPickPackDetail(result.data);
    }
  }, []);

  const reloadData = async () => {
    const result = await get_Delivery_for_PickAndPack(DeliveryID);

    if (result.data) {
      setPickPackDetail(result.data);
    }
  };

  // validation schema for formik to validate user input
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
              "PickQTY is more than the DeliveryQTY",
              (value, schema) => {
                const listOfPickQTY =
                  schema.from[0].value.onHandProduct[0].QtyByProductStatus;
                const totalPick = listOfPickQTY.reduce(
                  (pre, current) => pre + current.PickQTY,
                  0
                );

                if (totalPick > value) {
                  return false;
                }
                return true;
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
                  QTY: yup
                    .number()
                    .required("required")
                    .test(
                      "check negative",
                      "Available QTY can not be negative",
                      (value, schema) => {
                        if (schema.from[0].value.QTY < 0) {
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

  // delete the picking and packing detail and change the delivery status to Block
  const handleDeletePickings = async () => {
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

  const handleDeletePack = async (formikFunction, formikValues) => {
    setStatus(formikFunction, formikValues, "picking");

    try {
      const result = await delete_pack_set_delivery_status_to_picking(
        DeliveryID
      );
      setSpiner(false);
      if (result.status >= 200 || result.status <= 299) {
        Swal.fire({
          title: ` ${result.data.data}`,
          showConfirmButton: true,
        }).then((result) => {
          if (result.isConfirmed) {
            reloadData();
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

  // prepare the request body to save pick detail
  const prepareOjectForSaving = (value, formikFunctions) => {
    const pickItems = [];
    value.orderProduct.map((item) => {
      item.onHandProduct[0].QtyByProductStatus.map((pickItem) => {
        const obj = {};
        if (pickItem.PickQTY > 0) {
          obj = { ...pickItem };
          obj[`DeliveryItemID`] = item.DeliveryItemID;
          obj[`DeliveryID`] = value.DeliveryID;
          delete obj.QTY;
          pickItems.push(obj);
        }
      });
    });

    const submitOject = {
      ...value,
      PickItems: pickItems,
    };

    delete submitOject.orderProduct;

    return submitOject;
  };

  // calling api to save the picking detail
  const toSave = async (submitObj) => {
    try {
      const result = await save_pick_pack(submitObj);

      if (result.status >= 200 || result.status <= 299) {
        Swal.fire({
          title: ` ${result.data}`,
        });
        reloadData();
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

  // check if pick detail is valid
  // check if the pick quantity equals deliveryQTY, if not inform user
  // call prepareOjectForSaving() to prepare the request body for save pickdetail
  // call toSave() to save
  const handleSave = async (value, formikFunctions, status) => {
    if (formikFunctions.isValid === false) {
      Swal.fire({
        title: `Please fix the errors before saving the data `,
      });
      return;
    }

    let complete = true;

    value.orderProduct.map((item, index) => {
      if (item.onHandProduct.length !== 0) {
        const sumOfPickQTY = item.onHandProduct[0].QtyByProductStatus.reduce(
          (pre, current) => pre + current.PickQTY,
          0
        );
        if (sumOfPickQTY !== item.DeliveryQTY) {
          complete = false;
        }
      }
    });

    if (complete === false) {
      Swal.fire({
        title: "pickQTY is less than the delivery QTY",
        showCancelButton: true,
        showConfirmButton: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          const saveValue = setStatus(formikFunctions, value, status);
          const submitObject = prepareOjectForSaving(
            saveValue,
            formikFunctions
          );
          await toSave(submitObject);
        }
      });
    } else {
      const saveValue = setStatus(formikFunctions, value, status);
      const submitObject = prepareOjectForSaving(saveValue, formikFunctions);
      await toSave(submitObject);
    }
  };

  const setStatus = (formikFunction, formikValue, status) => {
    // formikFunction.setFieldValue("Status", status);
    formikValue.Status = status;
    return formikValue;
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
        <Grid item xs={11}>
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
              {values.onHandProduct.length !== 0 ? (
                <CustomDataGridPickPack
                  inventoryList={values.onHandProduct[0].QtyByProductStatus}
                  itemValue={values}
                  formikFunction={formikFunctions}
                  orderProductIndex={index}
                  formikValues={formikValues}
                />
              ) : (
                ""
              )}
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
          PackingList: [],
        }}
        validationSchema={createValidationSchama()}
        onSubmit={async (values, others) => {}}>
        {({ values, ...formikFunctions }) => {
          console.log(values);
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
                    <Grid item xs={12} mt={2}>
                      <Divider>
                        <Typography>Picking</Typography>
                      </Divider>
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
                          {["picked", "packing", "packed"].includes(
                            values.Status
                          )
                            ? PackingList(formikFunctions, values)
                            : ""}

                          <Grid
                            container
                            justifyContent="center"
                            mt={2}
                            spacing={2}>
                            <Grid item>
                              {values.Status === "released" ||
                              values.Status === "picking" ? (
                                <Button
                                  variant="contained"
                                  size="large"
                                  sx={{ color: "red" }}
                                  onClick={handleDeletePickings}>
                                  delete picking
                                </Button>
                              ) : (
                                <Grid item>
                                  <Button
                                    variant="contained"
                                    size="large"
                                    sx={{ color: "red" }}
                                    onClick={() => {
                                      handleDeletePack(formikFunctions, values);
                                    }}>
                                    remove packing
                                  </Button>
                                </Grid>
                              )}
                            </Grid>

                            <Grid item>
                              <Button
                                variant="contained"
                                size="large"
                                onClick={() =>
                                  handleSave(values, formikFunctions, "picking")
                                }>
                                save
                              </Button>
                            </Grid>

                            <Grid item>
                              {values.Status === "released" ||
                              values.Status === "picking" ? (
                                <Button
                                  variant="contained"
                                  size="large"
                                  onClick={() => {
                                    handleSave(
                                      values,
                                      formikFunctions,
                                      "picked"
                                    );
                                  }}>
                                  prepare packing
                                </Button>
                              ) : (
                                <Button
                                  variant="contained"
                                  size="large"
                                  onClick={() => {
                                    handleSave(
                                      values,
                                      formikFunctions,
                                      "packed"
                                    );
                                  }}>
                                  Finish packing
                                </Button>
                              )}
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

// *************************************render datagrid to show the available stock**************************
const CustomDataGridPickPack = ({
  inventoryList,
  itemValue,
  formikFunction,
  orderProductIndex,
  formikValues,
}) => {
  const checkStatus = () => {
    const statusMeta = formikFunction.getFieldMeta("Status");
    if (statusMeta.value === "released" || statusMeta.value === "picking") {
      return true;
    }
    return false;
  };
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
      flex: 1,
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
      editable: checkStatus(),
      type: "number",
    },
  ];

  const getStockAvailabilityError = () => {
    const fieldError = formikFunction.getFieldMeta(
      `orderProduct[${orderProductIndex}].onHandProduct[0].QtyByProductStatus`
    );

    if (fieldError.error) {
      return (
        <>
          <List>
            {fieldError.error.map((item, index) =>
              item != null ? (
                <ListItem>
                  <CircleIcon sx={{ fontSize: 8, color: "red" }} />
                  <Typography sx={{ color: "red", paddingLeft: 2 }}>
                    {`Index ${index + 1}- ${Object.keys(item)[0]} : ${
                      Object.values(item)[0]
                    }`}
                  </Typography>
                </ListItem>
              ) : (
                ""
              )
            )}
          </List>
        </>
      );
    }
  };

  return (
    <>
      <Box
        sx={{
          height: 250,
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
          rowHeight={50}
          columns={columns}
          rows={inventoryList}
          hideFooter
          disableSelectionOnClick
          onCellEditCommit={(params) => {
            formikFunction.setFieldValue(
              `orderProduct[${orderProductIndex}].onHandProduct[0].QtyByProductStatus[${params.id}].PickQTY`,
              params.value
            );

            formikFunction.setFieldTouched(
              `orderProduct[${orderProductIndex}].DeliveryQTY`
            );

            // below dynamically change the available QTY based on PickQTY
            const originalPickQTY =
              formikFunction.initialValues.orderProduct[orderProductIndex]
                .onHandProduct[0].QtyByProductStatus[params.id].PickQTY;
            const qtyChange = originalPickQTY - params.value;

            const currentStockItem =
              formikFunction.initialValues.orderProduct[orderProductIndex]
                .onHandProduct[0].QtyByProductStatus[params.id];

            const currentStockStr =
              currentStockItem.ProductID +
              currentStockItem.BurnOption +
              currentStockItem.CodeVersion +
              currentStockItem.Marked +
              currentStockItem.Location +
              currentStockItem.LotNumber +
              currentStockItem.DateCode;

            formikValues.orderProduct.map((item, index) => {
              item.onHandProduct[0].QtyByProductStatus.map(
                (stock, stockIndex) => {
                  const formItemsStr =
                    stock.ProductID +
                    stock.BurnOption +
                    stock.CodeVersion +
                    stock.Marked +
                    stock.Location +
                    stock.LotNumber +
                    stock.DateCode;

                  if (currentStockStr === formItemsStr) {
                    const initialAvailableQTY =
                      formikFunction.initialValues.orderProduct[index]
                        .onHandProduct[0].QtyByProductStatus[stockIndex].QTY;
                    const newAvailableQTY = initialAvailableQTY + qtyChange;
                    formikFunction.setFieldValue(
                      `orderProduct[${index}].onHandProduct[0].QtyByProductStatus[${stockIndex}].QTY`,
                      newAvailableQTY
                    );
                  }
                }
              );
            });
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
      {getStockAvailabilityError()}
    </>
  );
};

const PackingList = (formikFunction, formikValue, index) => {
  console.log(formikValue);
  const listOfItem = {};
  return (
    <>
      <Grid container mt={2}>
        <Grid item xs={12}>
          <Divider>
            <Typography>Packing</Typography>
          </Divider>
        </Grid>
      </Grid>
      <Grid
        container
        spacing={2}
        sx={{
          transform: "scale(0.93)",
        }}>
        <Grid item xs={0.5} />

        <Grid item xs={11}>
          <FieldArray
            name="PackingList"
            render={(arrayHelper) => {
              return (
                <>
                  {formikValue.PackingList.map((item, index) => {
                    return (
                      <>
                        <Grid container spacing={1} mt={3}>
                          <Grid item xs={4}>
                            <ProductSelectForPacking
                              label="Part Number"
                              name={`PackingList[${index}].DeliveryItemID`}
                              selections={formikValue.orderProduct}
                              disabled={
                                formikValue.Status === "packed" ? true : false
                              }
                            />
                          </Grid>
                          <Grid item xs={1.5}>
                            <TextFieldWrapper
                              name={`PackingList[${index}].QTY`}
                              label="QTY"
                              type="number"
                              disabled={
                                formikValue.Status === "packed" ? true : false
                              }
                            />
                          </Grid>
                          <Grid item xs={1.5}>
                            <TextFieldWrapper
                              name={`PackingList[${index}].BoxNumber`}
                              label="Box #"
                              type="number"
                              disabled={
                                formikValue.Status === "packed" ? true : false
                              }
                            />
                          </Grid>
                          <Grid item xs={1}>
                            <TextFieldWrapper
                              name={`PackingList[${index}].Length`}
                              label="L"
                              type="number"
                              disabled={
                                formikValue.Status === "packed" ? true : false
                              }
                            />
                          </Grid>
                          <Grid item xs={1}>
                            <TextFieldWrapper
                              name={`PackingList[${index}].Height`}
                              label="H"
                              type="number"
                              disabled={
                                formikValue.Status === "packed" ? true : false
                              }
                            />
                          </Grid>
                          <Grid item xs={1}>
                            <TextFieldWrapper
                              name={`PackingList[${index}].Width`}
                              label="W"
                              type="number"
                              disabled={
                                formikValue.Status === "packed" ? true : false
                              }
                            />
                          </Grid>
                          <Grid item xs={2}>
                            <TextFieldWrapper
                              name={`PackingList[${index}].Weight`}
                              label="kg"
                              type="number"
                              disabled={
                                formikValue.Status === "packed" ? true : false
                              }
                            />
                          </Grid>
                        </Grid>
                      </>
                    );
                  })}

                  {formikFunction.getFieldMeta("Status").value !== "packed" ? (
                    <>
                      <Button
                        sx={{ marginTop: 1 }}
                        variant="contained"
                        onClick={() => {
                          arrayHelper.push({
                            DeliveryItemID: "",
                            QTY: 0,
                            BoxNumber: 0,
                            Length: 0,
                            Height: 0,
                            Width: 0,
                            Weight: 0,
                            DeliveryId: formikValue.DeliveryID,
                          });
                        }}>
                        <AddIcon />
                      </Button>
                      {formikValue.PackingList.length > 0 ? (
                        <Button
                          sx={{ marginTop: 1, marginLeft: 1 }}
                          variant="contained"
                          onClick={() => {
                            arrayHelper.pop();
                          }}>
                          <RemoveIcon />
                        </Button>
                      ) : (
                        ""
                      )}
                    </>
                  ) : (
                    ""
                  )}
                </>
              );
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};

const ProductSelectForPacking = ({ name, selections, ...otherProps }) => {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();

  const selection = [];
  selections.map((item, index) => {
    const obj = {
      DeliveryItemID: item.DeliveryItemID,
      ProductID: item.ProductID,
      PartNumber: item.PartNumber,
      BurnOption: item.BurnOption,
      Marked: item.Marked,
    };

    selection.push(obj);
  });

  const hangleChange = (event) => {
    setFieldValue(name, event.target.value);
  };

  const configSelect = {
    select: true,
    varient: "outlined",
    fullWidth: true,
    onChange: hangleChange,
    ...field,
    ...otherProps,
  };

  if (meta && meta.error && meta.touched) {
    (configSelect.error = true), (configSelect.helperText = meta.error);
  }

  return (
    <TextField {...configSelect} InputLabelProps={{ shrink: true }}>
      {selection.map((value, pos) => {
        return (
          <MenuItem value={value.DeliveryItemID} key={pos}>
            {`${value.PartNumber}--${value.BurnOption}--${
              value.marked == "Yes" ? "Marked" : "NotMarked"
            } `}
          </MenuItem>
        );
      })}
    </TextField>
  );
};
