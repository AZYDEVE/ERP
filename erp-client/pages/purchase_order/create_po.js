import react, { useEffect, useState } from "react";

import { Container, Grid, Autocomplete, TextField } from "@mui/material";
import { get_supplierList } from "../../util/api_call/supplier_api_call";

export default function CreatePo() {
  const [suppliers, setSupplier] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState({});

  useEffect(async () => {
    const result = await get_supplierList();
    if (result.data) {
      setSupplier(result.data);
      console.log(result.data);
    }
  }, []);

  return !suppliers ? (
    <h1>Loading....</h1>
  ) : (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12} align="center">
          <Autocomplete
            disablePortal
            sx={{ width: 300 }}
            options={suppliers}
            getOptionLabel={(option) => option.Company_name_ch}
            getOptionSelected={(option, value) => option.ID === value.ID} // Prevents warning
            renderInput={(params) => <TextField {...params} label="Vendor" />}
            onChange={(event, value) => {
              setSelectedSupplier(value);
              //   this value is to populate
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
