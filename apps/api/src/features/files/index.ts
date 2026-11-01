import { toCsv, toDocx, toPdf, toXlsx } from "./writers";
import { FILE_MIME, fileName, type FileFormat, type Report } from "./report";

export * from "./report";
export { toCsv, toDocx, toPdf, toXlsx } from "./writers";

export async function renderFile(
  format: FileFormat,
  report: Report,
): Promise<{ body: Buffer; mime: string; fileName: string }> {
  const body =
    format === "csv"
      ? toCsv(report)
      : format === "xlsx"
        ? await toXlsx(report)
        : format === "docx"
          ? await toDocx(report)
          : await toPdf(report);
  return { body, mime: FILE_MIME[format], fileName: fileName(format, report) };
}
export { buildSheetXlsx, sheetFileName } from "./sheet";
export type { RefNames } from "./sheet";
