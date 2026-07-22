const MAX_DIM = 800;
const START_QUALITY = 0.6;
const MIN_QUALITY = 0.1;
const QUALITY_STEP = 0.1;
const MAX_IMAGE_BYTES = 250 * 1024;
const MAX_TOTAL_BYTES = 700 * 1024;

export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_DIM) {
        height = Math.round((height * MAX_DIM) / width);
        width = MAX_DIM;
      }
      if (height > MAX_DIM) {
        width = Math.round((width * MAX_DIM) / height);
        height = MAX_DIM;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(img.src);

      function attempt(quality) {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }
          if (blob.size > MAX_IMAGE_BYTES && quality > MIN_QUALITY) {
            attempt(Math.max(MIN_QUALITY, +(quality - QUALITY_STEP).toFixed(1)));
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => resolve({ base64: reader.result, size: blob.size });
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }, 'image/jpeg', quality);
      }

      attempt(START_QUALITY);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

export async function compressAllImages(files) {
  if (!files || files.length === 0) return [];
  const results = await Promise.all(files.map((file) => compressImage(file)));
  const totalBinary = results.reduce((sum, r) => sum + r.size, 0);
  const estimatedDocBytes = totalBinary * 1.4;
  if (estimatedDocBytes > MAX_TOTAL_BYTES) {
    throw new Error(
      `Total image size is too large for Firestore (${Math.round(estimatedDocBytes / 1024)} KB estimated). Please use fewer or smaller images.`
    );
  }
  return results.map((r) => r.base64);
}
