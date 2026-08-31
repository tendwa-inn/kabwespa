import { Platform } from "react-native";
import { Transaction, TransactionsSummary } from "../api/types";
import { imageToDataUrl } from "./imageDataUrl";

function money(n: number): string {
  return `K${n.toFixed(0)}`;
}

export type StatementSummary = TransactionsSummary;

async function buildWebPdf(
  transactions: Transaction[],
  summary: StatementSummary,
  scopeLabel: string,
  logoDataUrl: string | null
) {
  const { jsPDF } = await import("jspdf");
  const { autoTable } = await import("jspdf-autotable");

  const primary: [number, number, number] = [47, 62, 54];
  const success: [number, number, number] = [63, 107, 77];
  const danger: [number, number, number] = [156, 74, 60];
  const muted: [number, number, number] = [110, 106, 94];
  const gold: [number, number, number] = [176, 141, 87];
  const cream: [number, number, number] = [247, 243, 236];

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  let textX = margin;

  if (logoDataUrl) {
    try {
      const props = doc.getImageProperties(logoDataUrl);
      const logoSize = 40;
      const w = props.width > props.height ? logoSize : (logoSize * props.width) / props.height;
      const h = props.height > props.width ? logoSize : (logoSize * props.height) / props.width;
      doc.addImage(logoDataUrl, margin, 24, w, h);
      textX = margin + logoSize + 12;
    } catch {
      // Fall back to text-only header
    }
  }

  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...primary);
  doc.text("The Kabwe Spa", textX, 46);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  doc.text("ZARAH'S MASSAGE SPA · HIGHRIDGE, KABWE", textX, 60);

  doc.setDrawColor(...primary);
  doc.setLineWidth(1.5);
  doc.line(margin, 78, pageWidth - margin, 78);
  doc.setDrawColor(...gold);
  doc.setLineWidth(2.5);
  doc.line(margin, 81, pageWidth - margin, 81);

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...primary);
  doc.text("Takings & Expenses Statement", margin, 106);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  doc.text(`${scopeLabel}  ·  Generated ${new Date().toLocaleString()}`, margin, 120);

  const body = transactions.map((t) => {
    const created = new Date(t.createdAt);
    const desc = t.type === "income" ? t.serviceName || "" : t.description || "";
    const discount = t.type === "income" && t.isDiscounted ? ` (discounted, std ${money(t.standardPrice || 0)})` : "";
    const sign = t.type === "income" ? "+" : "−";
    return [
      created.toLocaleDateString(),
      created.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      `${desc}${discount}`,
      t.createdBy,
      `${sign}${money(t.amount)}`,
    ];
  });

  autoTable(doc, {
    startY: 136,
    margin: { left: margin, right: margin, bottom: 60 },
    head: [["Date", "Time", "Description", "Recorded By", "Amount"]],
    body: body.length ? body : [["", "", "No entries", "", ""]],
    styles: { font: "helvetica", fontSize: 9, textColor: [38, 40, 31], lineColor: [228, 221, 208], lineWidth: 0.5 },
    headStyles: { fillColor: cream, textColor: muted, fontStyle: "bold", lineWidth: { bottom: 1 }, lineColor: primary },
    alternateRowStyles: { fillColor: [251, 249, 245] },
    columnStyles: { 4: { halign: "right" } },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        const text = String(data.cell.raw);
        data.cell.styles.textColor = text.startsWith("+") ? success : danger;
        data.cell.styles.fontStyle = "bold";
      }
    },
    didDrawPage: () => {
      const pageCount = doc.getNumberOfPages();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      doc.text("The Kabwe Spa · +26077686722", pageWidth / 2, pageHeight - 28, { align: "center" });
      doc.text(`Page ${pageCount}`, pageWidth - margin, pageHeight - 28, { align: "right" });
    },
  });

  // @ts-ignore lastAutoTable is added by the plugin at runtime
  let finalY = (doc as any).lastAutoTable.finalY + 26;
  const boxHeight = 92;
  if (finalY + boxHeight > pageHeight - 50) {
    doc.addPage();
    finalY = 50;
  }

  const boxWidth = 220;
  const boxX = pageWidth - margin - boxWidth;
  doc.setDrawColor(...primary);
  doc.setLineWidth(1);
  doc.roundedRect(boxX, finalY - 18, boxWidth, boxHeight, 4, 4);

  const labelX = boxX + 16;
  const valueX = pageWidth - margin - 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...muted);
  doc.text("Income", labelX, finalY);
  doc.setTextColor(...success);
  doc.text(money(summary.income), valueX, finalY, { align: "right" });

  doc.setTextColor(...muted);
  doc.text("Expenses", labelX, finalY + 18);
  doc.setTextColor(...danger);
  doc.text(money(summary.expense), valueX, finalY + 18, { align: "right" });

  doc.setTextColor(...muted);
  doc.text("Carried Forward", labelX, finalY + 36);
  doc.setTextColor(...primary);
  doc.text(money(summary.carriedForward), valueX, finalY + 36, { align: "right" });

  doc.setDrawColor(...gold);
  doc.setLineWidth(1);
  doc.line(labelX, finalY + 46, valueX, finalY + 46);

  doc.setFont("times", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...primary);
  doc.text("Balance", labelX, finalY + 66);
  doc.text(money(summary.balance), valueX, finalY + 66, { align: "right" });

  doc.save(`kabwe-spa-statement-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export async function exportStatementPdf(
  transactions: Transaction[],
  summary: StatementSummary,
  scopeLabel: string,
  logoUrl?: string | null
) {
  const logoDataUrl = logoUrl ? await imageToDataUrl(logoUrl) : null;

  if (Platform.OS === "web") {
    await buildWebPdf(transactions, summary, scopeLabel, logoDataUrl);
    return;
  }

  const { buildStatementHtml } = await import("./statementHtml");
  const Print = await import("expo-print");
  const Sharing = await import("expo-sharing");
  const html = buildStatementHtml(transactions, summary, scopeLabel, logoDataUrl);
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Export statement" });
  }
}
