"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowUpRight, Award, FileBadge, LockKeyhole, Maximize2, X } from "lucide-react";
import type { Certificate, CertificateSlot } from "@/lib/content-schema";
import styles from "./ielts-certificate.module.css";
import viewer from "./certificate-viewer.module.css";

function IeltsCertificate({ item, compact = false }: { item: Certificate; compact?: boolean }) {
  const [band, level] = item.summary.split(" · ");
  return (
    <div className={`${styles.paper}${compact ? ` ${styles.compact}` : ""}`}>
      <div className={styles.brandRow}>
        <Image className={styles.logo} src="/images/brands/ielts-logo.webp" alt="IELTS" width={640} height={241} sizes="160px" />
        <span className={styles.previewLabel}>Public result summary</span>
      </div>
      <div className={styles.heading}>
        <p>English language qualification</p>
        <h3>{item.title}</h3>
        {!compact && <span>Test result preview</span>}
      </div>
      <div className={styles.result}>
        <span className={styles.band}>{band.replace(/ (\d+(?:\.\d+)?)$/, " ")}<strong>{band.match(/\d+(?:\.\d+)?$/)?.[0]}</strong></span>
        {level && <><span className={styles.divider}> · </span><span className={styles.level}>{level}</span></>}
      </div>
      <dl className={styles.details}>
        <div><dt>Test date</dt><dd>{item.date}</dd></div>
        {!compact && item.reportNumber && <div><dt>Test Report Form number</dt><dd><code>{item.reportNumber}</code></dd></div>}
      </dl>
      <div className={styles.privacy}>
        <LockKeyhole size={15} aria-hidden="true" />
        <p>{compact ? "Full report kept private" : "Public summary only. The original Test Report Form is kept private."}</p>
      </div>
    </div>
  );
}

