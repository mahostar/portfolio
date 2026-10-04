# Hardware, firmware, and classifier papers

This extension records the 2026-10-04 Plantini, AquaFlow, EasyShield, and SmartHart
work. It complements the WindWeave recipe; it does not change the accepted style.
Read current code before reusing any implementation fact. Preserve original
media and source projects, and keep publication local until explicitly authorized.

## From source to figure specification

1. Inspect existing project MDX, evidence catalogue, cover, app screenshots,
   videos, photos and CAD. Reuse actual interface evidence rather than inventing
   an app. A screenshot proves displayed controls, not the backend implementation.
2. Inspect the user's supplied source read-only. For public GitHub sources, record
   the commit and use file links pinned to it. A sparse, blob-filtered checkout
   in ignored `temp/` avoids downloading model weights or large training media.
3. Trace inputs, units, transformations, synchronization, invalid states, retained
   values, control ownership and failure behavior. Record implementation facts
   separately from author reports, analytical calculations and public background.
4. Choose figure count by explanatory need. This run used Plantini 7 (5 hardware,
   2 sensing/software), AquaFlow 5 (2 hardware, 3 sensing/software), EasyShield 3,
   and SmartHart 2. More figures are not automatically more informative.
5. Make a deterministic Matplotlib base per figure. Each base answers a specific
   question, has a title and panel labels, and encodes the exact causal structure.
   The bases are content fuel for imagegen, not the finished public images.
6. Supply the base first, the accepted WindWeave cover second as style only, then
   necessary original CAD/frame/photo/app references with explicit roles.
7. Inspect every result for factual drift, correct through imagegen, optimize the
   selected original bitmap, and integrate only the checked final output.

## CAD and video references without a fabrication recipe

For Plantini, inspect the existing tower-module rotation video and extract several
frames into an ignored task directory. This run used approximately one frame
every two seconds, scaled to a maximum width around 1100 pixels. Inspect the
frames individually; a selected cyan face in CAD is not simulated water. Choose
views that show the angled growing cup/socket and rim, not only an attractive
assembled overview. Combine these with the assembled tower/light and planted
tower photographs. The photos constrain silhouette, cups, module hierarchy,
base and curved external lighting arms; the author supplies the reserve function.

An example extraction, after verifying the actual input exists:

```powershell
ffmpeg -i public/videos/evidence/projects/plantini/manufacturing/tower-module-cad-video--085.mp4 -vf "fps=1/2,scale=1100:-2" temp/research-diagrams/cad-frames/module-%02d.png
```

Create the destination directory first. Do not run ffmpeg with a silent overwrite
flag against existing evidence. Extracting a frame is reference preparation;
the requested diagram enhancement still uses imagegen.

For AquaFlow, the supplied feeder has separate base, rotor, wall and lid STL
files; the filter has an STL body. Render read-only reference sheets with NumPy
and Matplotlib `Poly3DCollection`. The helper `render_cad_reference_sheets.py`
accepts a source root and output directory. It recognizes binary STL by the
80-byte header, 4-byte little-endian triangle count, and 50-byte triangle records,
and supports ASCII vertex records. Plot a sampled triangle mesh, compute framing
from the full bounds, use equal axis scale, turn off axes, and omit dimensions.
Keep components separately labeled. This preserves geometry without needing
the project's venv, CAD application, PyTorch or proprietary measurement libraries.

From the repository root, after resolving the Python executable and the current
owner-supplied CAD directory, run:

```powershell
& $diagramPython .agents/skills/research-diagram-imagegen/scripts/render_project_bases.py --output-dir temp/research-diagrams/project-bases
& $diagramPython .agents/skills/research-diagram-imagegen/scripts/render_cad_reference_sheets.py --source-root $cadReferenceRoot --output-dir temp/research-diagrams/cad-references
```

Both helpers refuse a non-empty output directory unless `--overwrite` is explicit.
The base helper exports seventeen PNG/SVG/PDF sets and its manifest inside the
chosen directory. Inspect each PNG before imagegen; references are supplied
separately, not implicitly loaded from a transient folder. The CAD helper reads
the original files only and writes two raster reference sheets. The implementation
was executed successfully against the supplied models during this run.

The rendered meshes are **geometry references**, not a validated water-flow model,
exact internal plumbing or license to publish a printable manufacturing design.
Use exploded hierarchy and functional cutaways, without wall thickness, port
dimensions, seal tolerances, electrode geometry or detailed assembly instructions.
Do not infer pumping, automatic feeding or filter efficacy merely from a mesh.

## Public explanation of proprietary sensing

