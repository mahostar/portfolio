from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Rectangle
import numpy as np
import argparse
parser=argparse.ArgumentParser(description='Render source-grounded FabricLens, remote-PC and NiotoShield bases for imagegen styling.')
parser.add_argument('--output-dir',type=Path,required=True)
args=parser.parse_args()
OUT=args.output_dir.resolve()
OUT.mkdir(parents=True,exist_ok=True)
INK='#19324e'; COLORS=['#6b91b8','#b29a4e','#b76d81','#629968']
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'mathtext.fontset':'stix'})
def box(ax,x,y,w,h,text,c=0):
 ax.add_patch(FancyBboxPatch((x,y),w,h,boxstyle='round,pad=0.01',fc=COLORS[c]+'18',ec=COLORS[c],lw=1.2))
 ax.text(x+w/2,y+h/2,text,ha='center',va='center',color=INK,fontsize=11)
def arrow(ax,a,b,c=0): ax.add_patch(FancyArrowPatch(a,b,arrowstyle='->',mutation_scale=16,color=COLORS[c],lw=1.5))
def canvas(title):
 f,a=plt.subplots(figsize=(12,6));a.set(xlim=(0,1),ylim=(0,1));a.axis('off');a.text(.02,.95,title,fontsize=18,weight='bold',color=INK);return f,a
def save(f,key):
 for ext in ['png','svg','pdf']: f.savefig(OUT/(key+'.'+ext),dpi=160,bbox_inches='tight',facecolor='white')
 plt.close(f)
f,a=canvas('FabricLens · From labels to an adapted detector')
for i,(t,c) in enumerate([('Image + defect box\nSingle defect class',0),('Stage 1\nFreeze layers 0–9\nAdapt detector head',1),('Stage 2\nUnfreeze all layers\nLower learning rate',2),('Checkpoint\nSelect weights\nRun inspection',3)]):
 x=.025+i*.245;box(a,x,.52,.205,.25,t,c)
 if i<3:arrow(a,(x+.21,.65),(x+.238,.65))
box(a,.05,.12,.4,.25,'Normalized label\n'+r'$b=(x_c/W,\ y_c/H,\ w/W,\ h/H)$'+'\nClean image → empty label file',0)
box(a,.54,.12,.4,.25,'Shared training contract\n640-pixel input · batch 16 · 4 workers\nMosaic augmentation in both stages',3)
save(f,'fabric-training-base')
f,a=canvas('FabricLens · From predictions to defect locations')
for i,(t,c) in enumerate([('Input textile image\nResize for detector',0),('YOLO11s\nCandidate defect boxes',1),('Confidence ≥ 0.25\nNMS IoU = 0.45',2),('Annotated output\nReview localized defects',3)]):
 x=.025+i*.245;box(a,x,.54,.205,.23,t,c)
 if i<3:arrow(a,(x+.21,.65),(x+.238,.65))
for x in [.10,.65]:
 for n in range(14):a.plot([x,x+.23],[.13+n*.018,.13+n*.018],color='#91a6b5',lw=.7)
a.add_patch(Rectangle((.16,.19),.08,.10,fill=False,ec=COLORS[2],lw=2));a.add_patch(Rectangle((.18,.20),.08,.1,fill=False,ec=COLORS[1],lw=2))
a.add_patch(Rectangle((.71,.19),.08,.10,fill=False,ec=COLORS[3],lw=2));arrow(a,(.4,.27),(.58,.27));a.text(.49,.37,'Filter + suppress overlaps',ha='center',fontsize=10)
a.text(.5,.055,'Schematic textile and boxes; not a new model result',ha='center',color=INK,fontsize=10)
save(f,'fabric-detection-base')
f,a=canvas('FabricLens · Responsive inspection without repeated inference')
box(a,.03,.6,.25,.22,'Tk main loop\nSelect image / redraw',0);box(a,.38,.6,.25,.22,'Path-keyed cache\nPreviously computed boxes',1);box(a,.73,.6,.24,.22,'Canvas overlay\nImage + defect boxes',3)
arrow(a,(.28,.71),(.37,.71));arrow(a,(.63,.71),(.72,.71));a.text(.68,.77,'hit',ha='center',fontsize=10)
box(a,.38,.15,.25,.22,'Background worker\nCPU model inference',2);arrow(a,(.5,.59),(.5,.38),2);a.text(.53,.48,'miss',fontsize=10)
arrow(a,(.64,.26),(.85,.59),3);a.text(.75,.40,'Save boxes\nSchedule UI update',ha='center',fontsize=10)
a.text(.16,.22,'UI event loop\ncontinues while\nworker computes',ha='center',color=INK)
save(f,'fabric-viewer-base')
f,a=canvas('Remote PC Power · An independent control path')
for i,(t,c) in enumerate([('App\nRequest button press',0),('Firebase RTDB\nBoolean command',1),('WT32-ETH01\nEthernet + relay',2),('PC motherboard\nPower-button contacts',3)]):
 x=.025+i*.245;box(a,x,.57,.205,.22,t,c)
 if i<3:arrow(a,(x+.21,.68),(x+.238,.68))
