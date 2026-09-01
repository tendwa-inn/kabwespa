import { Platform } from "react-native";
import { Service, Settings } from "../api/types";

const COLORS = {
  background: "#171B18",
  surface: "#20241F",
  border: "#333A30",
  textPrimary: "#F3F0E7",
  textSecondary: "#A6A499",
  accent: "#C9A66B",
  accentSoft: "#2C3327",
};

const WIDTH = 1000;
const PADDING = 40;
const GUTTER = 16;
const COLS = 2;
const COL_WIDTH = (WIDTH - PADDING * 2 - GUTTER) / COLS;
const CARD_H = 118;
const PHOTO_SIZE = 60;

function loadImage(url: string | null | undefined): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function sectionRows(count: number) {
  return Math.ceil(count / COLS);
}

function drawSectionBand(ctx: CanvasRenderingContext2D, title: string, y: number): number {
  const bandH = 44;
  ctx.fillStyle = COLORS.accentSoft;
  ctx.fillRect(0, y, WIDTH, bandH);
  ctx.strokeStyle = COLORS.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(WIDTH, y);
  ctx.stroke();
  ctx.fillStyle = COLORS.accent;
  ctx.font = "700 17px Karla_700Bold";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(title.toUpperCase(), PADDING, y + bandH / 2 + 1);
  ctx.textBaseline = "alphabetic";
  return y + bandH + 20;
}

function drawServiceGrid(
  ctx: CanvasRenderingContext2D,
  services: (Service & { photoImg: HTMLImageElement | null })[],
  startY: number
): number {
  const sorted = [...services].sort((a, b) => a.price - b.price);
  let y = startY;

  for (let i = 0; i < sorted.length; i += COLS) {
    const row = sorted.slice(i, i + COLS);
    for (let col = 0; col < row.length; col++) {
      const s = row[col];
      const x = PADDING + col * (COL_WIDTH + GUTTER);

      roundRectPath(ctx, x, y, COL_WIDTH, CARD_H, 12);
      ctx.fillStyle = COLORS.surface;
      ctx.fill();
      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 1;
      ctx.stroke();

      const photoX = x + (COL_WIDTH - PHOTO_SIZE) / 2;
      const photoY = y + 14;
      roundRectPath(ctx, photoX, photoY, PHOTO_SIZE, PHOTO_SIZE, 10);
      ctx.save();
      ctx.clip();
      if (s.photoImg) {
        const img = s.photoImg;
        const scale = Math.max(PHOTO_SIZE / img.width, PHOTO_SIZE / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, photoX - (dw - PHOTO_SIZE) / 2, photoY - (dh - PHOTO_SIZE) / 2, dw, dh);
      } else {
        ctx.fillStyle = COLORS.accentSoft;
        ctx.fillRect(photoX, photoY, PHOTO_SIZE, PHOTO_SIZE);
      }
      ctx.restore();

      ctx.textAlign = "center";
      ctx.fillStyle = COLORS.textPrimary;
      ctx.font = "700 14px Karla_700Bold";
      const nameLines = wrapText(ctx, s.name, COL_WIDTH - 16).slice(0, 2);
      let ny = photoY + PHOTO_SIZE + 18;
      for (const line of nameLines) {
        ctx.fillText(line, x + COL_WIDTH / 2, ny);
        ny += 16;
      }

      ctx.fillStyle = COLORS.accent;
      ctx.font = "700 15px Karla_700Bold";
      ctx.fillText(`K${s.price}`, x + COL_WIDTH / 2, y + CARD_H - 10);
    }
    y += CARD_H + GUTTER;
  }

  return y;
}