export function CertificateGallery({
  items,
  slots,
}: {
  items: Certificate[];
  slots: CertificateSlot[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Certificate | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const close = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dialog.current?.close();
      return;
    }
    setIsClosing(true);
  };
  const open = (item: Certificate) => {
    setIsClosing(false);
    setSelected(item);
    dialog.current?.showModal();
  };
  return (
    <section
      id="certificates"
      className="section certificates-section"
      aria-labelledby="certificates-heading"
    >
      <div className="container">
        <div className="story-heading certificates-heading">
          <div>
            <h2 id="certificates-heading">Official Certificates</h2>
          </div>
          <p>
            Formal qualifications and public scans, kept separate from the project stories
            above.
          </p>
        </div>
        <div className="certificate-grid">
          {items.map((item) => (
            <article className={`certificate-card${item.image ? " certificate-image-card" : ""}`} key={item.id}>
              <button
                className={`certificate-preview${item.id === "ielts" ? ` ${styles.thumbnail}` : ""}`}
                onClick={() => open(item)}
                aria-label={`Enlarge ${item.title}`}
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.alt}
                    width={item.width ?? 1400}
                    height={item.height ?? 1800}
                    sizes="(max-width: 767px) 100vw, 50vw"
                  />
                ) : item.id === "ielts" ? (
                  <IeltsCertificate item={item} compact />
                ) : (
                  <div className="credential-summary">
                    <FileBadge size={26} strokeWidth={1.3} aria-hidden="true" />
                    <h3>{item.title}</h3>
                    <b>{item.summary}</b>
                    <small>{item.reportNumber ? "Verification reference available" : "Public scan coming soon"}</small>
                  </div>
                )}
                <span className="preview-enlarge" aria-hidden="true">
                  <Maximize2 size={18} />
                </span>
              </button>
              <div className="certificate-copy">
                <p className="eyebrow">
                  {[item.issuer, item.date].filter(Boolean).join(" · ")}
                </p>
                {item.image && (
                  <>
                    <h3>{item.title}</h3>
                  </>
                )}
                {!item.image && <button className="text-link" onClick={() => open(item)}>
                  View details
                  <ArrowUpRight size={16} />
                </button>}
              </div>
            </article>
          ))}
          {slots.map((slot, index) => (
            <article className="certificate-card certificate-pending" key={slot.id}>
              <div className="certificate-placeholder" aria-hidden="true">
                {index === 0 ? (
                  <FileBadge size={32} strokeWidth={1.2} />
                ) : (
                  <Award size={32} strokeWidth={1.2} />
                )}
              </div>
              <div className="certificate-copy">
                <h3>{slot.title}</h3>
                <p>{slot.description}</p>
              </div>
            </article>
          ))}
        </div>
        <dialog
          ref={dialog}
          className={`certificate-dialog ${viewer.dialog} ${viewer.motion}${selected?.id === "ielts" ? ` ${viewer.resultDialog}` : ""}`}
          aria-labelledby="certificate-viewer-title"
          data-closing={isClosing ? "true" : undefined}
          onCancel={(event) => {
            event.preventDefault();
            close();
          }}
          onAnimationEnd={(event) => {
            if (event.target !== event.currentTarget || !isClosing) return;
            dialog.current?.close();
            setIsClosing(false);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Tab") return;
            const targets = [
              ...event.currentTarget.querySelectorAll<HTMLElement>(
                'button:not(:disabled), a[href], [tabindex="0"]',
              ),
            ];
            const first = targets[0];
            const last = targets.at(-1);
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div className="viewer-content">
            <div className="viewer-header">
              <div>
                <h3 id="certificate-viewer-title">{selected?.title}</h3>
              </div>
              <button
                className="viewer-close"
                onClick={close}
                aria-label="Close certificate viewer"
                title="Close preview (Esc)"
                autoFocus
              >
                <X size={22} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>
            {selected && (
              <div className={viewer.body}>
                {selected.image ? (
                  <div className={viewer.document}>
                  <Image
                    className="viewer-image"
                    src={selected.image}
                    alt={selected.alt}
                    width={selected.width ?? 1400}
                    height={selected.height ?? 1800}
                    sizes="(max-width: 767px) 95vw, 900px"
                  />
                  </div>
                ) : selected.id === "ielts" ? (
                  <div className={styles.preview}>
                    <IeltsCertificate item={selected} />
                  </div>
                ) : (
                  <div className="viewer-summary">
                    <FileBadge size={48} strokeWidth={1.2} aria-hidden="true" />
                    <p className="eyebrow">{selected.issuer}</p>
                    <strong>{selected.summary}</strong>
                    <p>Test taken {selected.date}</p>
                    {selected.reportNumber && (
                      <p>
                        Test Report Form number<br />
                        <code>{selected.reportNumber}</code>
                      </p>
                    )}
                    <p className="viewer-note">
                      {selected.reportNumber
                        ? "Registered organisations can verify this reference through the IELTS Results Service. The full report is kept private."
                        : "This is a text summary of the qualification. A public certificate scan has not been added yet."}
                    </p>
                  </div>
                )}
                {selected.id === "ielts" && selected.url ? (
                  <div className={styles.verification}>
                    <p>Registered organisations can verify this result using the report number above.</p>
                    <a href={selected.url} target="_blank" rel="noreferrer" className={styles.verifyLink}>
                      IELTS verification for organisations <ArrowUpRight size={17} aria-hidden="true" />
                    </a>
                    <span>Opens the official IELTS website in a new tab</span>
                  </div>
                ) : selected.url && (
                  <a
                    href={selected.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-link"
                  >
                    {selected.reportNumber ? "IELTS verification for organisations" : "Verify credential"}
                    <ArrowUpRight size={16} />
                  </a>
                )}
              </div>
            )}
            <div className={viewer.footer}>
              <span>{selected?.image ? "Original certificate scan" : "Public qualification summary"}</span>
              <span><kbd>Esc</kbd> to close</span>
            </div>
          </div>
        </dialog>
      </div>
    </section>
  );
}
