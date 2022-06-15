import { Button } from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Invoice(deliveryID) {
  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      putOnlyUsedFonts: true,
      floatPrecision: 16,
    });

    const head = [
      [
        {
          content: "COMMERICAL INVOICE",
          colSpan: 6,
          styles: { halign: "center" },
        },
      ],
      [
        {
          content:
            "SELLER\nAWESOME Co., Ltd\n17-11 No.79, Sec. 1, XinTai 5th Rd.\nXiZhi Dist., New TaiPei City 221, Taiwan \nTEL: +886-2-7728-3566 #806 \nFAX: +886-2-2698-9681 \nContact: Alice Kuo",
          colSpan: 3,
          styles: { halign: "left" },
        },
        {
          content:
            "Invoice No: INV220418001 \n Date: 2022/4/8 \n \n Trade Term DAP HK \n Payment Term: NET 75 DAYS AFTER INVOICE DATE",

          colSpan: 3,
          styles: { halign: "center" },
        },
      ],
      [
        {
          content:
            "SELLER\nAWESOME Co., Ltd\n17-11 No.79, Sec. 1, XinTai 5th Rd.\nXiZhi Dist., New TaiPei City 221, Taiwan \nTEL: +886-2-7728-3566 #806 \nFAX: +886-2-2698-9681 \nContact: Alice Kuo",
          colSpan: 3,
          styles: { halign: "left" },
        },
        {
          content:
            "Invoice No: INV220418001 \n Date: 2022/4/8 \n \n Trade Term DAP HK \n Payment Term: NET 75 DAYS AFTER INVOICE DATE",

          colSpan: 3,
          styles: { halign: "center" },
        },
      ],
      [
        {
          content: `remark `,
          colSpan: 3,
          styles: { halign: "left" },
        },
        {
          content: ``,
          colSpan: 3,
          styles: { halign: "left" },
        },
      ],
    ];
    const columns = [
      { header: "PartNumber", dataKey: "PartNumber" },
      { header: "PoNumber", dataKey: "CustomerOrderNumber" },
      { header: "Quantity", dataKey: "Quantity" },
      { header: "Unit", dataKey: "Unit" },
      { header: "Unit Price", dataKey: "UnitPrice" },
      { header: "Amount", dataKey: "Amount" },
    ];

    doc.autoTable({
      head: head,
      theme: "plain",
      // startY: 0,
      headerStyles: {
        lineWidth: 0.01,
        lineColor: [0, 0, 0],
      },
    });

    let finalY = doc.previousAutoTable.finalY;
    doc.save();
  };

  return (
    <>
      <Button variant="contained" onClick={generatePDF}>
        save PDF
      </Button>
    </>
  );
}
