/**
 * Static `public/` şəkillərini WebP formatına çevirərək ölçüləri kiçildir.
 * Sharp istifadə olunur. Orijinallar silinmir — komponentləri yenilənmiş
 * şəkillərə keçirmək üçün istifadə edirik.
 *
 * İstifadə:
 *   node scripts/compress-static-images.mjs
 */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PUBLIC_DIR = path.resolve(process.cwd(), "public");

/**
 * Kompressiya hədəfləri:
 * - `source`: orijinal fayl (public/ içindəki nisbi yol)
 * - `width`: responsive üçün maksimum eni (lazım olanda nümunələr daxil edilir)
 * - `quality`: WebP kalitesi (60–85 arası optimaldır)
 * - `output`: çıxış faylı (default: eyni ad, `.webp` uzantı ilə)
 */
const TARGETS = [
  { source: "boy.png", width: 900, quality: 78 },
  { source: "sayt5.jpg", width: 1200, quality: 75 },
  { source: "sayt2.jpg", width: 1200, quality: 75 },
  { source: "hero/laptop.png", width: 1000, quality: 80 },
  { source: "hero/rocket.png", width: 400, quality: 85 },
  { source: "hero/figma.png", width: 600, quality: 80 },
  { source: "image.png", width: 1200, quality: 75 },
  { source: "qiz1x1.jpg", width: 1200, quality: 75 },
  { source: "rasim.png", width: 900, quality: 78 },
  { source: "murad.png", width: 700, quality: 80 },
  { source: "qaqam.png", width: 700, quality: 80 },
];

const outputFor = (source) => {
  const ext = path.extname(source);
  return source.slice(0, -ext.length) + ".webp";
};

const exists = async (p) => {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
};

const run = async () => {
  const report = [];
  for (const target of TARGETS) {
    const srcAbs = path.join(PUBLIC_DIR, target.source);
    const outAbs = path.join(PUBLIC_DIR, outputFor(target.source));

    if (!(await exists(srcAbs))) {
      report.push({ source: target.source, status: "skip (missing)" });
      continue;
    }

    const srcStat = await fs.stat(srcAbs);
    await sharp(srcAbs)
      .resize({ width: target.width, withoutEnlargement: true })
      .webp({ quality: target.quality, effort: 5 })
      .toFile(outAbs);
    const outStat = await fs.stat(outAbs);

    report.push({
      source: target.source,
      output: outputFor(target.source),
      before: `${(srcStat.size / 1024).toFixed(1)} KB`,
      after: `${(outStat.size / 1024).toFixed(1)} KB`,
      saved: `${(((srcStat.size - outStat.size) / srcStat.size) * 100).toFixed(1)}%`,
    });
  }

  console.table(report);
};

run().catch((err) => {
  console.error("compress-static-images failed:", err);
  process.exit(1);
});
