# TPMS, AlgoBrain and EasyShield covers

This extension was prepared from the supplied local source on 4 October 2026.
Read current code before revising a figure. Do not run training or modify those
source projects. The Matplotlib bases provide content; imagegen transfers the
accepted scientific-panel rendering style. Preserve original thumbnails in
Abstract when replacing a cover.

## TPMS Studio

Primary source: `tpms_generator.py` and `GUI_API.py` in the supplied TPMS Academy
repository. The desktop pipeline differs from its React educational viewer.

- `GenerationWorker` is a QThread invoking `TPMSGeneratorAPI.generate`. Its
  `finished` signal returns the result; do not invent a `result_ready` API.
- Main presets: Gyroid, Primitive, Diamond, IWP, Neovius and BCC. Do not substitute
  Fischer–Koch S or assume additional templates follow the same frequency adapter.
- Frequencies are `2*pi*n_a/L_a`. The main field subtracts C once. The retained
  material is `S=tau/2-abs(F) >= 0`; marching cubes extracts S=0, not F=0 directly.
- `wall_thickness` controls a field interval. It is not a signed-distance offset
  and must not be illustrated as a constant physical tau/2 dimension on the mesh.
- Pad one layer of S=-1 on every axis, subtract one from extracted grid vertices,
  then multiply by L_a/(r_a-1). Inclusive grid endpoints require r-1. Keep cell
  counts n separate from grid counts r. Padding caps can extend the mesh bounds.
- Automatic resolution uses target bytes /50, a 0.45 triangles/voxel estimate,
  a 20*n_max floor and a 300 cap. The cap wins; explicit resolution bypasses it.
  No automatic mesh decimation is performed by this path.
- Merge vertices, fix normals, report watertight and Euler characteristic.
  The field named `genus` stores Euler number, not generally genus. Success and
  export do not impose a watertight gate. Advanced validation hooks are not proof
  they run. The model loader is a stub; procedural formulas are not trained ML.

Two figures: desktop software workflow and implicit-field/band/padding/meshing
construction. Useful richness comes from scalar-field contours, sample lattices,
mesh triangles, boundary cross-sections and a shared edge with two incident faces.
Do not confuse pores or tunnels with missing boundary faces.

A source-copy check produced six closed meshes at grid48³, cells2³, domain20mm³,
C=0 and band0.5. Counts are recorded in the paper. These checks validate that
configuration, not every custom expression or printer profile. A future rerun
must record its own result. The original engine hash was unchanged.

## AlgoBrain

Read `Project Mind Controller/AlgoBrain/simple_data_sender.ino` and
`algobrain_visualizer.py`, the IR LED controller sketch, and
`codes/final_reciver_AlgoBrain/final_reciver_AlgoBrain.ino` in the supplied archive.
Project notes and original enclosure photograph support the functional analog
path: forehead/ear electrodes, TL074 differential input, high-pass, gain, low-pass,
custom PCB, Arduino A0. Draw functional op-amp symbols, not invented wired circuits
with plausible-looking but incorrect positive/negative feedback. Do not infer
gain or cutoff values from those roles.

- Sender: 1e6/500 microsecond timer, 500Hz target, 115200baud. Serial is ASCII CSV
  raw integer / filtered value printed to four decimals / cycle0..999, plus a
  separate CYCLE_RESET marker. No start byte, CRC, binary packet or int16 layout.
- Four causal SOS use eight persistent delays. They are not zero-phase and should
  not be named notch/smoothing without analyzing the actual coefficients.
- Desktop reader -> queue -> 2500-element deques. Last256 filtered samples,
  Hann window, FFT, assumed500Hz frequency bins, displayed0..50Hz. CSV stores host
  timestamp, raw, filtered, cycle and event label, not spectral bins. Queue and
  recording list are not bounded by the plot history. The displayed SNR formula
  is not a calibrated clean-signal/noise measurement.
- IR variant: 1e7/500 timer =20ms (nominal50Hz), integer filter output, rectified
  rolling128 mean, integer division before sensitivity factor4, threshold>13.
  Two NEC sends with two blocking200ms delays. Avoid invented NEC frame durations.
- Receiver refreshes lastSignalTime for every decoded frame. Re-arm after >5s
  without a frame, not a fixed5s from the initial trigger. Command comparison is
  commented out. No acknowledged delivery or command authentication is implied.
- Distinguish sender/analysis and controller as separate variants/protocols.
  Signal amplitude does not identify thoughts or separate EEG from EMG/artifacts.
  Event labels are manual recordings, not a trained classifier.

Two article figures: functional bio-amplifier hardware; two-row software diagram
with separate serial analysis and IR-control branches. Replacement cover uses
the WindWeave scientific panel style with no NVIDIA/CUDA or ML imagery. Any
waveform or FFT inset is labeled illustrative and avoids calibrated scales.
Remove Analysis->Control arrows: the code paths are parallel variants.

## EasyShield replacement cover

Preserve the old thumbnail in Abstract and its demonstration video in the gallery.
Replace the cover with five scientific panels: source data, offline curation,
training, live inference and liveness gate. NVIDIA/CUDA is requested technology
branding on this cover only; no certificate or endorsement claim.

The reviewed model uses detection outputs with binary real/fake semantics, not
three output classes live/print/replay. Printed faces and replays are examples of
fake presentation attacks. MTCNN extraction is offline, Haar localization is live.
Do not invent face alignment or112px crops. Use actual augmentation categories,
normalized YOLO labels, image-level80/10/10 split, live contextual crop resized
640², and Linux five-frame confidence-filtered vote. Strict real>fake aggregation
is not calibrated identity recognition. Identity remains downstream.

Do not copy WindWeave's toy99/117/6 counts into a curation table. Avoid fabricated
dataset sizes, confidence scores and training curves. Source-provided benchmark
statistics remain attributed in the paper rather than invented for a cover.

## Correction and integration

The first generation in this extension added precisely the errors listed above:
wrong TPMS preset/grid spacing, physical thickness arrows, imaginary op-amp wiring,
binary AlgoBrain packet fields, calibrated analog values and three-class liveness.
Use these invariants in first-pass prompts, then inspect again. Corrections use
current draft as image1, deterministic base as image2, accepted cover as image3
style-only. Preserve successful composition while correcting false content.

Public article assets use `research/*-styled.webp`; fresh covers use
`public/images/projects/*-paper-cover.webp`. Record Sharp metadata and use exact
dimensions in ProjectFigure. The papers have seven section headings and native
KaTeX. Extend the browser suite to verify all figures, preserved Abstract artwork,
replacement cover, keyboard gallery navigation, focus restoration and phone math.
All publishing remains withheld until the owner explicitly authorizes it.
