"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowUpRight, Award, FileBadge, Maximize2, X } from "lucide-react";
import type { Certificate, CertificateSlot } from "@/lib/content-schema";
import { Eyebrow } from "./section-heading";

export function CertificateGallery({
  items,
  slots,
}: {
  items: Certificate[];
  slots: CertificateSlot[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Certificate | null>(null);
  const open = (item: Certificate) => {
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
            <Eyebrow>07 / Formal credentials</Eyebrow>
            <h2 id="certificates-heading">Official Certificates</h2>
          </div>
          <p>
            Formal qualifications and public scans, kept separate from the project stories
            above.
          </p>
        </div>
        <div className="certificate-grid">
          {items.map((item) => (
            <article className="certificate-card" key={item.id}>
              <button
                className="certificate-preview"
                onClick={() => open(item)}
                aria-label={`Enlarge ${item.title}`}
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 767px) 100vw, 33vw"
                  />
                ) : (
                  <div className="credential-summary">
                    <FileBadge size={26} strokeWidth={1.3} aria-hidden="true" />
                    <h3>{item.title}</h3>
                    <b>{item.summary}</b>
                    <small>Public scan coming soon</small>
                  </div>
                )}
                <span className="preview-enlarge" aria-hidden="true">
                  <Maximize2 size={18} />
                </span>
              </button>
              <div className="certificate-copy">
                <p className="eyebrow">
                  {item.issuer} · {item.date}
                </p>
                {item.image && (
                  <>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                  </>
                )}
                <button className="text-link" onClick={() => open(item)}>
                  View details
                  <ArrowUpRight size={16} />
                </button>
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
          className="certificate-dialog"
          aria-labelledby="certificate-viewer-title"
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
            if (event.target === event.currentTarget) dialog.current?.close();
          }}
        >
          <div className="viewer-content">
            <div className="viewer-header">
              <div>
                <p className="eyebrow">Credential details</p>
                <h3 id="certificate-viewer-title">{selected?.title}</h3>
              </div>
              <button
                className="viewer-close"
                onClick={() => dialog.current?.close()}
                aria-label="Close certificate viewer"
                autoFocus
              >
                <X size={22} />
              </button>
            </div>
            {selected && (
              <>
                {selected.image ? (
                  <Image
                    className="viewer-image"
                    src={selected.image}
                    alt={selected.alt}
                    width={1400}
                    height={1800}
                    sizes="(max-width: 767px) 95vw, 900px"
                  />
                ) : (
                  <div className="viewer-summary">
                    <FileBadge size={48} strokeWidth={1.2} aria-hidden="true" />
                    <p className="eyebrow">{selected.issuer}</p>
                    <strong>{selected.summary}</strong>
                    <p>Test taken {selected.date}</p>
                    <p className="viewer-note">
                      This is a text summary of the qualification. A public certificate
                      scan has not been added yet.
                    </p>
                  </div>
                )}
                {selected.url && (
                  <a
                    href={selected.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-link"
                  >
                    Verify credential
                    <ArrowUpRight size={16} />
                  </a>
                )}
              </>
            )}
          </div>
        </dialog>
      </div>
    </section>
  );
}
