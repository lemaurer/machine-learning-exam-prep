import type { EditStore } from "../types/question";

const DB_NAME = "iml-exam-prep-images-v1";
const STORE_NAME = "images";
const REF_PREFIX = "idb-image:";

const objectUrlToReference = new Map<string, string>();
const referenceToObjectUrl = new Map<string, string>();

function openImageDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Persistent image storage is not available in this browser."));
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error ?? new Error("Could not open image storage."));
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function writeBlob(blob: Blob, existingReference?: string): Promise<string> {
  const database = await openImageDatabase();
  const reference = existingReference ?? `${REF_PREFIX}${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
  const key = reference.slice(REF_PREFIX.length);

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.onerror = () => reject(transaction.error ?? new Error("Could not save that image."));
    transaction.oncomplete = () => resolve();
    transaction.objectStore(STORE_NAME).put(blob, key);
  });
  database.close();
  return reference;
}

async function readBlob(reference: string): Promise<Blob | undefined> {
  if (!reference.startsWith(REF_PREFIX)) return undefined;
  const database = await openImageDatabase();
  const key = reference.slice(REF_PREFIX.length);
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(key);
    request.onerror = () => reject(request.error ?? new Error("Could not read that image."));
    request.onsuccess = () => resolve(request.result instanceof Blob ? request.result : undefined);
  });
  database.close();
  return blob;
}

function objectUrlForBlob(blob: Blob, reference: string) {
  const existing = referenceToObjectUrl.get(reference);
  if (existing) return existing;
  const objectUrl = URL.createObjectURL(blob);
  objectUrlToReference.set(objectUrl, reference);
  referenceToObjectUrl.set(reference, objectUrl);
  return objectUrl;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Could not prepare that image.")),
      "image/webp",
      0.84,
    );
  });
}

function decodeImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("That file is not a readable image."));
    };
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.src = objectUrl;
  });
}

export async function loadImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");

  const image = await decodeImage(file);
  const maximumSide = 1800;
  const scale = Math.min(1, maximumSide / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare that image.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await canvasToBlob(canvas);
  const reference = await writeBlob(blob);
  return objectUrlForBlob(blob, reference);
}

export function prepareEditImagesForStorage(edits: EditStore): EditStore {
  return Object.fromEntries(Object.entries(edits).map(([id, edit]) => {
    const figure = edit.figure ? objectUrlToReference.get(edit.figure) ?? edit.figure : edit.figure;
    const secondFigure = edit.secondFigure ? objectUrlToReference.get(edit.secondFigure) ?? edit.secondFigure : edit.secondFigure;
    return [id, { ...edit, figure, secondFigure }];
  }));
}

export async function resolveStoredImageSource(source?: string): Promise<string | undefined> {
  if (!source) return source;

  if (source.startsWith(REF_PREFIX)) {
    const blob = await readBlob(source);
    return blob ? objectUrlForBlob(blob, source) : undefined;
  }

  if (source.startsWith("data:image/")) {
    const response = await fetch(source);
    const blob = await response.blob();
    const reference = await writeBlob(blob);
    return objectUrlForBlob(blob, reference);
  }

  return source;
}

export async function hydrateEditImages(edits: EditStore): Promise<EditStore> {
  const entries = await Promise.all(Object.entries(edits).map(async ([id, edit]) => [
    id,
    {
      ...edit,
      figure: await resolveStoredImageSource(edit.figure),
      secondFigure: await resolveStoredImageSource(edit.secondFigure),
    },
  ] as const));
  return Object.fromEntries(entries);
}
