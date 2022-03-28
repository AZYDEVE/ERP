import { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Autocomplete,
  Collapse,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MinusIcon from "@mui/icons-material/RemoveTwoTone";
import { get_supplierList } from "../../util/api_call/supplier_api_call";
import { get_productList } from "../../util/api_call/product_api_call";
import { get_customer_list } from "../../util/api_call/customer_api_call";
import { Transition } from "react-transition-group";
import TextFieldWrapper from "../../component/forms/formComponent/field";
import DatePicker from "../../component/forms/formComponent/datePicker";
import Selector from "../../component/forms/formComponent/select";
import { Form, Formik } from "formik";

import * as yup from "yup";
import moment from "moment";

import CustomAutocomplete from "../../component/forms/formComponent/autoComplete";
export default function CreatePo() {
  const customerSchema = yup.object().shape({
    Company_name_ch: yup.string().required("required!"),
    Tel: yup.number().integer("no decimal").required("required!"),
    Address: yup.string().required("required!"),
  });

  const [suppliers, setSupplier] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState({});
  const [selected, setSelected] = useState(false);
  const [productList, setProductList] = useState(null);
  const [customerList, setCustomerList] = useState(null);

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
    const result = await get_customer_list();
    if (result.data) {
      console.log(result.data);
      setCustomerList(result.data);
    }
  }, []);

  const SelectVendorBtnStyle = {
    width: 300,
    transition: `transform 500ms linear`,
  };

  const transitionStyle = {
    entered: { transform: "translateX(-48.5vh)" },
  };

  const calculateTotalCost = (values, index) => {
    if (values) {
      console.log(values);
      return values.QTY * values.UnitCost;
    }
    return 0;
  };
  if (!suppliers || !productList) {
    return (
      <>
        <h1>Loading</h1>
      </>
    );
  }

  const generateProductList = (values, index, formikOBJ) => {
    return (
      <Grid
        container
        spacing={1}
        mt={2}
        sx={{
          border: 1,
          borderColor: "primary.main",
          borderRadius: 4,
          paddingBottom: 1,
        }}>
        <Grid
          item
          xs={0.5}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <Typography>{index + 1}</Typography>
        </Grid>
        <Grid item xs={10}>
          <Grid container spacing={1.5}>
            <Grid item xs={3.5}>
              <CustomAutocomplete
                name={`orderProduct[${index}].PartID`}
                titlelable="Part Number"
                selectionLable="PartNumber"
                recordValueField="ID"
                option={productList}
              />
            </Grid>
            <Grid item xs={3.5}>
              <CustomAutocomplete
                name={`orderProduct[${index}].customerID`}
                titlelable="Customer Name"
                selectionLable="Company_name_ch"
                recordValueField="ID"
                option={customerList}
              />
            </Grid>

            <Grid item xs={2}>
              <Selector
                fullWidth
                name={`orderProduct[${index}].Application`}
                label="Application"
                defaultValue=""
                options={["", "Car", "TV", "home"]}></Selector>
            </Grid>
            <Grid item xs={3}>
              <Selector
                fullWidth
                name={`orderProduct[${index}].BurnOption`}
                label="Burn Option"
                defaultValue=""
                options={[null, "burn", "noburn"]}></Selector>
            </Grid>
            <Grid item xs={2.5}>
              <DatePicker
                fullWidth
                name={`orderProduct[${index}].ETD`}
                label="Est delivery date"
              />
            </Grid>
            <Grid item xs={2}>
              <Selector
                fullWidth
                name={`orderProduct[${index}].Packaging`}
                label="Packaging"
                defaultValue=""
                options={["SM", "M", "L"]}></Selector>
            </Grid>

            <Grid item xs={2.5}>
              <TextFieldWrapper
                fullWidth
                type="number"
                name={`orderProduct[${index}].QTY`}
                label="QTY"
              />
            </Grid>
            <Grid item xs={1.5}>
              <Selector
                fullWidth
                name={`orderProduct[${index}].unitMeasure`}
                label="U.M"
                defaultValue=""
                options={[null, "PCS", "BOX"]}></Selector>
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
              <TextField
                fullWidth
                name={`orderProduct[${index}].totalCost`}
                label="Total Cost"
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
                defaultValue={null}
                rows={2}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          xs={1.5}
          sx={{
            display: "flex",

            justifyContent: "center",
            alignItems: "center",
          }}>
          <Grid container>
            <Grid item xs={6} sx={{ "& :hover": { color: "green" } }}>
              <AddIcon
                formikOBJ={formikOBJ}
                name="orderProduct"
                index={index}
                sx={{
                  fontSize: "50px",
                  color: " primary.main",
                }}
              />
            </Grid>
            <Grid item xs={6} sx={{ "& :hover": { color: "red" } }}>
              <MinusIcon sx={{ fontSize: "50px" }} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  return (
    <Formik
      enableReinitialize
      initialValues={{
        ...selectedSupplier,
        PoDate: moment(new Date()).format("YYYY-MM-DD"),
        orderProduct: [{}, {}, {}],
      }}
      validationSchema={customerSchema}
      onSubmit={async (values) => {
        // same shape as initial values

        try {
          const result = await create_product(values);
        } catch (err) {
          console.log(err);
        }

        Router.reload(window.location.pathname);
      }}>
      {({ values }) => {
        const printsomething = () => {
          console.log(values);
        };

        return (
          <Form>
            <Container>
              <Grid container spacing={3}>
                <Grid item xs={12} align="center">
                  <Typography variant="h6">PO Creation</Typography>
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
                        options={suppliers}
                        getOptionLabel={(option) => option.Company_name_ch}
                        // getOptionSelected={(option, value) =>
                        //   option.ID === value.ID
                        // } // Prevents warning
                        renderInput={(params) => (
                          <TextField {...params} label="Vendor" />
                        )}
                        onChange={(event, value) => {
                          setSelectedSupplier(value);
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
                  <Grid container spacing={1} mt={0.5}>
                    <Grid item xs={2}>
                      <TextFieldWrapper
                        fullWidth
                        name="ID"
                        label="Vendor ID"
                        required
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
                        required
                      />
                    </Grid>

                    <Grid item xs={2}>
                      <TextFieldWrapper fullWidth name="Fax" label="Fax" />
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
                        required
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextFieldWrapper name="Zip_Code" label=" Zip Code" />
                    </Grid>

                    <Grid item xs={12}>
                      <TextFieldWrapper
                        fullWidth
                        name="Remark"
                        label="Remark"
                        multiline={true}
                        defaultValue={null}
                        rows={3}
                      />
                    </Grid>
                  </Grid>
                  {values.orderProduct.map((value, index) => {
                    return generateProductList(value, index, values);
                  })}
                </Collapse>
              </Grid>
              {printsomething()}
            </Container>
          </Form>
        );
      }}
    </Formik>
  );
}
