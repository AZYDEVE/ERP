import React, { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import Link from "next/link";

import {
  ChevronRight,
  Schema,
  ExpandLess,
  ExpandMore,
  Cottage,
  Inventory,
  ShoppingBasket,
  MonetizationOn,
} from "@mui/icons-material";
import {
  ListItemButton,
  ListItemText,
  Collapse,
  ListItemIcon,
  List,
  Typography,
} from "@mui/material";

const Sidebar = () => {
  const [state, setState] = useState(false);
  const [titleOpen, setTitleOpen] = useState({
    masterData: false,
    inventory: false,
    purchaseOrder: false,
    salesOrder: false,
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
      {/* ********************************************DATA MASTER********************************* */}
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
          <ListItemButton sx={{ pl: 12 }} onClick={() => setState(false)}>
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
          <ListItemButton sx={{ pl: 12 }} onClick={() => setState(false)}>
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
          <ListItemButton sx={{ pl: 12 }} onClick={() => setState(false)}>
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
      {/* **********************************************Inventory *********************************************** */}
      <ListItemButton
        onClick={() => {
          handleTitleOpen({
            ...titleOpen,
            inventory: titleOpen.inventory ? false : true,
          });
        }}>
        <ListItemIcon>
          <Inventory />
        </ListItemIcon>
        <ListItemText primary="INVENTORY" />
        {titleOpen.inventory ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={titleOpen.inventory} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 12 }} onClick={() => setState(false)}>
            <Link href="/inventory/inventoryList">
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: "0.8rem", color: "blue" }}>
                    INVENTORY LIST
                  </Typography>
                }
              />
            </Link>
          </ListItemButton>
          <ListItemButton sx={{ pl: 12 }} onClick={() => setState(false)}>
            <Link href="/master_data/product_master">
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: "0.8rem", color: "blue" }}>
                    INVENTORY ADJUSTMENT
                  </Typography>
                }
              />
            </Link>
          </ListItemButton>
        </List>
      </Collapse>
      {/* *****************************PURCHASE ORDER****************************************************** */}
      <ListItemButton
        onClick={() => {
          handleTitleOpen({
            ...titleOpen,
            purchaseOrder: titleOpen.purchaseOrder ? false : true,
          });
        }}>
        <ListItemIcon>
          <ShoppingBasket />
        </ListItemIcon>
        <ListItemText primary="PURCHASE ORDER" />
        {titleOpen.purchaseOrder ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={titleOpen.purchaseOrder} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 12 }} onClick={() => setState(false)}>
            <Link href="/purchase_order/create_po">
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: "0.8rem", color: "blue" }}>
                    CREATE P.O
                  </Typography>
                }
              />
            </Link>
          </ListItemButton>
          <ListItemButton sx={{ pl: 12 }} onClick={() => setState(false)}>
            <Link href="/purchase_order/po_list">
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: "0.8rem", color: "blue" }}>
                    P.O LIST
                  </Typography>
                }
              />
            </Link>
          </ListItemButton>
          <ListItemButton sx={{ pl: 12 }} onClick={() => setState(false)}>
            <Link href="/purchase_order/receive">
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: "0.8rem", color: "blue" }}>
                    GOODS RECEIVE
                  </Typography>
                }
              />
            </Link>
          </ListItemButton>
        </List>
      </Collapse>

      {/* *******************************************SALES ORDER********************************************* */}
      <ListItemButton
        onClick={() => {
          handleTitleOpen({
            ...titleOpen,
            salesOrder: titleOpen.salesOrder ? false : true,
          });
        }}>
        <ListItemIcon>
          <MonetizationOn />
        </ListItemIcon>
        <ListItemText primary="SALES ORDER" />
        {titleOpen.salesOrder ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={titleOpen.salesOrder} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 12 }} onClick={() => setState(false)}>
            <Link href="/master_data/customer_master">
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: "0.8rem", color: "blue" }}>
                    CREATE SALES ORDER
                  </Typography>
                }
              />
            </Link>
          </ListItemButton>
          <ListItemButton sx={{ pl: 12 }} onClick={() => setState(false)}>
            <Link href="/master_data/supplier_master">
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: "0.8rem", color: "blue" }}>
                    SALES ORDER LIST
                  </Typography>
                }
              />
            </Link>
          </ListItemButton>
          <ListItemButton sx={{ pl: 12 }} onClick={() => setState(false)}>
            <Link href="/master_data/supplier_master">
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: "0.8rem", color: "blue" }}>
                    SALES PICK&PACK
                  </Typography>
                }
              />
            </Link>
          </ListItemButton>
          <ListItemButton sx={{ pl: 12 }} onClick={() => setState(false)}>
            <Link href="/master_data/supplier_master">
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: "0.8rem", color: "blue" }}>
                    SALES SHIPPING
                  </Typography>
                }
              />
            </Link>
          </ListItemButton>
          <ListItemButton sx={{ pl: 12 }} onClick={() => setState(false)}>
            <Link href="/master_data/supplier_master">
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: "0.8rem", color: "blue" }}>
                    SALES OTHERS
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
