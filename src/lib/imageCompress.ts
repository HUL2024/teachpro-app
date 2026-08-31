// Compresses an image file down to under maxBytes by resizing and reducing
// JPEG quality iteratively. Runs entirely client-side via canvas -- no
// server-side processing needed.
export async function compressImageToMaxSize(
  file: File,
  maxBytes: number = 300 * 1024
): Promise<Blob> {
  const img = await loadImage(file)

  let width = img.width
  let height = img.height
  const MAX_DIMENSION = 800
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height)
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  let quality = 0.85
  let blob = await canvasToBlob(img, width, height, quality)

  // Back off quality first, then shrink dimensions further if quality
  // alone can't get under the size limit.
  while (blob.size > maxBytes && quality > 0.3) {
    quality -= 0.1
    blob = await canvasToBlob(img, width, height, quality)
  }
  while (blob.size > maxBytes && width > 200) {
    width = Math.round(width * 0.85)
    height = Math.round(height * 0.85)
    blob = await canvasToBlob(img, width, height, quality)
  }

  return blob
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = reject
    img.src = url
  })
}

function canvasToBlob(
  img: HTMLImageElement,
  width: number,
  height: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Canvas not supported'))
      return
    }
    ctx.drawImage(img, 0, 0, width, height)
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Compression failed'))
      },
      'image/jpeg',
      quality
    )
  })
}