export async function exportPricelistPng(services: Service[], settings: Settings) {
  if (Platform.OS !== "web") {
    throw new Error("Downloading the pricelist is only available on the web version right now.");
  }

  const massage = services.filter((s) => s.category === "massage");
  const beauty = services.filter((s) => s.category === "beauty");

  const [logoImg, ...photoImgs] = await Promise.all([
    loadImage(settings.logo),
    ...services.map((s) => loadImage(s.photo)),
  ]);
  const photoMap = new Map(services.map((s, i) => [s.id, photoImgs[i]]));
  const withPhotos = (list: Service[]) => list.map((s) => ({ ...s, photoImg: photoMap.get(s.id) || null }));

  const websiteUrl = "https://kabwespa.com";
  const scale = 2;
  const qrPixelSize = 150 * scale;
  const QRCode = await import("qrcode");
  const qrDataUrl = await QRCode.toDataURL(websiteUrl, {
    width: qrPixelSize,
    margin: 0,
    color: { dark: "#171B18", light: "#F3F0E7" },
  });
  const qrImg = await loadImage(qrDataUrl);

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const measureCanvas = document.createElement("canvas");
  const mctx = measureCanvas.getContext("2d")!;
  mctx.font = "400 14px Karla_400Regular";
  const contactLine = [settings.centerPhone, ...(settings.whatsappNumbers || [])].filter(Boolean).join("   ·   ");
  const locationLines = settings.location ? wrapText(mctx, settings.location, WIDTH - PADDING * 2) : [];

  let totalHeight = 0;
  totalHeight += 176; // header
  totalHeight += 44 + 20 + sectionRows(massage.length) * (CARD_H + GUTTER); // massage band + grid
  totalHeight += 44 + 20 + sectionRows(beauty.length) * (CARD_H + GUTTER); // beauty band + grid
  totalHeight += 44 + 20; // visit us band
  totalHeight += 24 + locationLines.length * 20 + 20; // contact lines
  totalHeight += 150 + 60; // qr block
  totalHeight += PADDING;

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH * scale;
  canvas.height = totalHeight * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WIDTH, totalHeight);

  let y = PADDING;

  if (logoImg) {
    const size = 56;
    const lx = WIDTH / 2 - size / 2;
    roundRectPath(ctx, lx, y, size, size, size / 2);
    ctx.save();
    ctx.clip();
    const scaleImg = Math.max(size / logoImg.width, size / logoImg.height);
    const dw = logoImg.width * scaleImg;
    const dh = logoImg.height * scaleImg;
    ctx.drawImage(logoImg, lx - (dw - size) / 2, y - (dh - size) / 2, dw, dh);
    ctx.restore();
    y += size + 14;
  }

  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.textPrimary;
  ctx.font = "700 32px PlayfairDisplay_700Bold";
  ctx.fillText("The Kabwe Spa", WIDTH / 2, y + 28);
  y += 38;

  ctx.fillStyle = COLORS.textSecondary;
  ctx.font = "500 13px Karla_500Medium";
  ctx.fillText("ZARAH'S MASSAGE SPA · HIGHRIDGE, KABWE", WIDTH / 2, y);
  y += 30;

  y = drawSectionBand(ctx, "Massage", y);
  y = drawServiceGrid(ctx, withPhotos(massage), y);
  y += 4;

  y = drawSectionBand(ctx, "Beauty", y);
  y = drawServiceGrid(ctx, withPhotos(beauty), y);
  y += 4;

  y = drawSectionBand(ctx, "Visit Us", y);

  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.textPrimary;
  ctx.font = "600 15px Karla_500Medium";
  ctx.fillText(contactLine, WIDTH / 2, y);
  y += 24;

  ctx.fillStyle = COLORS.textSecondary;
  ctx.font = "500 14px Karla_500Medium";
  for (const line of locationLines) {
    ctx.fillText(line, WIDTH / 2, y);
    y += 20;
  }
  y += 26;

  const qrBoxSize = 150;
  const qrBoxX = WIDTH / 2 - qrBoxSize / 2;
  roundRectPath(ctx, qrBoxX, y, qrBoxSize, qrBoxSize, 14);
  ctx.fillStyle = COLORS.textPrimary;
  ctx.fill();
  if (qrImg) {
    ctx.imageSmoothingEnabled = false;
    const pad = 10;
    ctx.drawImage(qrImg, qrBoxX + pad, y + pad, qrBoxSize - pad * 2, qrBoxSize - pad * 2);
    ctx.imageSmoothingEnabled = true;
  }
  y += qrBoxSize + 18;

  ctx.fillStyle = COLORS.textSecondary;
  ctx.font = "500 13px Karla_500Medium";
  ctx.fillText("Scan to visit us online", WIDTH / 2, y);
  y += 22;
  ctx.fillStyle = COLORS.accent;
  ctx.font = "700 17px Karla_700Bold";
  ctx.fillText("kabwespa.com", WIDTH / 2, y);

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not generate the pricelist image");

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `the-kabwe-spa-pricelist-${new Date().toISOString().slice(0, 10)}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
