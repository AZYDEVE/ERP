import React from "react";

import {
  Grid,
  Container,
  Typography,
  Divider,
  Stack,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import moment from "moment";
import { Block } from "@mui/icons-material";

export default function PoTemplate({ poDetail }) {
  console.log(poDetail);
  const getPageMargins = () => {
    return `@page { margin: ${0.2} ${0.3} ${0.2} ${0.3} !important; }`;
  };
  return (
    <>
      <Container disableGutters="false">
        <Grid container spacing={1} mt={2}>
          <Grid item xs={6}>
            <Grid container justifyContent="start" align="center">
              <img alt="me" width="250" src="/images/logo.png" />
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <Grid
              container
              direction="column"
              justifyContent="center"
              align="center">
              <Typography variant="h6">翱昇科技股份有限公司</Typography>
              <Typography variant="h7">Awesometek CO., LT</Typography>
              <Typography variant="h7">
                221新北市汐止區新台五路一段79號17樓-11
              </Typography>
              <Typography variant="h7">
                TEL:+886-2-7728-3566 FAX:+886-2-2698-9681
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container justifyContent="center">
              <Typography variant="h4">Purchase Order</Typography>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid container spacing={1} mt={1} ml={2} mr={2}>
            <Grid item xs={6}>
              <Stack>
                <Typography
                  sx={{
                    fontSize: "12px",
                  }}>{`廠商編號: ${poDetail.VendorID}`}</Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                  }}>{`廠商名稱: ${poDetail.Company_name_ch}`}</Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                  }}>{`廠商地址: ${poDetail.Address}`}</Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                  }}>{`聯絡人員: ${poDetail.ContactPerson}`}</Typography>
                <Typography sx={{ fontSize: "12px" }}>
                  {`聯絡電話: ${poDetail.Tel}`}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                  }}>{`傳真號碼: ${poDetail.Fax}`}</Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                  }}>{`幣別: ${poDetail.Currency}`}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack sx={{ fontSize: "10px" }}>
                <Typography
                  sx={{
                    fontSize: "12px",
                  }}>{`採購單號: ${poDetail.poID}`}</Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                  }}>{`採購日期: ${poDetail.PoDate}`}</Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                  }}>{`採購人員: ${poDetail.po}`}</Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                  }}>{`製單人員: ${poDetail.po}`}</Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                  }}>{`所屬部門: ${poDetail.po}`}</Typography>
                <Typography sx={{ fontSize: "12px" }}>
                  {` 交貨地址: 221 新北市汐止區新台五路一段79號17樓-11`}
                </Typography>
                <Typography sx={{ fontSize: "12px" }}>
                  {` 發票地址: 221 新北市汐止區新台五路一段79號17樓-11`}
                </Typography>
              </Stack>
            </Grid>
            <Grid container justifyContent="center" ml={1}>
              <Grid item xs={12}>
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "red",
                  }}>
                  {`備註: ${poDetail.Remark}`}
                </Typography>
              </Grid>
            </Grid>
            <Grid container>
              <Table aria-label="simple table">
                <TableRow sx={{ pageBreakInside: "avoid" }}>
                  <TableCell align="center">編號 </TableCell>
                  <TableCell align="left">品名規格</TableCell>
                  <TableCell align="center">是否需燒錄</TableCell>
                  <TableCell align="center">封裝</TableCell>
                  <TableCell align="right">數量 (PIECES)</TableCell>
                  <TableCell align="right">單價</TableCell>
                  <TableCell align="right">金額</TableCell>
                  <TableCell align="left">預進貨日</TableCell>
                </TableRow>

                <TableBody>
                  {poDetail.orderProduct.map((item, index) => {
                    return (
                      <>
                        <TableRow
                          sx={{
                            "&:last-child td, &:last-child th": {
                              border: 0,
                            },
                          }}>
                          <TableCell component="th" scope="row" align="center">
                            {(index += 1)}
                          </TableCell>
                          <TableCell align="left">
                            {item.product.PartNumber} <br />
                            {item.customer.Company_name_ch !== ""
                              ? `客戶:${item.customer.Company_name_ch}`
                              : ""}
                            <br />
                            {item.Application.value !== ""
                              ? `Application: ${item.Application.value}`
                              : ""}
                            <br />
                            {item.Remark.trim() !== ""
                              ? `備註：${item.Remark}`
                              : ""}
                          </TableCell>
                          <TableCell align="center">
                            {item.BurnOption.value}
                          </TableCell>
                          <TableCell align="center">
                            {item.Packaging.value}
                          </TableCell>
                          <TableCell align="right">{item.QTY}</TableCell>
                          <TableCell align="right">
                            {item.UnitCost.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            {(item.QTY * item.UnitCost).toFixed(2)}
                          </TableCell>
                          <TableCell align="left">
                            {moment(item.ETD).format("yyyy-MM-DD")}
                          </TableCell>
                        </TableRow>
                      </>
                    );
                  })}

                  <TableRow>
                    <TableCell> </TableCell>
                    <TableCell align="left"></TableCell>
                    <TableCell align="center"></TableCell>
                    <TableCell align="left" style={{ verticalAlign: "top" }}>
                      數量合計:
                    </TableCell>
                    <TableCell align="right" style={{ verticalAlign: "top" }}>
                      {poDetail.orderProduct.reduce(
                        (prev, current) => (prev += current.QTY),
                        0
                      )}
                    </TableCell>
                    <TableCell align="right">
                      合計: <br />
                      稅金: <br />
                      總計: <br />
                    </TableCell>
                    <TableCell align="right">
                      {poDetail.orderProduct.reduce(
                        (prev, current) =>
                          (prev +=
                            Math.round(current.QTY * current.UnitCost * 100) /
                            100),
                        0
                      )}
                      <br />
                      0.00
                      <br />
                      {poDetail.orderProduct.reduce(
                        (prev, current) =>
                          (prev +=
                            Math.round(current.QTY * current.UnitCost * 100) /
                            100),
                        0
                      )}
                    </TableCell>
                    <TableCell align="left"></TableCell>
                  </TableRow>
                  <TableRow></TableRow>
                </TableBody>
              </Table>

              <Grid container ml={2} mt={2}>
                <Stack>
                  <Typography>注意事項：</Typography>
                  <Typography>1.所交貨品須符合RoHS標準, D/C一年內。</Typography>
                  <Typography>
                    2.請於收到訂單後三天內回傳確認交期，否則視同接受採購單上所記載之事項。
                  </Typography>
                  <Typography>
                    3.請於出貨時隨貨附發票及出貨單,並於次月5號前提供對帳單,逾期貨款順延至下個月。
                  </Typography>
                </Stack>
              </Grid>
              <Grid
                container
                direction="row"
                justifyContent="space-around"
                alignItems="center"
                mt={1}>
                <Grid item xs={3}>
                  <Typography>主管:</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography>業務:</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography> 採購：</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