The owner requested detailed operating principles without giving a cloning recipe.
Show the water/sensor interaction, alternating measurement principle, conductivity
interpretation, temperature context and validity-aware handoff. Generic public
relationships such as conductivity = cell factor × conductance and approximate
temperature/TDS conversion are appropriate. They are not the private calibration.

Keep excitation constants, timing values, electrode dimensions, pins, resistor or
capacitor values, fitted coefficients and circuit topology out of public diagrams,
prompts, article examples and this skill. Do not include credentials, database
identifiers or raw private source. Treat a sensor as a functional measurement block.
If signal traces illustrate alternating excitation, label them schematic; the
illustrated sine wave is not an assertion of the production waveform.

Conductivity/TDS is a bulk ionic indicator, not an ammonia, dissolved oxygen or
individual nutrient assay. A generic conversion depends on composition and
temperature. Mechanical solids capture, ammonium-binding mineral adsorption and
biological nitrification must be shown as different mechanisms. Do not convert
TDS directly into ammonia or impose an invented universal fish/crop threshold.

## Project-specific checked content

### Plantini

- Five hardware topics: tower/cup/base assembly; angled cup/root-water pocket;
  reservoir–tower recirculation; intermittent pump duty; plant sites and lighting.
- Two sensing/software topics: conductivity interpretation and sensor/controller/
  Firebase/app responsibilities, using the existing dashboard and crop configuration.
- One minute ON per hour is the author's operating description: duty 1/60 = 1.67%,
  59 minutes OFF, 24 minutes daily ON time. The ideal energy ratio 1/60 is pump-only
  at equal on-state power; it excludes lights, standby and startup effects.
- The author describes 10–24 hours of local reserve depending on plant uptake.
  Show a conditional water balance, not an invented endurance measurement.
- The supplied controller example requests readings and diagnostics over serial;
  readings include status, validity and quality. Production app/database source
  was not supplied. Firebase synchronization is author-described. Do not invent
  a schema, exact app subscriptions or raw command packets to fill that gap.
- The app shows TDS, temperature, pH, pump/light controls, crop configuration,
  calibration and Always/Normal/Eco modes. A pH UI card does not prove a pH firmware
  sensor path; mode names do not establish their exact pumping schedules.

### AquaFlow

- Hardware topics: fish-water recirculation/equipment and feed/waste/filtration,
  using the prototype, concept diagram and feeder/filter CAD references.
- Software topics: conductivity context, Nano–ESP32 pulse handoff, and cloud state
  ownership. Nano supplies TDS and temperature; ESP32 measures ultrasonic distance.
- The supplied sender is a custom single-wire pulse-width transport. The qualitative
  signal is idle HIGH → start LOW → one TDS HIGH plateau → separator LOW → one
  temperature HIGH plateau → end LOW → idle HIGH. Widths are schematic, without
  private constants. It is not UART, I²C, a multi-bit digital train or an ACK protocol.
- The inspected receiver checks the start duration and field timeouts. It does not
  validate the final marker as a checksum. Label the last receiver step “finish
  receive attempt,” not “validate end marker.” Link age >5 seconds marks Nano offline;
  retained numbers remain and must travel with freshness information.
- Core 1 handles the local loop; a Core 0 task performs cloud I/O. Measurement
  snapshots and HTTP requests have separate responsibilities. Do not draw sensor
  PATCH/network operations inside the local sensing core.
- The inspected revision uses Firestore REST: PATCH a sensor document and GET a
  separate desired-relay document. The configured targets are approximately one
  second, not measured end-to-end latency. “Firebase” does not by itself prove RTDB
  listeners, WebSockets or MQTT. The existing UI has separate connection badges.
- Requested pump/compressor/UV states are cloud-owned. The device applies changes
  without continually overwriting app choices. No autonomous threshold policy,
  hardware output confirmation, command ACK or stale-command interlock is inferred.
- Feeder CAD demonstrates development of portioning hardware, not a measured portion
  mass or verified automatic feeding controller in this ESP revision.

### EasyShield

- Inspected GitHub revision: `3afb0fe760e3d57b3a7d3e78d0977ebb9abce1de` in
  `mahostar/EasyShield_v2.5`. Figures: live contextual liveness gate, offline dataset
  workflow, five-frame vote aggregation/class-map contract.
- MTCNN is offline extraction/filtering; OpenCV DNN generates offline box labels;
  Haar cascade is live localization. Do not interchange these detectors.
- Crop padding = floor(1.5 × face width), clipped to the frame; input resize 640×640.
  Display rectangles have separate smaller padding. A tiny border is not a faithful
  depiction of the contextual crop unless its larger region is clipped by the frame.
