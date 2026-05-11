"use client";

import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FaFilePdf } from "react-icons/fa";

const CONTENT_WIDTH_PX = 800;
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PDF_MARGIN_MM = 15;
const CONTENT_PADDING_PX = 40;
const SITE_LINK = "www.jetacademy.az";
/** html2canvas: böyük scale + PNG = çox MB; PDF-də kifayət qədər itkisiz JPEG */
const PDF_CANVAS_SCALE_CAP = 1.75;
const JPEG_QUALITY = 0.82;
const WATERMARK_MAX_WIDTH_PX = 480;
const PDF_HEADER_LOGO = "/logos/jetlogo.webp";
/** Əvvəlcə bu fayl yoxlanır (public kökündə); yoxdursa loqo watermark kimi istifadə olunur */
const PDF_WATERMARK_BG = "/background.png";

const PAGE_HEIGHT_PX = Math.floor((A4_HEIGHT_MM * CONTENT_WIDTH_PX) / A4_WIDTH_MM);

function sanitizePdfFileName(raw: string): string {
  const cleaned = raw
    .replace(/[<>:"/\\|?*]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned.length > 0 ? cleaned : "document";
}

function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll("img"));
  return Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
          setTimeout(done, 10_000);
        })
    )
  ).then(() => undefined);
}

function absolutizeUrlInCssUrls(css: string, origin: string): string {
  return css.replace(
    /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi,
    (_match, rawPath: string) => {
      const path = String(rawPath).trim();
      if (
        path.startsWith("data:") ||
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("//")
      ) {
        return `url("${path}")`;
      }
      const abs = path.startsWith("/") ? `${origin}${path}` : `${origin}/${path}`;
      return `url("${abs}")`;
    }
  );
}

