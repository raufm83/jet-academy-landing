/**
 * Build əvvəli: `public/` içindəki seçilmiş mənbələri WebP-yə çevirir (sharp).
 * Mənbə yoxdursa xəbərdarlıq verir və davam edir — build dayandırılmır.
 *
 * İstifadə: npm run optimize:images
 * (prebuild avtomatik çağırır)
 */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PUBLIC_DIR = path.resolve(process.cwd(), "public");

/** @type {{ source: string; dest: string; maxWidth: number; quality: number }[]} */
const JOBS = [
  {
    source: "rasim.png",
    dest: "images/about/intro.webp",
    maxWidth: 1000,
    quality: 80,
  },
  {
    source: "qiz1x1.jpg",
    dest: "images/about/mission-vision.webp",
    maxWidth: 1000,
    quality: 80,
  },
  {
    source: "logos/JET_School_Yellowww.png",
    dest: "logos/JET_School_Yellowww.webp",
    maxWidth: 800,
    quality: 80,
  },
  /** JET Academy — header / schema logosu */
  {
    source: "logos/jetlogo.png",
    dest: "logos/jetlogo.webp",
    maxWidth: 800,
    quality: 82,
  },
];

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureDirForFile(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function run() {
  let ok = 0;
  let skipped = 0;

  for (const job of JOBS) {
    const srcAbs = path.join(PUBLIC_DIR, job.source);
    const destAbs = path.join(PUBLIC_DIR, job.dest);

    if (!(await pathExists(srcAbs))) {
      console.warn(
        `[optimize-public-assets] Mənbə tapılmadı (atlanılır): ${job.source}`
      );
      skipped++;
      continue;
    }

    try {
      await ensureDirForFile(destAbs);
      await sharp(srcAbs)
        .resize({
          width: job.maxWidth,
          withoutEnlargement: true,
        })
        .webp({ quality: job.quality, effort: 5 })
        .toFile(destAbs);
      ok++;
      console.log(`[optimize-public-assets] OK: ${job.source} → ${job.dest}`);
    } catch (err) {
      console.warn(
        `[optimize-public-assets] Xəta (${job.source}):`,
        err?.message || err
      );
      skipped++;
    }
  }

  console.log(
    `[optimize-public-assets] Bitdi: ${ok} çevrildi, ${skipped} atlandı/xəta.`
  );
}

run().catch((err) => {
  console.error("[optimize-public-assets] Gözlənilməz xəta:", err);
  process.exit(1);
});