box(a,.08,.12,.36,.25,'Controller heartbeat\n15-second interval\nIndependent power supply',0);box(a,.55,.12,.36,.25,'PC Node service heartbeat\nAt startup + every 5 seconds\nAvailable when OS service runs',3)
arrow(a,(.25,.38),(.43,.56));arrow(a,(.73,.38),(.43,.56),3)
a.text(.5,.055,'Separate heartbeats distinguish controller reachability from OS-service reachability',ha='center',color=INK,fontsize=10)
save(f,'remote-control-base')
f,a=canvas('Remote PC Power · A timed pulse with reset gating')
for i,(t,c) in enumerate([('Boot reset\nCommand → false',0),('Armed\nWait for true',1),('Pulse relay\n1 second',2),('Reset command\nConfirm false',3)]):
 x=.025+i*.245;box(a,x,.57,.205,.22,t,c)
 if i<3:arrow(a,(x+.21,.68),(x+.238,.68))
arrow(a,(.875,.56),(.875,.43));arrow(a,(.875,.43),(.36,.43));arrow(a,(.36,.43),(.36,.56));a.text(.60,.45,'Reset confirmed → re-arm',ha='center',fontsize=10)
box(a,.06,.1,.4,.23,'Reset unconfirmed\nBlock new relay requests\nRetry write every 1 second',2);box(a,.55,.1,.39,.23,'Callback records request\nMain loop times the pulse\nHeartbeat freshness ≠ proof of power state',0)
save(f,'remote-pulse-base')
f,a=canvas('NiotoShield · Enrollment becomes a local identity cache')
for i,(t,c) in enumerate([('Supabase profile\nProduct-key lookup\nCheck updated_at',0),('Approved photos\nDownload when changed',1),('InsightFace\nGenerate embeddings',2),('Local identity cache\nVectors + metadata',3)]):
 x=.025+i*.245;box(a,x,.54,.205,.26,t,c)
 if i<3:arrow(a,(x+.21,.67),(x+.238,.67))
box(a,.08,.12,.36,.24,'Unchanged profile\nReuse existing cache\nAvoid repeated downloads',0);box(a,.55,.12,.36,.24,'After embedding generation\nRemove downloaded photos\nRetain vectors for recognition',3)
save(f,'nioto-enrollment-base')
f,a=canvas('NiotoShield · Two gates before access')
for i,(t,c) in enumerate([('Camera frames\nCandidate face',0),('Liveness gate\nReal / presentation attack',1),('Identity gate\nCompare local embeddings',2),('Authorization\nAccess output',3)]):
 x=.025+i*.245;box(a,x,.57,.205,.22,t,c)
 if i<3:arrow(a,(x+.21,.68),(x+.238,.68))
box(a,.29,.13,.205,.22,'Attack / uncertain\nReject',2);arrow(a,(.37,.56),(.39,.36),2)
box(a,.54,.13,.205,.22,'No identity match\nReject',2);arrow(a,(.63,.56),(.64,.36),2)
a.text(.84,.25,'Configured similarity\nthreshold\nRuntime code: 0.6',ha='center',color=INK,fontsize=10)
a.text(.5,.055,'Runtime security flow: liveness and identity are separate decisions',ha='center',color=INK,fontsize=10)
save(f,'nioto-gates-base')
