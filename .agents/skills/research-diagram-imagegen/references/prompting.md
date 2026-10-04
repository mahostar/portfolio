# Exact prompting and imagegen mechanics

## Reference roles control accuracy

The user explicitly asked to give imagegen the existing diagram as a starting
point. For the first style edit:

| Input | Role | May affect |
| --- | --- | --- |
| Image 1: inspected Matplotlib PNG | Content/edit target | Geometry, labels, equations, numbers, stage order, panel letters |
| Image 2: approved WindWeave cover | Style only | Panel richness, quiet colors, outlines, nested scientific graphics, typography |

The cover's logos, giant title, green frame, thumbnail layout, weather imagery,
and example content are not permissions to insert them into an article diagram.
State this explicitly every time. A correction reverses the hierarchy: image 1
is the current styled draft to repair; image 2 is the accurate base for content;
optional image 3 is the style reference.

## Accepted design language

Use the exact shared instruction in `diagram-prompts.json` as the baseline. Its
important positive instructions are a white canvas; softly tinted blue, grey,
ochre, rose, and green sections; thin colored outlines; nested mini-panels;
cleanly rendered mathematical notation; compact tables; small flat schematic
icons; aligned grids; precise directed connectors; restrained scientific
sans-serif text; and readable labels with safe margins. Ask for MATLAB/Simulink
scientific-diagram character, not photorealistic chip illustrations.

Richness comes from useful structure: source tables, cumulative index cards,
timeline slices, matrices, queues, summary reductions, lifelines, and feedback
connections. More unsupported labels or fictitious plots are not more detail.
Prefer a few clearly organized panels to decorative scenery.

The essential exclusions are NVIDIA/CUDA marks or words in article figures,
company logos, giant WINDWEAVE titles, certificate/seal imagery, slogans,
watermarks, neon, realistic processors, futuristic scenery, invented data,
benchmark metrics, dates, hardware specs, and performance curves.

## First-pass recipe

Compose the prompt from the shared style instruction and a precise figure spec.
The saved prompt set contains all seven worked specs. For another project:

```text
Use case: style-transfer; scientific diagram.
Asset: standalone article figure, landscape, not a cover.
Image 1 is the accurate diagram to edit. Image 2 is ONLY the rendering-style reference.
Preserve: [panel letters and titles], [stage order], [arrow directions],
[exact equations], [numbers and units], [indices/intervals], [shapes/dtypes].
Style: white canvas, restrained pastel scientific panels, thin colored outlines,
nested tables/matrices/icons, precise connectors, legible math and sans-serif labels.
Transfer only the panel richness and palette of image 2.
Do not copy its logos, title, frame, subject, invented examples, or thumbnail layout.
Content: [the source-derived specification, organized by panel].
Interpretation: [measured/analytical/toy/schematic status and boundaries].
Avoid: [specific false implications, brand marks, invented metrics, futuristic effects].
Keep wide proportions and safe margins; all labels in English.
```

Use exact values instead of ambiguous variables when channel counts matter.
For example: `X_enc (B,45,4)` and `Y (B,27,2)`, not `(B,45,d)` and `(B,27,d)`.
Specify each quantity's meaning, not only its spelling. State that future marks
are known while future feature values are withheld. This prevents a beautiful
but scientifically wrong zero-placeholder graphic.

## Tool invocation used here

Read the installed `imagegen` skill when applying imagegen. Built-in generation
is preferred and needs no `OPENAI_API_KEY`. Do not silently switch to the CLI,
select a different image model, or create an SDK runner for ordinary asset edits.
If the built-in tool is unavailable, report that limitation; use a fallback only
when explicitly authorized. Context7 can help retrieve current library docs when
available. Otherwise use installed guides or primary official documentation;
there is no secret diagram library required for this method.

First inspect each input with `view_image`, emitting the image rather than its
data URL as text. Then use local references in the order explained in the prompt.
The following is the tool orchestration pattern, not a shell script:

```javascript
// @exec: {"yield_time_ms": 120000, "max_output_tokens": 1200}
const result = await tools.image_gen__imagegen({
  prompt: sharedStyle + "\n\n" + figureSpecification,
  referenced_image_paths: [contentPngAbsolutePath, approvedStyleAbsolutePath],
  transparent_background: false,
});
store("diagram-architecture-result", result);
generatedImage(result);
```

Define those variables with actual resolved paths and the saved prompt text before
using the example. `generatedImage(result)` displays native generated media and
its output hint. Do not call `text(result)` on image results or print base64.
Read small metadata separately if needed. Use the actual returned save path;
the built-in tool has no destination-path parameter in this session's schema.

For local file edits, use `referenced_image_paths` after inspection. If an input
is only a conversation image, use the smallest `num_last_images_to_include`
that includes the required targets, per the available tool's instructions.
Never provide both input mechanisms. If all required images cannot be included,
request the missing attachment rather than pretending it was referenced.

The tool may take several minutes. Use the recommended imagegen exec yield and
resume a yielded cell with `functions.wait` only after a “Script running” result.
Keep progress commentary brief and explain meaningful findings. Generic shell
waits are not a substitute for waiting on an imagegen cell.

For multiple figures, issue one call per figure with its own content reference.
Independent read-only reference inputs and distinct outputs may be batched with
`Promise.allSettled`; inspect every success/failure and emit each successful image.
Do not abandon unawaited promises when the exec lifetime ends. Keep dependent
corrections sequential. Multi-image generation does not require subagents, and
this skill does not authorize delegation beyond the repository/user rules.

## Targeted correction recipe

```text
Image 1 is the current styled figure. Image 2 is the accurate scientific base.
Make one targeted correction: [name the exact wrong label/region/arrow].
Replace [wrong content] with [exact correct content and interpretation].
Preserve every other panel, equation, number, arrow, color, and layout.
Keep the accepted rich pastel scientific style, white canvas, and clean math.
Do not add logos, new numerical results, measured timing, or unrelated text.
```

Use two related corrections together only when needed to repair one affected
concept, as the cache/training-step correction did. Inspect all changes again;
the preservation clause is a request, not a guarantee of pixel-level identity.

Read `diagram-corrections.json` for the six successful repairs. It contains the
original wording with portable reference-role descriptions. It does not rely
on the old raw generated-image filenames, and it is not an automatic retry list.
Use only the correction supported by the actual current draft.

## Cover-specific prompting

`cover-prompt.txt` preserves the original cover prompt and its final correction
specification. It is historical prompt provenance, not a license to retain the
first draft's inaccurate details. For a new cover, incorporate the corrected
facts into the first prompt. Its references were the old artwork (project/topic),
a dense academic workflow example (style), and the official NVIDIA horizontal
logo (technology mark). Original references were inspected before editing.

The accepted cover uses large black WINDWEAVE text, the exact subtitle
“REAL-TIME DATA STREAMING PIPELINE,” a NVIDIA/CUDA technology lockup, a white
canvas with a green frame, five tinted process columns, and detailed miniature
scientific panels. It is a personal engineering showcase, not a credential.
Do not insert issued-certificate, endorsement, ranking, completion, seal, or
state-of-the-art claims. Use approved/original branding assets for branding tasks.

Future diagram edits can use the optimized cover already in the repository as
style reference. They do not need another cover-generation call or a logo download.
