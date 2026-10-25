import type { UploadedFileRef } from "./order-uploads.functions";

/**
 * Server-side store for order attachments.
 *
 * Keeps uploaded bytes on the server so nothing sensitive is held in the
 * browser. When Cloud storage is enabled this module is the single place to
 * swap the in-memory map for a bucket.
 */
interface StoredOrderFile extends UploadedFileRef {
  bytes: ArrayBuffer;
}

const store = new Map<string, StoredOrderFile>();

export const saveOrderFile = async (file: File): Promise<UploadedFileRef> => {
  const ref: UploadedFileRef = {
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString(),
  };
  store.set(ref.id, { ...ref, bytes: await file.arrayBuffer() });
  return ref;
};

export const removeOrderFile = (id: string) => {
  store.delete(id);
};

export const getOrderFile = (id: string) => store.get(id);
