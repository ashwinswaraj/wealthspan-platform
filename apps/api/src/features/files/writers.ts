import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { AlignmentType, Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from "docx";
import { inr, safeText, type Report } from "./report";

/* ---------------------------------- CSV ---------------------------------- */

const csvCell = (v: string | number) => {
  const s = typeof v === "number" ? String(v) : safeText(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCsv(r: Report): Buffer {
  const head = r.columns.map((c) => csvCell(c.header)).join(",");
  const body = r.rows.map((row) => r.columns.map((c) => csvCell(row[c.key])).join(","));
  // BOM so Excel opens ₹ and Hindi text correctly.
  return Buffer.from("﻿" + [head, ...body].join("\r\n") + "\r\n", "utf8");
}

/* --------------------------------- Excel --------------------------------- */

export async function toXlsx(r: Report): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Wealthspan";

  const sum = wb.addWorksheet("Summary");
  sum.addRow([r.title]).font = { bold: true, size: 14 };
  sum.addRow(["Period", r.period]);
  sum.addRow(["Generated on", r.generatedOn]);
  sum.addRow([]);
  for (const t of r.totals) {
    const row = sum.addRow([t.label, t.amount]);
    row.getCell(2).numFmt = "#,##0.00";
  }
  for (const b of r.breakdowns) {
    sum.addRow([]);
    sum.addRow([b.title]).font = { bold: true };
    for (const l of b.lines) sum.addRow([safeText(l.label), l.amount]).getCell(2).numFmt = "#,##0.00";
  }
  sum.getColumn(1).width = 40;
  sum.getColumn(2).width = 18;

  const ws = wb.addWorksheet("Transactions", { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = r.columns.map((c) => ({ header: c.header, key: c.key, width: c.key === "note" ? 40 : c.key === "amount" ? 14 : 18 }));
  ws.getRow(1).font = { bold: true };
  for (const row of r.rows) {
    ws.addRow(Object.fromEntries(r.columns.map((c) => [c.key, typeof row[c.key] === "string" ? safeText(row[c.key] as string) : row[c.key]])));
  }
  ws.getColumn("amount").numFmt = "#,##0.00";
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: r.columns.length } };

  return Buffer.from(await wb.xlsx.writeBuffer());
}

/* ---------------------------------- Word --------------------------------- */

const cell = (text: string, bold = false, right = false) =>
  new TableCell({
    children: [new Paragraph({ alignment: right ? AlignmentType.RIGHT : AlignmentType.LEFT, children: [new TextRun({ text, bold, size: 18 })] })],
  });

export async function toDocx(r: Report): Promise<Buffer> {
  const para = (text: string, o: { bold?: boolean; size?: number } = {}) =>
    new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text, bold: o.bold, size: o.size })] });

  const kv = (rows: { label: string; amount: number }[]) =>
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: rows.map((x) => new TableRow({ children: [cell(x.label), cell(`₹${inr(x.amount)}`, false, true)] })),
    });

  const txTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, children: ["Date", "Type", "Amount (₹)", "Project", "Category", "Party / note"].map((h) => cell(h, true)) }),
      ...r.rows.map(
        (x) =>
          new TableRow({
            children: [cell(x.date), cell(x.type), cell(inr(x.amount), false, true), cell(x.project), cell(x.category), cell([x.party, x.note].filter(Boolean).join(" — "))],
          }),
      ),
    ],
  });

  const doc = new Document({
    creator: "Wealthspan",
    title: r.title,
    sections: [
      {
        children: [
          para(r.title, { bold: true, size: 32 }),
          para(`Period: ${r.period}   |   Generated on ${r.generatedOn}`),
          para("Summary", { bold: true, size: 26 }),
          kv(r.totals),
          ...r.breakdowns.flatMap((b) => [para(b.title, { bold: true, size: 24 }), kv(b.lines)]),
          para("Transactions", { bold: true, size: 26 }),
          txTable,
        ],
      },
    ],
  });
  return Buffer.from(await Packer.toBuffer(doc));
}

/* ----------------------------------- PDF --------------------------------- */

/** The built-in PDF fonts have no ₹ glyph, so the PDF writes "Rs." instead. */
const rs = (n: number) => `Rs. ${inr(n)}`;

export function toPdf(r: Report): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40, info: { Title: r.title, Author: "Wealthspan" } });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const left = doc.page.margins.left;
    const width = doc.page.width - left - doc.page.margins.right;
    const ensure = (h: number) => {
      if (doc.y + h > doc.page.height - doc.page.margins.bottom) doc.addPage();
    };
    const pair = (label: string, value: string) => {
      ensure(16);
      const y = doc.y;
      doc.font("Helvetica").fontSize(10).text(label, left, y, { width: width * 0.65 });
      doc.text(value, left + width * 0.65, y, { width: width * 0.35, align: "right" });
      doc.x = left;
      doc.y = Math.max(doc.y, y + 14);
    };

    doc.font("Helvetica-Bold").fontSize(18).text(r.title);
    doc.font("Helvetica").fontSize(10).fillColor("#555").text(`Period: ${r.period}   |   Generated on ${r.generatedOn}`).fillColor("#000").moveDown();

    doc.font("Helvetica-Bold").fontSize(13).text("Summary").moveDown(0.3);
    r.totals.forEach((t) => pair(t.label, rs(t.amount)));
    for (const b of r.breakdowns) {
      doc.moveDown(0.6);
      ensure(30);
      doc.font("Helvetica-Bold").fontSize(11).text(b.title).moveDown(0.2);
      b.lines.forEach((l) => pair(l.label, rs(l.amount)));
    }

    doc.moveDown();
    ensure(40);
    doc.font("Helvetica-Bold").fontSize(13).text("Transactions").moveDown(0.3);
    const cols = [
      { h: "Date", w: 0.14, a: "left" as const },
      { h: "Type", w: 0.1, a: "left" as const },
      { h: "Amount", w: 0.15, a: "right" as const },
      { h: "Category", w: 0.21, a: "left" as const },
      { h: "Party / note", w: 0.4, a: "left" as const },
    ];
    const line = (vals: string[], bold: boolean) => {
      ensure(16);
      const y = doc.y;
      let x = left;
      let maxY = y;
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(9);
      cols.forEach((c, i) => {
        doc.text(vals[i], x + (i === 3 ? 8 : 0), y, { width: width * c.w - 4 - (i === 3 ? 8 : 0), align: c.a });
        maxY = Math.max(maxY, doc.y);
        x += width * c.w;
      });
      doc.x = left;
      doc.y = maxY + 3;
    };
    line(cols.map((c) => c.h), true);
    for (const x of r.rows) line([x.date, x.type, rs(x.amount), x.category, [x.party, x.note].filter(Boolean).join(" — ")], false);
    if (!r.rows.length) doc.font("Helvetica").fontSize(10).text("No transactions in this period.");

    doc.end();
  });
}