function prepareClonedTreeForCapture(clonedRoot: HTMLElement, origin: string) {
  clonedRoot.querySelectorAll("img").forEach((node) => {
    const img = node as HTMLImageElement;
    const srcAttr = img.getAttribute("src");
    if (!srcAttr || srcAttr.startsWith("data:")) return;
    if (/^https?:\/\//i.test(srcAttr)) return;
    const abs = srcAttr.startsWith("/") ? `${origin}${srcAttr}` : `${origin}/${srcAttr}`;
    img.setAttribute("src", abs);
  });

  clonedRoot.querySelectorAll("[style]").forEach((node) => {
    const el = node as HTMLElement;
    const style = el.getAttribute("style");
    if (!style || !/background/i.test(style)) return;
    const next = absolutizeUrlInCssUrls(style, origin);
    if (next !== style) el.setAttribute("style", next);
  });
}

interface PdfDownloadButtonProps {
  title: string;
  description: string;
  buttonText?: string;
  loadingText?: string;
  fileName?: string;
  /** Admin/contact məlumatı — PDF alt sol künc */
  contactPhone?: string;
  /** @deprecated — əvəzinə contactPhone */
  phoneNumber?: string;
}

export default function PdfDownloadButton({
  title,
  description,
  buttonText = "PDF formatında yüklə",
  loadingText = "Yüklənir...",
  fileName,
  contactPhone,
  phoneNumber,
}: PdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const finalFileName = sanitizePdfFileName(fileName ?? title);
  const phoneTrim =
    (typeof contactPhone === "string" ? contactPhone : typeof phoneNumber === "string" ? phoneNumber : "")
      .trim();

  const loadImage = (absoluteSrc: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const attempt = (useCors: boolean) => {
        const img = new Image();
        if (useCors) img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => {
          if (useCors) attempt(false);
          else reject(new Error(`Image fail: ${absoluteSrc}`));
        };
        img.src = absoluteSrc;
      };
      attempt(true);
    });

  function downscaleImageToCanvas(img: HTMLImageElement, maxWidth: number): HTMLCanvasElement {
    const iw = img.naturalWidth || img.width || maxWidth;
    const ih = img.naturalHeight || img.height || 1;
    const ratio = iw ? ih / iw : 1;
    const w = iw > maxWidth ? maxWidth : iw;
    const h = Math.max(1, Math.round(w * ratio));
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const cx = c.getContext("2d");
    if (cx) {
      cx.imageSmoothingEnabled = true;
      cx.imageSmoothingQuality = "medium";
      cx.drawImage(img, 0, 0, w, h);
    }
    return c;
  }

  async function resolveWatermarkSource(origin: string): Promise<HTMLCanvasElement | HTMLImageElement | null> {
    const candidates = [`${origin}${PDF_WATERMARK_BG}`, `${origin}${PDF_HEADER_LOGO}`];
    for (const url of candidates) {
      try {
        const wm = await loadImage(url);
        return downscaleImageToCanvas(wm, WATERMARK_MAX_WIDTH_PX);
      } catch {
        continue;
      }
    }
    return null;
  }

  const handleDownload = async () => {
    const element = printRef.current;
    if (!element || typeof window === "undefined") return;
    const origin = window.location.origin;
    setIsGenerating(true);
    const modifiedElements: { el: HTMLElement; originalMargin: string }[] = [];

    try {
      await waitForImages(element);

      const contentDiv = element.querySelector(".pdf-render-content");
      if (contentDiv) {
        const containerRect = element.getBoundingClientRect();
        const blocks = Array.from(contentDiv.children) as HTMLElement[];
        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i];
          const rect = block.getBoundingClientRect();
          const relTop = rect.top - containerRect.top;
          const relBottom = rect.bottom - containerRect.top;
          const startPage = Math.floor(relTop / PAGE_HEIGHT_PX);
          const endPage = Math.floor((relBottom - 1) / PAGE_HEIGHT_PX);
          if (startPage < endPage) {
            let pushTarget: HTMLElement = block;
            let pushIndex = i;
            while (pushIndex > 0) {
              const prev = blocks[pushIndex - 1];
              const prevTop = prev.getBoundingClientRect().top - containerRect.top;
              if (Math.floor(prevTop / PAGE_HEIGHT_PX) !== startPage) break;
              if (/^H[1-6]$/.test(prev.tagName)) {
                pushTarget = prev;
                pushIndex--;
              } else break;
            }
            const nextPageTop = (startPage + 1) * PAGE_HEIGHT_PX;
            const targetTop = pushTarget.getBoundingClientRect().top - containerRect.top;
            const pushDown = nextPageTop - targetTop + 20;
            if (!modifiedElements.some((e) => e.el === pushTarget)) {
              modifiedElements.push({
                el: pushTarget,
                originalMargin: pushTarget.style.marginTop,
              });
            }
            pushTarget.style.marginTop = `${pushDown}px`;
          }
        }

        const footer = element.querySelector(".pdf-render-footer") as HTMLElement | null;
        if (footer) {
          const rect = footer.getBoundingClientRect();
          const relTop = rect.top - containerRect.top;
          const relBottom = rect.bottom - containerRect.top;
          const startPage = Math.floor(relTop / PAGE_HEIGHT_PX);
          const endPage = Math.floor((relBottom - 1) / PAGE_HEIGHT_PX);
          if (startPage < endPage) {
            const nextPageTop = (startPage + 1) * PAGE_HEIGHT_PX;
            const pushDown = nextPageTop - relTop + 20;
            if (!modifiedElements.some((e) => e.el === footer)) {
              modifiedElements.push({
                el: footer,
                originalMargin: footer.style.marginTop,
              });
            }
            footer.style.marginTop = `${pushDown}px`;
          }
        }
      }

      const scale = Math.min(
        PDF_CANVAS_SCALE_CAP,
        Math.max(1, window.devicePixelRatio || 1)
      );

      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: "#ffffff",
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        onclone: (_clonedDoc, clonedElement) => {
          prepareClonedTreeForCapture(clonedElement, origin);
        },
      });

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const contentWidthMm = pdfWidth - 2 * PDF_MARGIN_MM;
      const pageHeightPx = Math.floor((A4_HEIGHT_MM * imgWidth) / A4_WIDTH_MM);

      const watermarkSource = await resolveWatermarkSource(origin);

      for (let y = 0, pageIndex = 0; y < imgHeight; y += pageHeightPx, pageIndex++) {
        const contentH = Math.min(pageHeightPx, imgHeight - y);

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = imgWidth;
        pageCanvas.height = pageHeightPx;
        const ctx = pageCanvas.getContext("2d");
        if (!ctx) continue;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, imgWidth, pageHeightPx);
        ctx.drawImage(canvas, 0, y, imgWidth, contentH, 0, 0, imgWidth, contentH);

        if (watermarkSource) {
          ctx.save();
          ctx.globalAlpha = 0.08;
          const sw = watermarkSource.width;
          const sh = watermarkSource.height;
          const w = Math.min(imgWidth * 0.55, sw);
          const aspect = sw ? sh / sw : 1;
          const wmY = contentH / 2 - (w * aspect) / 2;
          ctx.drawImage(watermarkSource, (imgWidth - w) / 2, wmY, w, w * aspect);
          ctx.restore();
        }

        const pageData = pageCanvas.toDataURL("image/jpeg", JPEG_QUALITY);
        if (pageIndex > 0) pdf.addPage();
        const sliceHeightMm = (pageHeightPx * contentWidthMm) / imgWidth;
        pdf.addImage(
          pageData,
          "JPEG",
          PDF_MARGIN_MM,
          PDF_MARGIN_MM,
          contentWidthMm,
          sliceHeightMm
        );
      }

      pdf.save(`${finalFileName}.pdf`);
    } catch (error) {
      console.error("PDF yaradılmasında xəta:", error);
    } finally {
      modifiedElements.forEach(({ el, originalMargin }) => {
        el.style.marginTop = originalMargin;
      });
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="bg-[#F40F02] hover:bg-[#D00D02] disabled:bg-gray-400 text-white flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 w-fit"
      >
        <FaFilePdf className="w-5 h-5" />
        <span className="font-medium">{isGenerating ? loadingText : buttonText}</span>
      </button>

      {/* off-screen -9999px şəkilləri pozur; viewport-da gizli saxlayırıq */}
      <div
        aria-hidden
        className="pointer-events-none"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: CONTENT_WIDTH_PX,
          opacity: 0,
          zIndex: -20,
        }}
      >
        <div
          ref={printRef}
          style={{
            width: `${CONTENT_WIDTH_PX}px`,
            padding: `${CONTENT_PADDING_PX}px`,
            boxSizing: "border-box",
            background: "white",
            color: "#1a202c",
            fontFamily: "inherit",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: "15px",
              marginBottom: "30px",
              position: "relative",
              zIndex: 2,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="JET Academy"
              src={PDF_HEADER_LOGO}
              width={200}
              height={48}
              style={{
                width: "140px",
                height: "auto",
                maxHeight: "44px",
                objectFit: "contain",
                display: "block",
              }}
            />
            <span
              style={{
                fontFamily: "inherit",
                fontSize: "15px",
                fontWeight: 600,
                color: "#64748b",
              }}
            >
              {SITE_LINK}
            </span>
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <h1
              style={{
                fontSize: "38px",
                fontWeight: "800",
                marginBottom: "25px",
                color: "#0f172a",
                lineHeight: "1.2",
              }}
            >
              {title}
            </h1>

            <div
              className="pdf-render-content"
              style={{
                fontSize: "17px",
                lineHeight: "1.8",
                color: "#334155",
                textAlign: "justify",
              }}
              dangerouslySetInnerHTML={{ __html: description }}
            />

            <div
              className="pdf-render-footer"
              style={{
                borderTop: "1px solid #e2e8f0",
                marginTop: "28px",
                paddingTop: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "24px",
                color: "#64748b",
                fontFamily: "inherit",
                fontSize: "15px",
                fontWeight: 500,
                pageBreakInside: "avoid",
              }}
            >
              <span>{phoneTrim}</span>
              <span>{SITE_LINK}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .pdf-render-content h1,
        .pdf-render-content h2,
        .pdf-render-content h3,
        .pdf-render-content h4,
        .pdf-render-content h5,
        .pdf-render-content h6 {
          page-break-after: avoid;
          page-break-inside: avoid;
        }
        .pdf-render-content h2 {
          font-size: 26px !important;
          font-weight: 700 !important;
          margin-top: 30px !important;
          margin-bottom: 15px !important;
          color: #1e293b !important;
          display: block !important;
        }
        .pdf-render-content p {
          margin-bottom: 20px !important;
          display: block !important;
          page-break-inside: avoid;
        }
        .pdf-render-content p:last-child {
          margin-bottom: 0 !important;
        }
        .pdf-render-content strong {
          font-weight: 700 !important;
          color: #000 !important;
        }
        .pdf-render-content ul,
        .pdf-render-content ol {
          margin-top: 12px !important;
          margin-bottom: 20px !important;
          padding-left: 24px !important;
          display: block !important;
        }
        .pdf-render-content li {
          margin-bottom: 8px !important;
          display: list-item !important;
        }
      `}</style>
    </>
  );
}