- YOLO returns box classes/confidences, not a classification-head vector. Tables
  should use symbolic box/class/confidence entries, not invented face/phone classes
  or fabricated model probabilities.
- Current packaging shuffles images into 80/10/10 partitions. This is not documented
  as an identity/session-disjoint evaluation. Labels use normalized center and size.
- Linux scan accepts confidence-filtered predictions from up to five frames; REAL
  only when real votes exceed fake votes. Ties/no accepted predictions take the
  attack aggregation branch; capture/face errors can occur before aggregation.
- Dataset/benchmark assumes 0=fake,1=real, while live scripts assume 0=real,1=fake.
  Depict this discrepancy and the required checkpoint metadata check; do not draw
  the contradictory mappings as an already-consistent deployed contract.
- Identity recognition is downstream. Repository-reported results are not new
  benchmarks or evidence of identification/security guarantees.

### SmartHart

- Inspected GitHub revision: `b958da897c5e1b6a9e06710cfae44f75dfc726e5` in
  `mahostar/SmartHart`. Figures: sequence/model contract and online window/UI state.
- Five simulated measurements plus pulse pressure and guarded heart-rate/systolic
  ratio yield seven features. Window length ten; input (B,10,7), online B=1.
- BiLSTM 128 per direction returns (10,256); BiLSTM 64 per direction returns 128;
  Dense64 then class softmax. Dropout 0.2 follows recurrent and intermediate dense
  stages. Save/load model, scaler and label map together.
- Current source fits scaling before chronological sequence splitting. Do not claim
  it already fits only on training data. The paper identifies evaluation leakage
  and a train-only preprocessing boundary; original code remains unchanged.
- Training defaults to stride ten; runtime advances one row and shares nine of ten
  observations. The label belongs to the final row. Count actual highlighted cells
  and verify indices; a visually plausible grid often has an off-by-one error.
- Runtime predicts from the entire scaled (1,10,7) buffer, not one (1,7) observation.
  Tkinter uses scheduled UI callbacks; 0.5 s is the default generation interval,
  not a prediction-latency measurement or a guaranteed rendering period.
- Recent correctness uses up to 100 synthetic-label comparisons. This is not a
  clinical validation or independent test score on overlapping runtime windows.

## Concrete corrections and repeatability

`multi-project-prompts.json` records the first-pass shared prompt, each figure's
source roles and the actual correction wording. The source/CAD paths are portable
roles, not dependencies on a previous user's temporary drive. The matching base
generator supplies layout fuel. The finalized specification above incorporates
known corrections; do not deliberately reproduce a historical draft's errors.

Common failures in this run were fake meter values, invented pH probes/commands,
autonomous control rules, a bit train instead of pulse-width fields, wrong core
ownership, fake class/confidence examples, a claimed train-only scaler fit, and
incorrect window cells. Corrections preserve the attractive composition while
removing the wrong scientific meaning. Review the entire new image after repair.
Two additional repairs removed direct ESP32–app arrows that bypassed Firebase,
and replaced an invented `after(500, ...)` UI period with the actual scheduled
`after(0, ...)` callback while fixing repeated feature labels. Correct routing
and labeling are independent of how convincing the app illustration looks.

Final assets go under `public/images/evidence/projects/<slug>/research/` with
descriptive `-styled.webp` filenames. Use actual image dimensions and numbered
captions in `ProjectFigure`, in reading order. Keep the original app/CAD/video
evidence in the shared gallery. Article mathematics stays native LaTeX/KaTeX.
The final asset manifest records hashes/dimensions/bytes; browser tests exercise
all six paper pages at 390/1440 px, every inline figure/gallery entry, keyboard
navigation, focus restoration, image decoding and page overflow.

In this run the seventeen selected PNGs totaled 28,879,097 bytes; WebP quality 92
at their native 1774×887 dimensions totaled 4,340,216 bytes, roughly 85% smaller.
Individual figure size remains content-dependent; the smallest was about 187 KiB
and the largest about 317 KiB. Inline Next image sizing supports phone bandwidth;
the gallery retains the high-resolution selected WebP. Preserve label readability
when choosing encoding rather than imposing a destructive universal byte cap.

Native math also needs a phone review: two initially long equations overflowed.
Use concise defined variables and aligned multi-line equations; keep the equation
number and scientific meaning. Do not shrink the entire article or rasterize its
math to hide an overflow. Verify that `scrollWidth <= clientWidth` for each display
equation at the test viewport after fonts load.
