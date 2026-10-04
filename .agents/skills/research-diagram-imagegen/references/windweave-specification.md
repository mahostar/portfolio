# WindWeave scientific specification

This is the exact domain example underlying the accepted diagram family, not a
generic template for every project. Facts were inspected from
`E:\projects\wind_ERA5` during the 2026-10-04 work. Re-read changed source before
updating an algorithm, constant, or claim. Do not modify that source project as
part of portfolio presentation work.

## Source map

| Source | What it establishes |
| --- | --- |
| `faster_faster_streamer.py` | `WeatherDataset`, window counts and cumulative indexing, feature engineering, sufficient-statistics reduction, active-file cache, normalization, five-tensor construction |
| `train_gui.py` | DataLoader configuration, model/device selection, MSE/Adam execution, ordinary tensor transfers, validation |
| `train.py` | Sample-index split helper and composite `compute_reward` |
| `training_gui.py` | Exposed controls, logging/checkpoint interface |
| `prediction_gui.py` | Window/table inspection, daytime sampling convention, relative-error-based percentage score |
| `rl_train.py`, `rl_train_gui.py` | Stochastic `RLPolicy`, Normal sampling, episode rewards, intended REINFORCE update |

## Data and tensor contract

The source is per-location tabular sequences. Four numeric features are `u10`,
`v10`, `sp`, and `t2m_celsius`; targets are the first two wind components.
Four integer marks encode hour, day of week, day of month, and month. It is not
a spatial CNN tensor with `(C,H,W)` axes.

| Quantity | Symbol | Default |
| --- | --- | --- |
| History length | `L` | 45 rows |
| Forecast length | `H` | 27 rows |
| Known decoder context | `K` | 24 rows |
| Stride | `s` | 9 rows |
| Numeric input channels | `d_x` | 4 |
| Target channels | `d_y` | 2 |

The source slices observations by row index. Its interface uses a nine-observations-
per-day convention, and prediction inspection filters hours 08–16 inclusive.
Thus “five days in / three days out” describes that convention, not a universal
45-hour / 27-hour cadence. Do not insert hour units into the diagram unless a
specific file's timestamps justify them.

For window start `a`, the arrays are:

| Tensor | Rows | Shape per sample | Dtype | Meaning |
| --- | --- | --- | --- | --- |
| `X_enc` | `[a,a+L)` | `45×4` | Float32 | Normalized history features |
| `T_enc` | `[a,a+L)` | `45×4` | Int64 | Historical time marks |
| `X_dec` | Context `[a+L-K,a+L)` then zeros | `51×4` | Float32 | 24 observed rows plus 27 future placeholders |
| `T_dec` | `[a+L-K,a+L+H)` | `51×4` | Int64 | All 51 known time-mark rows |
| `Y` | `[a+L,a+L+H)` | `27×2` | Float32 | Withheld normalized future wind |

Collation adds leading batch dimension `B`. Future timestamps are available,
future feature values are withheld. Only `X_dec`'s future feature region should
have outlined/empty zero cells. All `T_dec` cells are filled known integer marks.
Target observations go to loss/reward feedback, not to model conditioning.

## Index and storage formulas

For a file with `R_j` rows, positive stride `s`, and `R_j >= L+H`:

```text
N_j = floor((R_j - L - H) / s) + 1
```

Otherwise its eligible-window count is zero. Let `C_j` be the cumulative total
through file `j`, with `C_-1=0`. For a valid zero-based global sample `i`:

```text
j = bisect_right(C, i) = min { j : C_j > i }
ell = i - C_(j-1)
a = s * ell
```

Metadata grows with eligible file count `F`, not the number of copied windows;
lookup is `O(log F)`. The source still reads/parses an entire active CSV and keeps
one active DataFrame per worker, so it is not constant memory independent of the
largest individual file.

The exact two-file indexing example is:

| File | Rows | Eligible windows | Global indices |
| --- | --- | --- | --- |
| A | 99 | 4 | 0,1,2,3 |
| B | 117 | 6 | 4,5,6,7,8,9 |

`C=[4,10]`, `i=6`, `j=1`, `ell=2`, and `a=18`. The selected complete interval is
`[18,90)`, with encoder `[18,63)` and target `[63,90)` in file B. Timeline ticks
are exactly `0,18,63,90,117`. Both source files contain full sequences.

Storage amplification, assuming comparable row encodings and long files, is
approximately `(L+H)/s`. For the author's approximately 40 GB motivating archive:

- All possible starts, `s=1`: about `72×`, or `2.88 TB` history/target rows.
- Configured stride, `s=9`: about `8×`, or `320 GB` history/target rows.

These are analytical estimates, not an actually exported dataset size. Decoder
context and time marks add payload if separately exported; CSV and tensor
encodings also differ. Do not claim the configured stride necessarily produces
terabytes. The 40 GB value is author-provided design context, not a new measured
size of the folder inspected by the portfolio agent. Inspection saw separate
dataset metadata around 14.55 GB / 4,485 files and a small ten-file sample; those
do not replace the author context or establish the full original archive size.

## Normalization

Each feature's file summary is `(n,mu,M2)`, where `M2` is the sum of squared
deviations. Merge two summaries using:

```text
delta = mu_B - mu_A
n = n_A + n_B
mu = mu_A + delta * n_B / n
M2 = M2_A + M2_B + delta^2 * n_A * n_B / n
sigma = sqrt(M2 / n)
```

Replace a zero scale with one; normalize `(x-mu)/sigma`. This uses population
scale, not the sample denominator `n-1`. Averaging individual file standard
deviations would omit between-file variation. Workers read full-file DataFrames
for their summaries; the parent retains the summaries instead of all rows.

