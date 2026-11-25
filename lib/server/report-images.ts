import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { MAX_FILE_MB, MAX_PHOTOS } from "@/lib/report-form";
import { ApiError } from "./http";

const fileLimit = MAX_FILE_MB * 1024 * 1024;
export const multipartLimit = MAX_PHOTOS * fileLimit + 512 * 1024;
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const jpegSignature = Buffer.from([255, 216, 255]);

function imageType(content: Buffer) {
  if (content.subarray(0, pngSignature.length).equals(pngSignature)) return "image/png";
  if (content.subarray(0, jpegSignature.length).equals(jpegSignature)) return "image/jpeg";
  return null;
}

function storageDirectory() {
  return process.env.REPORT_UPLOAD_DIR || ".report-uploads";
}

function storagePath(id: string) {
  // User uploads live outside the build artifacts.
  return join(/* turbopackIgnore: true */ storageDirectory(), id);
}

export async function removeUploadedImage(id: string) {
  try {
    await rm(/* turbopackIgnore: true */ storagePath(id), { force: true });
  } catch (error) {
    // The file cannot be served without its database row.
    console.error("Could not clean up a report image.", error);
  }
}

export async function withUploadedImages<T>(
  reportId: string,
  files: FormDataEntryValue[],
  save: (images: { id: string; imageUrl: string }[]) => Promise<T>,
): Promise<T> {
  if (files.length > MAX_PHOTOS) throw new ApiError(400, `At most ${MAX_PHOTOS} images are allowed.`);

  const images: { id: string; imageUrl: string }[] = [];
  try {
    if (files.length) await mkdir(/* turbopackIgnore: true */ storageDirectory(), { recursive: true });
    for (const file of files) {
      if (!(file instanceof File) || !file.size || file.size > fileLimit) {
        throw new ApiError(400, `Each image must be a file of at most ${MAX_FILE_MB} MB.`);
      }
      const content = Buffer.from(await file.arrayBuffer());
      const type = imageType(content);
      if (!type || (file.type && file.type !== type && file.type !== "application/octet-stream")) {
        throw new ApiError(400, "Images must be PNG or JPEG.");
      }
      const id = randomUUID();
      await writeFile(/* turbopackIgnore: true */ storagePath(id), content, { flag: "wx" });
      images.push({ id, imageUrl: `/api/v1/reports/${reportId}/images/${id}` });
    }
    return await save(images);
  } catch (error) {
    await Promise.all(images.map(({ id }) => removeUploadedImage(id)));
    throw error;
  }
}

export async function uploadedImageResponse(id: string) {
  let content: Buffer;
  try {
    content = await readFile(/* turbopackIgnore: true */ storagePath(id));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new ApiError(404, "Image not found.");
    }
    throw error;
  }
  const type = imageType(content);
  if (!type) throw new ApiError(404, "Image not found.");

  return new Response(new Uint8Array(content), {
    headers: { "Content-Type": type, "X-Content-Type-Options": "nosniff" },
  });
}
