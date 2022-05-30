import { useState } from "react";

import RingLoader from "react-spinners/RingLoader";
import { Grid, Container, Typography, Button, Backdrop } from "@mui/material";
import { Form, Formik, Field } from "formik";
import * as yup from "yup";
import TextFieldWrapper from "./formComponent/field";
import CustomSelect from "./formComponent/select";
import SubmitButtom from "../../component/forms/formComponent/submitButton";
import { insertTransaction } from "../../util/api_call/inventory_api_call";
import Swal from "sweetalert2";
import Router from "next/router";

export default function InventoryTransferConversion({ itemInfo }) {
  const [spiner, setSpiner] = useState(false);

  const validationSchema = yup.object().shape({
    to: yup.object().shape({
      Location: yup.string().required("this is required"),
      QTY: yup
        .number()
        .required("required")
        .integer()
        .min(1)
        .test(
          "checkIfLessThanAvailable",
          "Can not be greater than the available QTY",
          (value, Schema) =>
            value > Schema.from[1].value.from.QTY ? false : true
        ),
      CodeVersion: yup
        .string()
        .test("checkifRequired", "required", (value, schema) => {
          if (
            schema.from[0].value.BurnOption !== "None" &&
            (value == "" || value == undefined)
          ) {
            return false;
          } else {
            return true;
          }
        }),
    }),
  });

  const setObjectValueNull = (obj) => {
    const newOBJ = {};
    Object.keys(obj).map((key, index) => {
      newOBJ[key] = "";
    });
    return newOBJ;
  };

  return (
    <>
      <Formik
        initialValues={{
          TransactionType: "Transfer",
          from: { ...itemInfo },
          to: { ...itemInfo, QTY: 0 },
        }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          // same shape as initial values
          console.log(values);
          let result;
          try {
            result = await insertTransaction(values);

            if (result.status >= 200 || result.status <= 299) {
              Swal.fire({
                title: `SUCCESS`,
                text: `successful`,
                icon: "success",
                showConfirmButton: true,
              }).then((result) => {
                if (result.isConfirmed) {
                  Router.reload(window.location.pathname);
                  // setSpiner(false);
                  // Router.push("/purchase_order/create_po");
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
          console.log(others);
          return (
            <>
              <Form>
                <Container disableGutters>
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography variant="h5" align="center">
                        Inventory Transfer or Conversion
                      </Typography>
                    </Grid>
                    <Grid item xs={2} mt={4}>
                      <CustomSelect
                        name="TransactionType"
                        label="Transaction Type"
                        options={["Transfer", "Conversion"]}
                        onClick={() => {
                          others.handleReset();
                          others.setFieldValue(
                            "TransactionType",
                            values.TransactionType === "Transfer"
                              ? "Conversion"
                              : "Transfer"
                          );
                        }}
                      />
                    </Grid>

                    {/* *****************************************from********************************************* */}
                    <Grid container mt={2} spacing={2}>
                      <Grid item xs={12}>
                        <Typography sx={{ fontSize: "2rem" }}>From</Typography>
                      </Grid>
                      <Grid item xs={2.5}>
                        <TextFieldWrapper
                          disabled
                          name="from.PartNumber"
                          label="partNumber"
                        />
                      </Grid>
                      <Grid item xs={1.2}>
                        <TextFieldWrapper
                          disabled
                          name="from.DateCode"
                          label="DateCode"
                        />
                      </Grid>
                      <Grid item xs={1.2}>
                        <TextFieldWrapper
                          disabled
                          name="from.LotNumber"
                          label="LotNumber"
                        />
                      </Grid>
                      <Grid item xs={1.8}>
                        <TextFieldWrapper
                          disabled
                          name="from.BurnOption"
                          label="BurnOption"
                        />
                      </Grid>
                      <Grid item xs={1.8}>
                        <TextFieldWrapper
                          disabled
                          name="from.CodeVersion"
                          label="CodeVersion"
                        />
                      </Grid>
                      <Grid item xs={1}>
                        <TextFieldWrapper
                          disabled
                          name="from.Marked"
                          label="Marked"
                        />
                      </Grid>

                      <Grid item xs={1}>
                        <TextFieldWrapper
                          disabled
                          name="from.Location"
                          label="Location"
                        />
                      </Grid>

                      <Grid item xs={1.5}>
                        <TextFieldWrapper
                          disabled
                          type="number"
                          name="from.QTY"
                          label="Available QTY"
                        />
                      </Grid>
                    </Grid>
                    {/* *****************************************To********************************************* */}
                    <Grid container mt={2} spacing={2}>
                      <Grid item xs={12}>
                        <Typography sx={{ fontSize: "2rem" }}>To</Typography>
                      </Grid>
                      <Grid item xs={2.5}>
                        <TextFieldWrapper
                          disabled
                          name="to.PartNumber"
                          label="partNumber"
                        />
                      </Grid>
                      <Grid item xs={1.2}>
                        <TextFieldWrapper
                          disabled
                          name="to.DateCode"
                          label="DateCode"
                        />
                      </Grid>
                      <Grid item xs={1.2}>
                        <TextFieldWrapper
                          disabled
                          name="to.LotNumber"
                          label="LotNumber"
                        />
                      </Grid>
                      <Grid item xs={1.8}>
                        <CustomSelect
                          disabled={
                            values.TransactionType == "Transfer" ? true : false
                          }
                          name="to.BurnOption"
                          label="BurnOption"
                          options={["NONE", "CODED", "KEYED", "CODED & KEYED"]}
                        />
                      </Grid>
                      <Grid item xs={1.8}>
                        <TextFieldWrapper
                          disabled={
                            values.TransactionType == "Transfer" ? true : false
                          }
                          name="to.CodeVersion"
                          label="CodeVersion"
                        />
                      </Grid>
                      <Grid item xs={1}>
                        <CustomSelect
                          name="to.Marked"
                          label="Marked"
                          options={["No", "Yes"]}
                          disabled={
                            values.TransactionType == "Transfer" ? true : false
                          }
                        />
                      </Grid>

                      <Grid item xs={1}>
                        <TextFieldWrapper
                          disabled={
                            values.TransactionType == "Transfer" ? false : true
                          }
                          name="to.Location"
                          label="Location"
                        />
                      </Grid>

                      <Grid item xs={1.5}>
                        <TextFieldWrapper
                          type="number"
                          name="to.QTY"
                          label={
                            values.TransactionType == "Transfer"
                              ? "Transfer QTY"
                              : "Convert QTY"
                          }
                        />
                      </Grid>
                    </Grid>
                    <Grid container justifyContent="center" spacing={2}>
                      <Grid item mt={4}>
                        <SubmitButtom
                          size="large"
                          sx={{ color: "red" }}
                          variant="contained">
                          Submit
                        </SubmitButtom>
                      </Grid>
                      <Grid item mt={4}>
                        <Button
                          size="large"
                          variant="contained"
                          onClick={() => {
                            others.handleReset(others.initialValues);
                          }}>
                          Reset
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Container>
              </Form>
            </>
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
