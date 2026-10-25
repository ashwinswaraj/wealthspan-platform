import { createServerFn } from "@tanstack/react-start";

/**
 * Order file uploads.
 *
 * Files chosen during order creation are uploaded to the server immediately.
 * Sensitive file content NEVER touches browser sessionStorage — the client
 * only keeps the returned reference (id, name, size, type).
 */
export interface UploadedFileRef {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED_PREFIXES = [
  "image/",
  "video/",
  "audio/",
  "text/",
  "application/pdf",
  "application/zip",
  "application/msword",
  "application/vnd.openxmlformats-officedocument",
];

export const uploadOrderFile = createServerFn({ method: "POST" })
  .inputValidator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error("Expected form data.");
    return data;
  })
  .handler(async ({ data }): Promise<UploadedFileRef> => {
    const file = data.get("file");
    if (!(file instanceof File)) throw new Error("No file provided.");
    if (file.size === 0) throw new Error("File is empty.");
    if (file.size > MAX_BYTES) throw new Error("File exceeds the 25 MB limit.");
    if (!ALLOWED_PREFIXES.some((prefix) => file.type.startsWith(prefix))) {
      throw new Error("Unsupported file type.");
    }

    const { saveOrderFile } = await import("./order-uploads.server");
    return saveOrderFile(file);
  });

export const deleteOrderFile = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => {
    if (!data?.id) throw new Error("Missing file id.");
    return data;
  })
  .handler(async ({ data }) => {
    const { removeOrderFile } = await import("./order-uploads.server");
    removeOrderFile(data.id);
    return { ok: true };
  });
