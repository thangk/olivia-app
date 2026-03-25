/**
 * Compress and resize an image to a max dimension for API usage.
 * Returns base64 string (without data URL prefix).
 */
export async function compressImage(
  base64: string,
  mimeType: string,
  maxDimension = 1024
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error("Failed to load image for compression"));
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height / width) * maxDimension);
          width = maxDimension;
        } else {
          width = Math.round((width / height) * maxDimension);
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      // Use JPEG for photos (smaller), PNG for images with transparency
      const outputMime =
        mimeType === "image/png" ? "image/png" : "image/jpeg";
      const quality = outputMime === "image/jpeg" ? 0.85 : undefined;
      const dataUrl = canvas.toDataURL(outputMime, quality);
      const compressedBase64 = dataUrl.split(",")[1];

      resolve({ base64: compressedBase64, mimeType: outputMime });
    };

    img.src = `data:${mimeType};base64,${base64}`;
  });
}

/**
 * Generate a unique ID for assets/messages.
 */
export function generateId(): string {
  return crypto.randomUUID();
}
