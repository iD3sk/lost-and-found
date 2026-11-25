import { randomUUID } from "node:crypto";
import { MAX_FILE_MB, MAX_PHOTOS } from "@/lib/report-form";
import { ApiError } from "./http";
import { put, get, del } from "@vercel/blob";

const fileLimit = MAX_FILE_MB * 1024 * 1024;
export const multipartLimit = MAX_PHOTOS * fileLimit + 512 * 1024;

const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const jpegSignature = Buffer.from([255, 216, 255]);

function imageType(content: Buffer) {
  if (content.subarray(0, pngSignature.length).equals(pngSignature))
    return "image/png";

  if (content.subarray(0, jpegSignature.length).equals(jpegSignature))
    return "image/jpeg";

  return null;
}

function storagePath(id: string) {
  return `reports/${id}`;
}

export async function removeUploadedImage(id: string) {
  try {
    await del(storagePath(id));
  } catch (error) {
    console.error("Could not clean up a report image.", error);
  }
}

export async function withUploadedImages<T>(
  reportId: string,
  files: FormDataEntryValue[],
  save: (images: { id: string; imageUrl: string }[]) => Promise<T>,
): Promise<T> {
  if (files.length > MAX_PHOTOS) {
    throw new ApiError(400, `At most ${MAX_PHOTOS} images are allowed.`);
  }

  const images: { id: string; imageUrl: string }[] = [];

  try {
    for (const file of files) {
      if (!(file instanceof File) || !file.size || file.size > fileLimit) {
        throw new ApiError(
          400,
          `Each image must be a file of at most ${MAX_FILE_MB} MB.`
        );
      }

      const content = Buffer.from(await file.arrayBuffer());
      const type = imageType(content);

      if (!type || (file.type && file.type !== type && file.type !== "application/octet-stream")) {
        throw new ApiError(400, "Images must be PNG or JPEG.");
      }

      const id = randomUUID();

      await put(storagePath(id), content, {
        access: "private",
        contentType: type,
        addRandomSuffix: false,
      });

      images.push({
        id,
        imageUrl: `/api/v1/reports/${reportId}/images/${id}`,
      });
    }

    return await save(images);
  } catch (error) {
    await Promise.all(
      images.map(({ id }) => removeUploadedImage(id))
    );
    throw error;
  }
}

export async function uploadedImageResponse(id: string) {
  const result = await get(storagePath(id), {
    access: "private",
  });

  if (!result || result.statusCode !== 200) {
    throw new ApiError(404, "Image not found.");
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}