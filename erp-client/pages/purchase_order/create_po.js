import { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Autocomplete,
  TextField,
  Collapse,
} from "@mui/material";
import { get_supplierList } from "../../util/api_call/supplier_api_call";
import { Transition } from "react-transition-group";

export default function CreatePo() {
  const [suppliers, setSupplier] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState({});
  const [selected, setSelected] = useState(false);

  useEffect(async () => {
    const result = await get_supplierList();
    if (result.data) {
      setSupplier(result.data);
      console.log(result.data);
    }
  }, []);

  const SelectVendorBtnStyle = {
    width: 300,
    transition: `transform 500ms linear`,
  };

  const transitionStyle = {
    entered: { transform: "translateX(-48.5vh)" },
  };

  if (!suppliers) {
    return (
      <>
        <h1>Loading</h1>
      </>
    );
  }

  return (
    <Container>
      <Grid container spacing={3}>
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
                sx={{ ...SelectVendorBtnStyle, ...transitionStyle[state] }}
                options={suppliers}
                getOptionLabel={(option) => option.Company_name_ch}
                getOptionSelected={(option, value) => option.ID === value.ID} // Prevents warning
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
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="Company_name_ch"
                label="Company name"
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="Company_name_en"
                label="Company Name English"
              />
            </Grid>
            <Grid item xs={3}>
              <TextField fullWidth name="Email" label="Email" />
            </Grid>
            <Grid item xs={3}>
              <TextField fullWidth name="Tel" label="Tel" required />
            </Grid>

            <Grid item xs={3}>
              <TextField fullWidth name="Fax" label="Fax" />
            </Grid>

            <Grid item xs={10} sx={{ width: "100%" }}>
              <TextField fullWidth name="Address" label="Address" required />
            </Grid>
            <Grid item xs={2}>
              <TextField name="Zip_Code" label=" Zip Code" />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="Remark"
                label="Remark"
                multiline={true}
                rows={3}
              />
            </Grid>
          </Grid>
        </Collapse>

        <Grid item xs={3}></Grid>
      </Grid>
    </Container>
  );
}
