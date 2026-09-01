import { Platform } from "react-native";
import { Service, Settings } from "../api/types";

const COLORS = {
  background: "#171B18",
  surface: "#20241F",
  surfaceMuted: "#262B24",
  border: "#333A30",
  textPrimary: "#F3F0E7",
  textSecondary: "#A6A499",
  primary: "#4A6350",
  accent: "#C9A66B",
  accentSoft: "#2C3327",
};

const WIDTH = 900;
const PADDING = 48;
const CARD_H = 92;
const CARD_GAP = 14;
const PHOTO_SIZE = 72;

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

async function drawSection(
  ctx: CanvasRenderingContext2D,
  title: string,
  services: (Service & { photoImg: HTMLImageElement | null })[],
  startY: number
): Promise<number> {
  let y = startY;
  ctx.fillStyle = COLORS.accent;
  ctx.font = "700 15px Karla_700Bold";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(title.toUpperCase(), PADDING, y);
  y += 30;

  const sorted = [...services].sort((a, b) => a.price - b.price);

  for (const s of sorted) {
    roundRectPath(ctx, PADDING, y, WIDTH - PADDING * 2, CARD_H, 14);
    ctx.fillStyle = COLORS.surface;
    ctx.fill();
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    const photoX = PADDING + 10;
    const photoY = y + (CARD_H - PHOTO_SIZE) / 2;
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

    const textX = photoX + PHOTO_SIZE + 20;
    ctx.fillStyle = COLORS.textPrimary;
    ctx.font = "700 19px PlayfairDisplay_700Bold";
    ctx.fillText(s.name, textX, y + 38);

    ctx.fillStyle = COLORS.accent;
    ctx.font = "700 17px Karla_700Bold";
    ctx.fillText(`K${s.price}`, textX, y + 64);

    y += CARD_H + CARD_GAP;
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
  const QRCode = await import("qrcode");
  const qrDataUrl = await QRCode.toDataURL(websiteUrl, {
    width: 240,
    margin: 1,
    color: { dark: "#171B18", light: "#F3F0E7" },
  });
  const qrImg = await loadImage(qrDataUrl);

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  // First pass on an offscreen measuring canvas to compute total height.
  const contactLines = [
    settings.centerPhone ? `Call: ${settings.centerPhone}` : null,
    ...(settings.whatsappNumbers || []).map((n, i) => `WhatsApp${i === 0 ? "" : " " + (i + 1)}: ${n}`),
  ].filter(Boolean) as string[];

  const measureCanvas = document.createElement("canvas");
  const mctx = measureCanvas.getContext("2d")!;
  mctx.font = "400 15px Karla_400Regular";
  const locationLines = settings.location ? wrapText(mctx, settings.location, WIDTH - PADDING * 2 - 20) : [];

  let totalHeight = 0;
  totalHeight += 210; // header
  totalHeight += 30 + massage.length * (CARD_H + CARD_GAP); // massage section title + cards
  totalHeight += 30 + beauty.length * (CARD_H + CARD_GAP); // beauty section title + cards
  totalHeight += 40; // divider spacing
  totalHeight += 34 + contactLines.length * 26 + locationLines.length * 22 + 20; // contact block
  totalHeight += 320; // qr block
  totalHeight += PADDING;

  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH * scale;
  canvas.height = totalHeight * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WIDTH, totalHeight);

  let y = PADDING;

  // Header
  if (logoImg) {
    const size = 64;
    const lx = WIDTH / 2 - size / 2;
    roundRectPath(ctx, lx, y, size, size, size / 2);
    ctx.save();
    ctx.clip();
    const scaleImg = Math.max(size / logoImg.width, size / logoImg.height);
    const dw = logoImg.width * scaleImg;
    const dh = logoImg.height * scaleImg;
    ctx.drawImage(logoImg, lx - (dw - size) / 2, y - (dh - size) / 2, dw, dh);
    ctx.restore();
    y += size + 16;
  } else {
    y += 8;
  }

  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.textPrimary;
  ctx.font = "700 34px PlayfairDisplay_700Bold";
  ctx.fillText("The Kabwe Spa", WIDTH / 2, y + 30);
  y += 42;

  ctx.fillStyle = COLORS.textSecondary;
  ctx.font = "500 14px Karla_500Medium";
  ctx.fillText("ZARAH'S MASSAGE SPA · HIGHRIDGE, KABWE", WIDTH / 2, y);
  y += 22;

  ctx.strokeStyle = COLORS.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2 - 60, y + 10);
  ctx.lineTo(WIDTH / 2 + 60, y + 10);
  ctx.stroke();
  y += 40;

  ctx.textAlign = "left";

  y = await drawSection(ctx, "Massage", withPhotos(massage), y);
  y += 16;
  y = await drawSection(ctx, "Beauty", withPhotos(beauty), y);
  y += 20;

  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PADDING, y);
  ctx.lineTo(WIDTH - PADDING, y);
  ctx.stroke();
  y += 34;

  ctx.fillStyle = COLORS.accent;
  ctx.font = "700 15px Karla_700Bold";
  ctx.fillText("VISIT US", PADDING, y);
  y += 30;

  ctx.font = "500 16px Karla_500Medium";
  for (const line of contactLines) {
    ctx.fillStyle = COLORS.textPrimary;
    ctx.fillText(line, PADDING, y);
    y += 26;
  }
  if (locationLines.length) {
    ctx.fillStyle = COLORS.textPrimary;
    ctx.fillText("Location:", PADDING, y);
    y += 22;
    ctx.fillStyle = COLORS.textSecondary;
    for (const line of locationLines) {
      ctx.fillText(line, PADDING, y);
      y += 22;
    }
  }
  y += 20;

  // QR block
  const qrBoxSize = 200;
  const qrBoxX = WIDTH / 2 - qrBoxSize / 2;
  roundRectPath(ctx, qrBoxX, y, qrBoxSize, qrBoxSize, 16);
  ctx.fillStyle = COLORS.textPrimary;
  ctx.fill();
  if (qrImg) {
    const pad = 16;
    ctx.drawImage(qrImg, qrBoxX + pad, y + pad, qrBoxSize - pad * 2, qrBoxSize - pad * 2);
  }
  y += qrBoxSize + 24;

  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.textSecondary;
  ctx.font = "500 14px Karla_500Medium";
  ctx.fillText("Scan to visit us online", WIDTH / 2, y);
  y += 26;
  ctx.fillStyle = COLORS.accent;
  ctx.font = "700 18px Karla_700Bold";
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