The exact toy panel is A `[0,2]` and B `[4,6]`: each has `n=2`, `M2=2`, means 1
and 5. Merging gives `n=4`, `mu=3`, `M2=20` because
`2 + 2 + 4²*(2*2/4) = 20`. Use one common horizontal scale. It is not an empirical
weather distribution.

## Loader, caching, and analytical payload

DataLoader supplies worker processes, collation, and prefetch. This implementation
does not contain a separate custom shared-memory queue or autonomous GPU
scheduler. GUI training configures pinned host memory, persistent workers and a
prefetch factor for positive worker counts. Training sampling is shuffled;
validation is sequential. A saved example sets `W=8`, `P=2`.

The active DataFrame is identified by **file path**. Nearby requests
`A,A,A,A,B,B` have statuses `read,reuse,reuse,reuse,read,reuse`. Interleaved
`A,B,C,A,C,B` requires `read` each time with this last-file cache. Cache state is
local to each worker dataset instance. Do not label the cache key as sample index.

The five-tensor payload per sample counts Float32 numeric values and Int64 marks:

```text
S = L*4*4 + L*4*8 + (K+H)*4*4 + (K+H)*4*8 + H*2*4
  = 48*(L+K+H) + 8*H
  = 4824 bytes
M ≈ W*P*B*S
```

`M` is the approximate **total queued tensor payload across workers**. For the
analytical plot, `B=32`, `W=1..16`, `P=1,2,4`, dividing bytes by `1048576` for
MiB. At `W=16`, values are approximately `2.36,4.71,9.42 MiB`. Axes: W ticks
`1,4,8,12,16`, y range `0..10`, lines blue/ochre/rose in increasing order. These
straight lines are algebra, not measured memory or throughput. They exclude
DataFrames, tensor metadata, process overhead, consumed batches, pinned copies,
model activations, optimizer state, and GPU allocator memory.

The training loop uses ordinary `.to(device)` on the five tensors, then forward,
MSE, backward, and Adam update for the supervised path. Do not claim nonblocking
transfer, custom CUDA streams, measured copy/compute overlap, or GPU utilization
from pinned memory alone. Informer and DLinear are model choices in the source.

The sequence figure has four lifelines: training loop, DataLoader, CPU worker,
CSV/cache. Message order is request batch, assign indices, read on miss, return
active DataFrame, return five tensors, return collated batch. Lower CPU/GPU
batch strips express ordering only, with no measured durations.

## Learning routes and result provenance

Present two separate routes using the same streamed examples:

- Supervised: model forecast → MSE against withheld future → backpropagation.
- Reward-based: stochastic forecast sample → composite reward against recorded
  future → intended REINFORCE-style policy update.

The RL policy has a two-component mean head and learned log standard deviations,
sampling a Normal distribution. Conditioning `S` is the tuple
`(X_enc,T_enc,X_dec,T_dec)`, not a single tensor shape. Prediction and target are
`(B,27,2)`. The reward combines negative component MAE, optional DTW/H penalty,
high-wind event agreement, and negative mismatch in wind-speed standard deviation.
Default weights are one. The event term is +1 for both above threshold, -1 for
only one, and 0 for neither. The optional DTW calculation catches failure and
falls back to zero. Targets are normalized, so computed magnitudes/thresholds
are transformed quantities unless explicitly denormalized.

Recorded historical futures provide offline feedback, not a live physical
environment transition. Comparing forecast and truth alone does not make the
supervised baseline RL. This distinction belongs in both prose and arrows.

The displayed approximately **24% after 20 epochs** is an author-supplied report.
The inspected saved configuration was supervised, ten epochs per fold, three
folds, with weights for folds 1/2 through epoch 10 and fold 3 through epoch 7.
No corresponding saved 20-epoch metric log was found. The owner confirmed using
their reported value. Preserve that provenance without adding a story about
memory failure, finances, or project abandonment.

The prediction GUI's “accuracy” is a custom relative-error score, not class
accuracy: for nonzero actual `y`, `100*max(0,1-|prediction-y|/|y|)`. If actual is
zero it gives 100 only for zero prediction, otherwise zero. It averages across
components, rows, and inspected windows. This is not evidence of state-of-the-art
forecasting or a benchmark comparison.

Do not fabricate completed-training results, convergence curves, performance
tables, held-out experiments, or state-of-the-art claims. The article can explain
the streaming contribution and the reported training budget accurately. Toy
figures, analytical estimates, and synthetic interface rows must be labeled as
such, not repurposed as measurements.

The RL scripts require independent alignment/update validation before a claim
of a reproduced RL run: inspected concerns included decoder-position selection,
reward/log-probability length alignment, policy-loss aggregation, and the optional
DTW API call. They were documented, not repaired in the original project. Saved
weights alone do not establish RL performance. Fit normalization on training
observations and account for overlapping windows in any future rigorous evaluation;
the inspected statistics/split order is an evaluation boundary, not a proven
held-out result.

## Figure acceptance map

| Figure | Required invariant |
| --- | --- |
| Architecture | Five CPU-to-GPU stages; initialization separated from repeated construction/consumption; tabular time×features |
| Index | Exact A/B counts, index 6 resolution, all half-open intervals and ticks |
| Normalization | Sufficient-statistics reduction; exact four-value correction example |
| Tensors | Five arrays, correct shapes/dtypes, known context and future marks, zeros only in future `X_dec` |
| Locality | Exact read/reuse sequences; one active file; analytical total-payload plot |
| Sequence | Six messages in order/direction; file-path cache; schematic batch ordering |
| Feedback | Separate supervised/RL routes; 4 input and 2 target channels; future targets only in feedback |

All seven use the unbranded rich scientific-panel style. Their charts and
illustrations do not report the 24% result or invent a completed experiment.
