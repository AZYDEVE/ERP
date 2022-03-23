import React, { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import Link from "next/link";

import {
  ChevronRight,
  Schema,
  InboxIcon,
  ExpandLess,
  ExpandMore,
  StarBorder,
  Cottage,
} from "@mui/icons-material";
import {
  ListItemButton,
  ListItemText,
  Collapse,
  ListItemIcon,
  ListItem,
  List,
  Typography,
} from "@mui/material";

const Sidebar = () => {
  const [state, setState] = useState(false);
  const [titleOpen, setTitleOpen] = useState({
    masterData: false,
  });
  const [collapse, setCollapse] = useState(true);

  const toggleDrawer = (isopen) => {
    setState(isopen);
  };

  const handleTitleOpen = (state) => {
    setTitleOpen(state);
  };

  const handleClick = () => {};

  const list = () => (
    <Box sx={{ width: "15vw" }} role="presentation">
      <ListItemButton>
        <ListItemIcon>
          <Cottage />
        </ListItemIcon>
        <Link href="/home">
          <ListItemText primary="HOME" />
        </Link>
      </ListItemButton>
      <ListItemButton
        name="masterData"
        onClick={() => {
          handleTitleOpen({
            ...titleOpen,
            masterData: titleOpen.masterData ? false : true,
          });
        }}>
        <ListItemIcon>
          <Schema />
        </ListItemIcon>
        <ListItemText primary="DATA MASTER" />
        {titleOpen.masterData ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={titleOpen.masterData} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 14 }}>
            <Link href="/master_data/customer_master">
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: "0.8rem", color: "blue" }}>
                    CUSTOMER
                  </Typography>
                }
              />
            </Link>
          </ListItemButton>
          <ListItemButton sx={{ pl: 14 }}>
            <Link href="/master_data/supplier_master">
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: "0.8rem", color: "blue" }}>
                    SUPPLIER
                  </Typography>
                }
              />
            </Link>
          </ListItemButton>
          <ListItemButton sx={{ pl: 14 }}>
            <Link href="/master_data/product_master">
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: "0.8rem", color: "blue" }}>
                    PRODUCT
                  </Typography>
                }
              />
            </Link>
          </ListItemButton>
        </List>
      </Collapse>
    </Box>
  );

  return (
    <div>
      <React.Fragment>
        <Button
          onClick={() => {
            toggleDrawer(true);
          }}>
          <ChevronRight style={{ fontSize: "50px", color: "black" }} />
        </Button>
        <Drawer
          anchor="left"
          open={state}
          onClose={() => {
            toggleDrawer(false);
          }}>
          {list()}
        </Drawer>
      </React.Fragment>
    </div>
  );
};

export default Sidebar;
