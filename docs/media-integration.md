# Media integration — 2 October 2026

106 reviewed media records are now connected to the website. The owner explicitly approved adult photos and certificate scans and asked to exclude children. The preserved source library remains private at `Achievements/`.

| Area | Integrated |
| --- | --- |
| Projects | 13 pages: 8 existing plus AquaFlow, Cleenolve, Medical Robot, TPMS Generator and Faza3D |
| Project galleries | Photos, diagrams, concepts and video for the 9 projects with supplied evidence |
| Milestones | 7 galleries covering PCB work, AI speaking, graduation, Plantini events, Agrinova training, solar training and EasyShield |
| Certificates | 7 approved scans plus the existing IELTS text summary; no placeholder certificate cards |
| Media viewer | Keyboard navigation, Escape to close, focus restoration, native video controls, playback removed on close |
| Delivery | Optimized WebP/MP4 only; videos requested when their viewer opens; originals retained |

NiotoShield is the university hardware/software project. Hardware IDs 055 and 056 are now assigned to its public gallery. EasyShield is the fine-tuned/trained YOLO model and dedicated tool suite, linked to https://github.com/mahostar/EasyShield_v2.5. The two pages link to each other; the education timeline links to NiotoShield.

Concept images are labeled in their galleries. Unknown dates, roles and technology stacks are omitted on the new pages. No project metrics, prize details or repository URLs were invented. Four existing projects still await photos: SmartHart, Cyclops, DepthFusion-ViT and Remote PC Power Control.

Excluded source IDs:

- 093–095: workshop material showing children or uncertain participants.
- 099–103, 109, 111–112: workshop videos kept private because participants throughout the clips were not confidently verified.
- 124: full IELTS report with personal identifiers; the public text summary remains.
- 037: ceremony portrait awaiting provenance confirmation.
- 057: Windows crash photo, unsuitable public project evidence.
- 122: duplicate Agrinova certificate scan; ID 012 is displayed instead.

The publication script is `scripts/publish-portfolio-media.mjs --include-adults`. It publishes the reviewed current batch with these exclusions. Review and update its decisions before importing another batch.

Validation: content validation, typecheck, lint and production build passed. Live desktop/mobile checks verified gallery opening/navigation/closing/focus, certificate enlargement, video playback, all new routes and no horizontal overflow. All 106 published records are reachable through project galleries, milestone galleries or certificate viewers.
