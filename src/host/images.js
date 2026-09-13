import { imageSize } from '../core/images.js';

// Album images remain in the theme. This module never uploads files.
export async function embedImage(win, file) {
  if (!file || !file.type.startsWith('image/')) throw new Error('请选择图片文件。');
  if (file.size > 20 * 1024 * 1024) throw new Error('图片超过 20 MB，请先缩小再选择。');
  const original = await new Promise((resolve, reject) => {
    const reader = new win.FileReader();
    const timer = win.setTimeout(() => reader.abort(), 20000);
    reader.onload = () => { win.clearTimeout(timer); resolve(reader.result); };
    reader.onerror = reader.onabort = () => { win.clearTimeout(timer); reject(new Error('图片读取失败，请重新选择。')); };
    reader.readAsDataURL(file);
  });
  if (file.type === 'image/gif') {
    if (file.size > 2 * 1024 * 1024) throw new Error('为保留动画，GIF 请控制在 2 MB 内，或改用图片链接。');
    return { url: original, detail: 'GIF 已内嵌，保留动画' };
  }
  const img = await new Promise((resolve, reject) => {
    const image = new win.Image();
    const timer = win.setTimeout(() => { image.src = ''; reject(new Error('图片解码超时，请改用 JPG、PNG 或 WebP。')); }, 15000);
    image.onload = () => { win.clearTimeout(timer); resolve(image); };
    image.onerror = () => { win.clearTimeout(timer); reject(new Error('这张图片无法读取，请改用 JPG、PNG 或 WebP。')); };
    image.src = original;
  });
  const { width, height } = imageSize(img.naturalWidth, img.naturalHeight);
  const canvas = win.document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('当前设备无法处理图片，请改用链接。');
  ctx.drawImage(img, 0, 0, width, height);
  const url = canvas.toDataURL('image/webp', 0.85);
  canvas.width = canvas.height = 1;
  if (url.length > 2.8 * 1024 * 1024) throw new Error('处理后的图片仍超过约 2 MB，请先缩小或改用链接。');
  return { url, detail: `${width} × ${height} · 约 ${Math.round(url.length * 0.75 / 1024)} KB，已内嵌` };
}
