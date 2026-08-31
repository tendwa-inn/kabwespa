import { Transaction, TransactionsSummary } from "../api/types";

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function money(n: number): string {
  return `K${n.toFixed(0)}`;
}

export function buildStatementHtml(
  transactions: Transaction[],
  summary: TransactionsSummary,
  scopeLabel: string,
  logoDataUrl?: string | null
): string {
  const rows = transactions
    .map((t) => {
      const created = new Date(t.createdAt);
      const desc = escapeHtml(t.type === "income" ? t.serviceName || "" : t.description || "");
      const discount = t.type === "income" && t.isDiscounted ? ` (discounted, standard ${money(t.standardPrice || 0)})` : "";
      const amountColor = t.type === "income" ? "#3F6B4D" : "#9C4A3C";
      const sign = t.type === "income" ? "+" : "−";
      return `<tr>
        <td>${created.toLocaleDateString()}</td>
        <td>${created.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
        <td>${desc}${discount}</td>
        <td>${escapeHtml(t.createdBy)}</td>
        <td style="text-align:right;color:${amountColor};font-weight:600;">${sign}${money(t.amount)}</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      body { font-family: Georgia, 'Times New Roman', serif; color: #26281F; margin: 0; padding: 32px; background: #FFFFFF; }
      .header { display: flex; align-items: center; gap: 14px; border-bottom: 3px solid #2F3E36; padding-bottom: 14px; margin-bottom: 24px; }
      .header::after { content: ""; }
      .logo { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
      .brand { font-size: 22px; font-weight: bold; color: #2F3E36; }
      .tagline { font-family: Arial, sans-serif; font-size: 11px; color: #6E6A5E; letter-spacing: 1px; text-transform: uppercase; margin-top: 4px; }
      h1 { font-size: 18px; margin: 20px 0 4px; color: #2F3E36; }
      .scope { font-family: Arial, sans-serif; font-size: 12px; color: #6E6A5E; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; }
      th { text-align: left; background: #F7F3EC; color: #6E6A5E; text-transform: uppercase; letter-spacing: 0.5px; font-size: 10px; padding: 8px 6px; border-bottom: 2px solid #E4DDD0; }
      td { padding: 8px 6px; border-bottom: 1px solid #E4DDD0; }
      .summary { margin-top: 24px; width: 260px; margin-left: auto; font-family: Arial, sans-serif; font-size: 13px; }
      .summary-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #E4DDD0; }
      .summary-row.balance { border-top: 2px solid #2F3E36; border-bottom: none; margin-top: 4px; padding-top: 10px; font-weight: bold; font-size: 16px; color: #2F3E36; }
      .footer { margin-top: 32px; font-family: Arial, sans-serif; font-size: 10px; color: #6E6A5E; text-align: center; }
    </style>
  </head>
  <body>
    <div class="header">
      ${logoDataUrl ? `<img class="logo" src="${logoDataUrl}" />` : ""}
      <div>
        <div class="brand">The Kabwe Spa</div>
        <div class="tagline">Zarah's Massage Spa &middot; Highridge, Kabwe</div>
      </div>
    </div>
    <h1>Takings &amp; Expenses Statement</h1>
    <div class="scope">${escapeHtml(scopeLabel)} &middot; Generated ${new Date().toLocaleString()}</div>
    <table>
      <thead>
        <tr><th>Date</th><th>Time</th><th>Description</th><th>Recorded By</th><th style="text-align:right;">Amount</th></tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="5" style="text-align:center;color:#6E6A5E;">No entries</td></tr>`}</tbody>
    </table>
    <div class="summary">
      <div class="summary-row"><span>Income</span><span style="color:#3F6B4D;">${money(summary.income)}</span></div>
      <div class="summary-row"><span>Expenses</span><span style="color:#9C4A3C;">${money(summary.expense)}</span></div>
      <div class="summary-row"><span>Carried Forward</span><span>${money(summary.carriedForward)}</span></div>
      <div class="summary-row balance"><span>Balance</span><span>${money(summary.balance)}</span></div>
    </div>
    <div class="footer">The Kabwe Spa &middot; +26077686722</div>
  </body>
  </html>`;
}
