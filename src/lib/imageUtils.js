// Compresses an image (from a file input or a camera capture canvas data URL)
// down to a max width and JPEG quality, to keep payloads under serverless limits.

const MAX_WIDTH = 1400;
const QUALITY = 0.7;

const resizeToCanvas = (img, maxWidth) => {
  let { width, height } = img;
  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
};

// Compress a File object (from <input type="file">) into a resized JPEG.
export const compressImageFile = (file, maxWidth = MAX_WIDTH, quality = QUALITY) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = resizeToCanvas(img, maxWidth);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({ dataUrl, base64: dataUrl.split(',')[1], mediaType: 'image/jpeg' });
      };
      img.onerror = () => reject(new Error('Could not read image file.'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.readAsDataURL(file);
  });
};

// Compress an existing data URL (e.g. from a <canvas> camera snapshot) into a resized JPEG.
export const compressDataUrl = (dataUrl, maxWidth = MAX_WIDTH, quality = QUALITY) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = resizeToCanvas(img, maxWidth);
      const out = canvas.toDataURL('image/jpeg', quality);
      resolve({ dataUrl: out, base64: out.split(',')[1], mediaType: 'image/jpeg' });
    };
    img.onerror = () => reject(new Error('Could not process the photo.'));
    img.src = dataUrl;
  });
};
