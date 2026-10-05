"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import { ArrowLeft, Download, Minus, Plus } from "lucide-react";
import type { PDFDocumentProxy, PDFPageProxy, RenderTask, TextLayer } from "pdfjs-dist";
import type { ResearchPaper } from "@/content/research";
import "pdfjs-dist/web/pdf_viewer.css";
import styles from "./research-reader.module.css";

function PdfPage({
  pdf,
  number,
  width,
  root,
}: {
  pdf: PDFDocumentProxy;
  number: number;
  width: number;
  root: RefObject<HTMLDivElement | null>;
}) {
  const sheet = useRef<HTMLDivElement>(null);
  const drawing = useRef<HTMLDivElement>(null);
  const [pdfPage, setPdfPage] = useState<PDFPageProxy | null>(null);
  const [nearby, setNearby] = useState(false);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(true);
  const original = pdfPage?.getViewport({ scale: 1 });
  const height = width * (original ? original.height / original.width : Math.sqrt(2));

  useEffect(() => {
    let cancelled = false;
    void pdf
      .getPage(number)
      .then((page) => {
        if (!cancelled) setPdfPage(page);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setBusy(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [pdf, number]);

  useEffect(() => {
    if (!sheet.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNearby(entry.isIntersecting),
      {
        root: root.current,
        rootMargin: "600px 0px",
      },
    );
    observer.observe(sheet.current);
    return () => observer.disconnect();
  }, [root]);

  useEffect(() => {
    const host = drawing.current;
    if (!pdfPage || !nearby || !host || !width) return;
    let cancelled = false;
    let render: RenderTask | undefined;
    let text: TextLayer | undefined;
    const canvas = window.document.createElement("canvas");
    const layer = window.document.createElement("div");
    layer.className = "textLayer";
    host.replaceChildren(canvas, layer);
    void (async () => {
      setBusy(true);
      setError(false);
      const original = pdfPage.getViewport({ scale: 1 });
      const scale = width / original.width;
      const viewport = pdfPage.getViewport({ scale });
      // Bound memory at high zoom; offscreen pages release their canvases.
      const ratio = Math.min(
        window.devicePixelRatio || 1,
        2,
        Math.sqrt(8_000_000 / (viewport.width * viewport.height)),
      );
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.setAttribute("aria-hidden", "true");
      host.style.setProperty("--scale-factor", String(scale));
      host.style.setProperty("--total-scale-factor", String(scale));
      render = pdfPage.render({
        canvas,
        viewport,
        transform: [ratio, 0, 0, ratio, 0, 0],
      });
      await render.promise;
      if (cancelled) return;
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const content = await pdfPage.getTextContent();
      if (cancelled) return;
      text = new pdfjs.TextLayer({
        textContentSource: content,
        container: layer,
        viewport,
      });
      await text.render();
      if (!cancelled) setBusy(false);
    })().catch(() => {
      if (!cancelled) {
        setError(true);
        setBusy(false);
      }
    });
    return () => {
      cancelled = true;
      render?.cancel();
      text?.cancel();
      host.replaceChildren();
      canvas.width = canvas.height = 0;
    };
  }, [pdfPage, nearby, width]);

  return (
    <div
      ref={sheet}
      className={styles.sheet}
      data-pdf-page={number}
      style={{ width, height }}
      role="group"
      aria-label={`Page ${number}`}
      aria-busy={busy}
    >
      <div ref={drawing} />
      {error && (
        <p className={styles.message} role="alert">
          This page could not be displayed. Use Download PDF to read the original.
        </p>
      )}
    </div>
  );
}

export function ResearchReader({ paper }: { paper: ResearchPaper }) {
  const stage = useRef<HTMLDivElement>(null);
  const lastScroll = useRef(0);
  const jumping = useRef(false);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState("1");
  const [editing, setEditing] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [width, setWidth] = useState(0);
  const [error, setError] = useState("");
  const [backHidden, setBackHidden] = useState(false);
  const total = pdf?.numPages ?? 0;

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      setWidth(Math.max(1, element.clientWidth - 24)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loading: ReturnType<typeof import("pdfjs-dist/legacy/build/pdf.mjs").getDocument> | undefined;
    void import("pdfjs-dist/legacy/build/pdf.mjs")
      .then(async (pdfjs) => {
        if (cancelled) return;
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.legacy.min.mjs";
        loading = pdfjs.getDocument({
          url: paper.file,
          cMapUrl: "/pdfjs/cmaps/",
          cMapPacked: true,
          standardFontDataUrl: "/pdfjs/standard_fonts/",
          wasmUrl: "/pdfjs/wasm/",
        });
        const document = await loading.promise;
        if (!cancelled) setPdf(document);
      })
      .catch(() => {
        if (!cancelled)
          setError("This paper could not be loaded. You can still download the PDF.");
      });
    return () => {
      cancelled = true;
      void loading?.destroy();
    };
  }, [paper.file]);

  const onScroll = () => {
    const element = stage.current;
    if (!element) return;
    const top = element.scrollTop;
    const delta = top - lastScroll.current;
    if (!jumping.current) {
      if (top < 12) setBackHidden(false);
      else if (Math.abs(delta) > 3) setBackHidden(delta > 0);
    }
    lastScroll.current = top;
    const bounds = element.getBoundingClientRect();
    const anchor = bounds.top + Math.min(bounds.height * 0.3, 180);
    const pages = [...element.querySelectorAll<HTMLElement>("[data-pdf-page]")];
    const atEnd = top > 0 && top + element.clientHeight >= element.scrollHeight - 2;
    const current = atEnd
      ? pages.at(-1)
      : (pages.find((item) => item.getBoundingClientRect().bottom > anchor) ??
        pages.at(-1));
    if (current) setPage(Number(current.dataset.pdfPage));
  };

  const go = (value: number) => {
    const number = Math.min(
      Math.max(Math.trunc(Number.isFinite(value) ? value : 1), 1),
      total || 1,
    );
    setDraft(String(number));
    setPage(number);
    const element = stage.current;
    const target = element?.querySelector<HTMLElement>(`[data-pdf-page="${number}"]`);
    if (!element || !target) return;
    jumping.current = true;
    // offsetTop stays in layout pixels when the whole portfolio is scaled.
    element.scrollTo({ top: target.offsetTop - 12, behavior: "instant" });
    lastScroll.current = element.scrollTop;
    requestAnimationFrame(() => {
      jumping.current = false;
    });
  };

  return (
    <section className={styles.reader} aria-label={`${paper.title} PDF reader`}>
      <div className={styles.backBar} data-hidden={backHidden}>
        <div>
          <Link
            href="/#research"
            className={styles.back}
            tabIndex={backHidden ? -1 : undefined}
          >
            <ArrowLeft size={15} aria-hidden="true" />
            <span>{paper.title}</span>
          </Link>
        </div>
      </div>
      <div className={styles.toolbar} role="group" aria-label="PDF reader controls">
        <label className={styles.pageLabel}>
          <input
            aria-label="Page number"
            type="number"
            min={1}
            max={total || 1}
            disabled={!total}
            value={editing ? draft : page}
            onFocus={() => {
              setDraft(String(page));
              setEditing(true);
            }}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => {
              go(Number(draft));
              setEditing(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
          />
          <span>of {total || "—"}</span>
        </label>
        <div className={styles.group}>
          <button
            onClick={() => setZoom((value) => Math.max(50, value - 25))}
            disabled={!total || zoom === 50}
            aria-label="Zoom out"
          >
            <Minus size={17} />
          </button>
          <select
            aria-label="Zoom level"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          >
            {[50, 75, 100, 125, 150, 175, 200, 225, 250].map((value) => (
              <option key={value} value={value}>
                {value}%
              </option>
            ))}
          </select>
          <button
            onClick={() => setZoom((value) => Math.min(250, value + 25))}
            disabled={!total || zoom === 250}
            aria-label="Zoom in"
          >
            <Plus size={17} />
          </button>
        </div>
        <a
          href={paper.file}
          download
          className={styles.download}
          aria-label="Download PDF"
        >
          <Download size={17} />
        </a>
      </div>
      <div
        className={styles.stage}
        ref={stage}
        onScroll={onScroll}
        tabIndex={0}
        role="region"
        aria-label="PDF pages"
      >
        {pdf &&
          width > 0 &&
          Array.from({ length: total }, (_, index) => (
            <PdfPage
              key={index + 1}
              pdf={pdf}
              number={index + 1}
              width={(width * zoom) / 100}
              root={stage}
            />
          ))}
        {!pdf && !error && (
          <p className={styles.message} role="status">
            Loading PDF…
          </p>
        )}
        {error && (
          <p className={styles.message} role="alert">
            {error}{" "}
            <a href={paper.file} download>
              Download PDF
            </a>
          </p>
        )}
      </div>
      {pdf && (
        <span className={styles.srOnly} role="status">
          Page {page} of {total}
        </span>
      )}
    </section>
  );
}
