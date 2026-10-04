# Thumbnail and explanatory-figure refinement

The owner rejected the dense EasyShield, WindWeave and AlgoBrain paper covers as
portfolio thumbnails. Preserve the rich scientific-panel style for article
figures, but do not repeat the full paper architecture in a small card image.

## Cover specification

- EasyShield: white 16:9 canvas; large title; modest NVIDIA/CUDA technology
  branding; authentic red/orange bear logo centered; five spacious examples,
  including one real live-camera face and four presentation attacks. Extract
  source frames from the existing anti-spoofing montage. Use short semantic
  labels, no fabricated confidences, benchmark numbers, tables or certificates.
- WindWeave: white 16:9 concept; weather-observation tiles flowing through CPU
  assembly into training batches and GPU execution. Three large labels only.
  The dense former cover remains a style/provenance resource, not active cover
  or gallery content. Streaming refers to training examples, not live weather.
- AlgoBrain: restore the original woman concept artwork as the card cover.
  Generate a different abstract illustration to avoid repeating the same image
  on scroll. No machine-learning, NVIDIA or CUDA branding. Caption conceptual
  hardware and waveforms as illustrative, not measured evidence.

## Evidence album

EasyShield's original overview remains prominently in Abstract. Immediately
below it, show the original training/workstation screenshots and demonstration
media through `ProjectAlbum`, using `MediaGallery`. The first six thumbnails are
visible, View more reveals the full album, and thumbnail clicks open the shared
in-page gallery. Do not substitute generated workbench art for documentary
evidence. Images keep their original captions/provenance.

## Source-grounded figure plans

FabricLens: (1) normalized labels and frozen-backbone/full-model adaptation;
(2) confidence filtering and NMS for localized textile defects; (3) path-keyed
cache, CPU inference worker and Tk main-loop redraw. Read `train.py`,
`inference.py`, `final/infrencer.py` from the original project without modifying
them. Input 640, batch16, workers4; freeze first ten layers in stage1, unfreeze
the entire model in stage2. Confidence0.25 and IoU0.45 are settings, not results.

Remote PC Power: (1) app/RTDB/Ethernet controller/momentary relay and separate
heartbeats; (2) reset confirmation, request gating, one-second pulse and retry.
Read production firmware and PC Node service in PCway-connector. Both heartbeat
paths write to RTDB, never to one another: controller15s, PC startup+5s.
The boolean requests a physical button press; it is not an explicit ON/OFF
command. Relay contacts bridge the motherboard power-button pins, not mains.

NiotoShield: (1) profile update/download/local embedding/cache/temporary-photo
cleanup; (2) liveness, identity and authorization with reject branches. Read
the GitHub firmware, especially `face_security.py`, rather than adopting older
diagram labels. Runtime identity threshold0.6 differs from README0.5. The Pi
runtime explicitly loads the liveness model on CPU. No GPU deployment claim.

## Corrections that must be checked visually

- Imagegen may label all layers as 0–9 during full-model fine-tuning. Remove
  that restriction; the head is trainable too. Shared input/batch/workers do
  not mean identical learning-rate or mixup configuration across stages.
- A candidate discarded below confidence0.25 must have a value below0.25.
  Schematic toy scores must be explicitly identified as examples.
- Generic dog/cat photos are wrong for textile inspection. Replace every
  thumbnail, path key and overlay with textile examples.
- A cache miss worker stores boxes back into the cache and schedules a UI
  update. Preserve both paths and the cache-hit path.
- A PC phone illustration must have a single Press power button action,
  not separate Power ON/OFF buttons. Code labels are command=true/false,
  not reset=true/false. Callback records a request; main loop times the pulse.
- Do not invent profile IDs or dates. Use abstract placeholders; embedding
  generation runs locally, after the cloud/local boundary.

Export inspected Matplotlib bases before imagegen; supply them as content
targets and the previous WindWeave panel image as style only. Save exact prompts
and corrections. Optimize final assets to WebP with Sharp, max1600 covers and
max1920 figures, preserve aspect ratio, record actual dimensions and bytes.
Use native KaTeX for article math and literal ProjectFigure attributes so the
renderer includes each figure in its shared gallery.

Reusable artifacts: [base generator](../scripts/render_refinement_bases.py),
[exact article prompts and corrections](thumbnail-refinement-prompts.json),
and [optimized asset dimensions and hashes](thumbnail-refinement-assets.json).
Run the generator with `--output-dir` pointing to an ignored working folder;
it never reads or changes source projects, invokes imagegen, or publishes assets.

Homepage selection is explicitly Plantini, AquaFlow, EasyShield, WindWeave,
SmartHart, AlgoBrain BCI, TPMS Studio. Keep catalogue order separate. Verify
homepage order, album expansion, gallery keyboard/focus behavior and responsive
figures in a real browser. All work remains local unless publishing is requested.
