"""Deterministic layout fuel for the four inspected project papers.
Read references/multi-project-figures.md and verify current source before reuse.
The generator does not read private source, invoke imagegen, or edit public media.
Supply actual inspected CAD/app references separately when styling.
"""
from pathlib import Path
import json, hashlib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, FancyBboxPatch, FancyArrowPatch, Circle, Ellipse, Polygon, Arc
import numpy as np

import argparse
parser=argparse.ArgumentParser(description='Render inspected project figure content bases; these are imagegen fuel.')
parser.add_argument('--output-dir',type=Path,required=True)
parser.add_argument('--overwrite',action='store_true')
args=parser.parse_args()
OUT=args.output_dir.resolve()
if OUT.exists() and not args.overwrite and any(OUT.glob('*')):
    parser.error('Output directory is not empty. Select a new task directory or explicitly pass --overwrite.')
OUT.mkdir(parents=True,exist_ok=True)
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10,'mathtext.fontset':'stix','svg.fonttype':'path','pdf.fonttype':42,'savefig.facecolor':'white'})
INK='#192c43'; BLUE='#477fb5'; GREEN='#499267'; ROSE='#ec657c'; GOLD='#b69736'; GREY='#8998a8'
COLORS=[GREY,BLUE,GOLD,ROSE,GREEN]
manifest=[]
def canvas(title,subtitle='',height=6):
    fig=plt.figure(figsize=(12,height)); fig.text(.03,.957,title,weight='bold',fontsize=17,color=INK)
    fig.text(.03,.918,subtitle,fontsize=10,color=INK)
    return fig
def panel(fig,pos,title,color=BLUE):
    ax=fig.add_axes(pos); ax.set(xlim=(0,1),ylim=(0,1)); ax.axis('off')
    ax.add_patch(FancyBboxPatch((.01,.01),.98,.98,boxstyle='round,pad=0.005',fc='white',ec=color,lw=1))
    ax.text(.05,.94,title,weight='bold',color=INK,fontsize=11,va='top')
    return ax
def txt(ax,x,y,s,size=10,**kw): ax.text(x,y,s,fontsize=size,color=INK,ha=kw.pop('ha','center'),va=kw.pop('va','center'),**kw)
def box(ax,x,y,w,h,s,color=BLUE,size=10):
    ax.add_patch(FancyBboxPatch((x,y),w,h,boxstyle='round,pad=0.012',fc=color+'15',ec=color,lw=.9));txt(ax,x+w/2,y+h/2,s,size)
def arrow(ax,a,b,color=INK,style='->'):
    ax.add_patch(FancyArrowPatch(a,b,arrowstyle=style,mutation_scale=11,lw=1.15,color=color,clip_on=False))
def grid(ax,x,y,rows,cols,w=.5,h=.3,color=BLUE):
    for i in range(rows):
        for j in range(cols): ax.add_patch(Rectangle((x+j*w/cols,y+i*h/rows),w/cols*.91,h/rows*.91,fc=color+'75',ec=color,lw=.3))
def stages(ax,items,top=.65):
    n=len(items); width=.68/n
    for i,(label,color) in enumerate(items):
        x=.055+i*.9/n; box(ax,x,top,width,.17,label,color,9)
        if i<n-1: arrow(ax,(x+width+.01,top+.085),(x+.9/n-.01,top+.085))
def tower(ax,x=.35,y=.15,w=.25,h=.65,plants=False):
    ax.add_patch(Polygon([(x,y),(x+w,y),(x+w*.92,y+h),(x+w*.08,y+h)],fc='#f4f7f8',ec=INK,lw=1.1))
    for row in range(3):
        yy=y+h*(row+1)/3; ax.plot([x,x+w],[yy,yy],color=GREY,lw=.8)
        for side in [-1,1]:
            xx=x+w*.5+side*w*.58; ax.add_patch(Ellipse((xx,yy-h*.13),w*.36,h*.095,angle=-side*20,fc='#ced7df',ec=INK,lw=.7))
            if plants:
                for d in [-.03,0,.03]:
                    ax.add_patch(Ellipse((xx+d,yy-h*.07+d),w*.18,h*.12,angle=side*40,fc='#78b56c',ec=GREEN,lw=.5))
    ax.add_patch(Ellipse((x+w/2,y-.04),w*1.75,.09,fc='#e7edf3',ec=INK))
def pocket(ax,x=.15,y=.27,w=.60,h=.46):
    # Functional section: preserves the author-described reserve without exposing dimensions.
    outer=[(x,y+h),(x+.06,y+h),(x+.15,y+.04),(x+w-.05,y+.04),(x+w,y+h*.8),(x+w-.055,y+h*.8),(x+w-.105,y+.12),(x+.20,y+.12)]
    ax.add_patch(Polygon(outer,closed=True,fc='#edf0f2',ec=INK,lw=1.2))
    ax.add_patch(Polygon([(x+.19,y+.12),(x+w-.105,y+.12),(x+w-.07,y+.25),(x+.165,y+.25)],fc='#9dcfe4',ec=BLUE,lw=.8))
    for k in range(4):
        xx=x+.25+k*.06; ax.plot([xx,xx-.02,xx+.01],[y+h*.82,y+.31,y+.17],color=GOLD,lw=1)
    ax.add_patch(Ellipse((x+w*.55,y+h*.86),w*.34,h*.11,angle=-10,fc='#dce9d2',ec=GREEN))
    arrow(ax,(x-.05,y+h),(x+.17,y+.27),BLUE);txt(ax,x+.05,y+h+.10,'Refill',9)
    arrow(ax,(x+w*.57,y+.22),(x+w*.57,y+.36),GREEN);txt(ax,x+w*.58,y+.44,'Root uptake',9)
def save(fig,slug,key,desc,refs=[],invariants=''):
    name=f'{slug}-{key}'
    for ext in ['png','svg','pdf']: fig.savefig(OUT/f'{name}.{ext}',dpi=160)
    plt.close(fig)
    from PIL import Image
    with Image.open(OUT/f'{name}.png') as im: width,height=im.size
    manifest.append({'slug':slug,'key':key,'base':str((OUT/f'{name}.png').resolve()),'width':width,'height':height,'description':desc,'references':refs,'invariants':invariants})

# Plantini: hardware figures grounded in CAD/photo references.
fig=canvas('Modular tower assembly','CAD-informed functional arrangement; no fabrication dimensions')
a=panel(fig,[.025,.07,.30,.78],'a  Assembled tower',BLUE); tower(a,plants=True)
txt(a,.5,.10,'Stacked modules + growing cups',10)
b=panel(fig,[.345,.07,.30,.78],'b  Exploded hierarchy',GOLD)
for i,(lab,col) in enumerate([('Growing cups',GREEN),('Tower module',BLUE),('Tower base',GREY),('Shared reservoir',BLUE)]):
    box(b,.18,.70-i*.17,.64,.12,lab,col)
    if i<3: arrow(b,(.5,.70-i*.17),(.5,.66-i*.17))
c=panel(fig,[.665,.07,.31,.78],'c  Physical interfaces',GREEN)
stages(c,[('Water\nsupply',BLUE),('Root\nzone',GREEN)],.63)
box(c,.15,.36,.7,.14,'Support + removable plant cups',GREY);box(c,.15,.14,.7,.14,'External lighting arms',GOLD)
save(fig,'plantini','tower-assembly','Three panels: planted assembled tower, exploded modular hierarchy, and mechanical/hydraulic/light interfaces. Preserve the source tower silhouette and angled removable growing cups. The exploded view is functional, not a build drawing.',['public/images/evidence/projects/plantini/manufacturing/tower-module-cad--081.webp','public/images/evidence/projects/plantini/prototypes/tower-with-plants-front--089.webp'])

fig=canvas('Local water reserve at the root zone','Functional cutaway from the growing-cup CAD video and author-described operation')
a=panel(fig,[.025,.07,.46,.78],'a  Pocket and root access',BLUE);pocket(a)
txt(a,.5,.10,'Small retained volume below the root zone',10)
b=panel(fig,[.505,.07,.47,.78],'b  Between pump pulses',GREEN)
stages(b,[('Refill\npulse',BLUE),('Retained\nwater',BLUE),('Plant\nuptake',GREEN)],.62)
txt(b,.5,.44,r'$dV_p/dt=q_{\mathrm{in}}-q_{\mathrm{uptake}}-q_{\mathrm{loss}}$',13)
box(b,.13,.17,.74,.18,'Author-described reserve: 10–24 h\nDepends on plant demand and losses',GOLD)
save(fig,'plantini','root-pocket','Show a scientifically clear cutaway of the angled growing-cup/socket from reference image 3; show a small blue retained pocket under roots and refill/uptake arrows. Panel b explains retained water while the pump is off. 10–24 hours is author-described operating reserve depending on uptake/loss, not a measured guarantee.',['<inspected growing-cup CAD frame>','<inspected second growing-cup CAD frame>'],'Do not treat cyan CAD selections as actual water. Do not print CAD dimensions, wall thickness, ports or fabrication recipe. Preserve water below roots, not submerged foliage.')

fig=canvas('Recirculation and local buffering','Flow-path schematic based on the assembled tower; arrows indicate functional direction')
a=panel(fig,[.025,.07,.57,.78],'a  Shared hydraulic loop',BLUE); tower(a,.4,.23,.18,.51)
box(a,.15,.07,.65,.12,'Shared nutrient reservoir',BLUE)
arrow(a,(.25,.19),(.25,.75),BLUE);arrow(a,(.25,.75),(.48,.75),BLUE)
arrow(a,(.64,.71),(.64,.20),BLUE);arrow(a,(.64,.20),(.58,.19),BLUE)
txt(a,.14,.47,'Pump /\nupward supply',9);txt(a,.80,.47,'Gravity\nreturn',9)
b=panel(fig,[.615,.07,.36,.78],'b  Each plant site',GREEN);pocket(b,.13,.28,.65,.43)
txt(b,.5,.12,'Local reserve buffers the refill interval',10)
save(fig,'plantini','water-circuit','Tower water flow schematic: main reservoir, pump supply up to the tower, water distribution across plant sites, gravity return to reservoir. Separate inset shows the local root-water pocket buffering refill intervals. Do not add UV/filter/dosing plumbing absent from the physical reference.',['public/images/evidence/projects/plantini/manufacturing/assembled-tower-and-light--082.webp'])

fig=canvas('Intermittent pumping and the duty-cycle model','Analytical runtime calculation for the author-described 1 min per hour schedule')
a=panel(fig,[.025,.07,.57,.78],'a  One-hour pump schedule',BLUE)
plot=fig.add_axes([.075,.34,.46,.30]);plot.step([0,1,1,60],[1,1,0,0],where='post',color=BLUE,lw=2);plot.set(xlim=(0,60),ylim=(-.08,1.15),xticks=[0,1,15,30,45,60],yticks=[0,1],yticklabels=['OFF','ON'],xlabel='Elapsed time (min)');plot.spines[['top','right']].set_visible(False);plot.grid(axis='x',alpha=.2)
txt(a,.5,.14,'1 min refill  →  59 min pump off',12)
b=panel(fig,[.615,.07,.36,.78],'b  Runtime and scope',GREEN)
txt(b,.5,.68,r'$D=\frac{1}{60}=1.67\%$',20)
box(b,.12,.38,.76,.16,'24 min pump operation per day',BLUE)
box(b,.12,.14,.76,.17,'Ideal pump energy ratio: 1/60\nExcludes lights, controls and startup',GOLD)
save(fig,'plantini','pump-duty','Exact analytical step plot: pump ON from 0 to 1 minute; OFF from 1 to 60 minutes. Duty D=1/60=1.67%; 24 minutes ON per day. Ideal pump-only energy ratio 1/60; not total device energy savings or validated power measurement. No invented energy curve.',''.split(),'Preserve 1 min ON / 59 min OFF and the pump-only scope.')

fig=canvas('Plant sites, tower footprint, and external lighting','CAD/photo-informed arrangement; geometry is schematic and not dimensioned')
a=panel(fig,[.025,.07,.45,.78],'a  Planted tower and lighting',GREEN);tower(a,.38,.2,.22,.58,True)
for side in [-1,1]:
    xx=.49+side*.27; a.add_patch(Arc((.49,.56),.59,.75,theta1=15 if side>0 else 95,theta2=85 if side>0 else 165,ec=GOLD,lw=2.5));arrow(a,(xx,.69),(.49+side*.10,.56),GOLD)
txt(a,.5,.08,'Lighting arms surround the plant canopy',10)
b=panel(fig,[.50,.07,.475,.78],'b  Coupled growing conditions',BLUE)
stages(b,[('Nutrient\nsolution',BLUE),('Root\nreserve',GREEN),('Canopy\nlight',GOLD)],.65)
box(b,.15,.36,.70,.14,'Removable cups expose individual plant sites',GREY)
box(b,.15,.13,.70,.15,'Light geometry and refill schedule\nserve different physical needs',GREEN)
save(fig,'plantini','growth-lighting','Flat technical illustration of the real planted white stacked tower with black angled cups, curved external lighting arms and base. Pair with functional root/canopy conditions panel. Avoid light efficiency claims or invented dimensions.',['public/images/evidence/projects/plantini/manufacturing/assembled-tower-and-light--082.webp','public/images/evidence/projects/plantini/prototypes/tower-with-plants-front--089.webp'])

# Conductivity: high-level black-box science, no proprietary construction details.
for slug,domain in [('plantini','Nutrient solution'),('aquaflow','Fish water')]:
    fig=canvas('From conductivity response to a contextual TDS estimate','Public operating principles; private sensing implementation remains a black box')
    a=panel(fig,[.025,.07,.30,.78],'a  Water–sensor interface',BLUE)
    box(a,.12,.65,.76,.13,domain,BLUE);box(a,.12,.41,.76,.14,'Alternating excitation\nConductivity-related response',GOLD);arrow(a,(.5,.65),(.5,.57))
    box(a,.12,.15,.76,.14,'Avoid persistent DC bias',GREEN)
    b=panel(fig,[.345,.07,.30,.78],'b  Calibration context',GOLD)
    txt(b,.5,.69,r'$\kappa=K_{\rm cell}G$',19)
    txt(b,.5,.48,r'$\kappa_{25}=\frac{\kappa_T}{1+\alpha(T-25)}$',15)
    txt(b,.5,.25,r'$C_{\rm TDS}\approx f_{\rm solution}\kappa_{25}$',15)
    c=panel(fig,[.665,.07,.31,.78],'c  Interpreting the reading',GREEN)
    box(c,.12,.61,.76,.16,'Value + temperature context\nCalibration + validity',BLUE)
    box(c,.12,.35,.76,.16,'Bulk ionic proxy\nComposition affects conversion',GOLD)
    box(c,.12,.10,.76,.15,'Not individual nutrients\nNot ammonia / dissolved oxygen',ROSE)
    save(fig,slug,'conductivity','Three panels: alternating sensor excitation against water, generic public conductivity/temperature/TDS relationships, and validity-aware interpretation. Preserve symbolic cell factor, temperature coefficient and solution conversion only. No circuit values, pins, excitation waveform timing, electrode geometry, calibration constants or build instructions.',''.split(),'These are general public physical relationships, not the private firmware calibration formula. TDS is not ammonia or dissolved oxygen.')

fig=canvas('Plantini: sensing, configuration, and the operator interface','Firmware-example sensing contract and author-described Firebase synchronization')
a=panel(fig,[.025,.07,.53,.78],'a  System responsibilities',BLUE)
stages(a,[('Sensor\nprocessor',GOLD),('ESP32\ncontroller',BLUE),('Firebase\nstate',ROSE),('Mobile\napp',GREEN)],.65)
arrow(a,(.83,.61),(.53,.61),GREEN);txt(a,.68,.52,'Configuration / control',9)
box(a,.11,.15,.78,.21,'Sensor handoff: reading + validity + diagnostics\nFirmware examples use a serial request / response',GREY)
b=panel(fig,[.58,.07,.395,.78],'b  Existing interface surfaces',GREEN)
box(b,.12,.62,.76,.16,'Dashboard: TDS, temperature, pH\nPump and LED state',BLUE)
box(b,.12,.36,.76,.16,'Crop profile + sensor calibration',GOLD)
box(b,.12,.11,.76,.16,'Pump modes: Always / Normal / Eco',GREEN)
save(fig,'plantini','operator-loop','Architecture with sensor processor to ESP32; Firebase state synchronization between controller and mobile app is author-described. Reverse arrow represents app configuration/control. Separate panel summarizes existing real screenshots: TDS/temp/pH, LED/pump, crop selection/calibration, Always/Normal/Eco modes. Do not invent app source code, Firebase paths, timestamps, dosing or control algorithm.',['public/images/evidence/projects/plantini/app/app-dashboard--070.webp','public/images/evidence/projects/plantini/app/crop-and-pump-configuration--071.webp'],'Distinguish firmware example serial handoff from author-described app/cloud integration. Do not claim the three pump modes have verified firmware schedules.')

# AquaFlow hardware and embedded software.
fig=canvas('Fish-water recirculation and equipment boundaries','Physical prototype plus functional filtration concept; no removal-rate claims')
a=panel(fig,[.025,.07,.63,.78],'a  Recirculating water path',BLUE)
stages(a,[('Fish\ntank',BLUE),('Pump',BLUE),('Filter\nmedia',GOLD),('Aeration /\nreturn',GREEN)],.62)
arrow(a,(.88,.62),(.88,.39),BLUE);arrow(a,(.88,.39),(.15,.39),BLUE);arrow(a,(.15,.39),(.15,.61),BLUE)
box(a,.25,.13,.57,.14,'Temperature / TDS / water-level sensing',ROSE)
b=panel(fig,[.675,.07,.30,.78],'b  Controller boundary',GREEN)
box(b,.12,.63,.76,.16,'ESP32 controller\nSensor handoff',BLUE)
box(b,.12,.36,.76,.16,'Relay outputs\nPump / compressor / UV',GOLD)
box(b,.12,.10,.76,.16,'Hardware photo = evidence\nFlow diagram = functional concept',GREY)
save(fig,'aquaflow','recirculation','Scientific tank/pump/filter/aeration return loop, sensed temperature/TDS/level and controller/relay equipment boundary. Draw physical fish tank and mineral media schematically from actual reference, no decorative environment. UV output exists in supplied firmware but does not prove microbial removal efficacy.',['public/images/evidence/projects/aquaflow/architecture/water-system-concept-diagram--028.webp','public/images/evidence/projects/aquaflow/prototype/water-tank-and-controller--030.webp'])

fig=canvas('Feeding, waste load, and complementary filtration','Functional explanation; water chemistry needs multiple measurements')
a=panel(fig,[.025,.07,.46,.78],'a  Feed-to-water load',GOLD)
stages(a,[('Feed\nportion',GOLD),('Fish\nmetabolism',BLUE),('Waste +\nuneaten feed',ROSE)],.62)
box(a,.14,.32,.72,.15,'Dissolved nitrogen + suspended solids',ROSE)
box(a,.14,.11,.72,.14,'Feeder CAD: base / rotor / wall / lid',GREY)
b=panel(fig,[.505,.07,.47,.78],'b  Different removal mechanisms',GREEN)
box(b,.12,.65,.76,.13,'Mechanical capture → particulate solids',GREY)
box(b,.12,.44,.76,.13,'Mineral adsorption → ammonium context',GOLD)
box(b,.12,.23,.76,.13,'Biofiltration: ammonia → nitrite → nitrate',GREEN)
txt(b,.5,.09,'TDS does not identify ammonia concentration',10)
save(fig,'aquaflow','feeding-filtration','Explain conceptual feed portions, fish metabolism/uneaten feed, particulates and dissolved nitrogen. Show distinct mechanical capture, ammonium-binding mineral adsorption (media/chemistry dependent), and biological nitrification (ammonia to nitrite to nitrate). Do not imply these are the same process or claim measured removal. Small exploded feeder component inset based on supplied STL outline base.',''.split(),'No ppm-to-ammonia conversion; no universal fish threshold; no autonomous feeding decision verified from firmware.')

fig=canvas('Arduino–ESP32 single-wire pulse handoff','Source-derived message order; pulse widths are schematic and not to scale')
a=panel(fig,[.025,.39,.95,.46],'a  Sensor processor to receiver',BLUE)
stages(a,[('Nano\nmeasurement',GOLD),('Framed\npulse packet',BLUE),('ESP32\nvalidation',ROSE),('Shared\nreading state',GREEN)],.55)
txt(a,.50,.20,'Start marker  →  TDS field  →  separator  →  temperature field  →  end marker',10)
b=panel(fig,[.025,.07,.46,.28],'b  Freshness boundary',GREEN)
txt(b,.5,.58,'Accepted packet updates value + last packet time',10);txt(b,.5,.25,'No accepted packet for > 5 s → Nano offline',10)
c=panel(fig,[.505,.07,.47,.28],'c  Transport scope',GOLD)
txt(c,.5,.58,'One-wire pulse encoding; not UART / I²C',11);txt(c,.5,.25,'Private timing, wiring and calibration omitted',10)
save(fig,'aquaflow','controller-link','Exact supplied low-level architecture: Arduino Nano transmits framed one-wire pulse widths, ESP32 checks start marker and fields, decodes TDS and temperature then updates shared readings. Order Start/TDS/separator/temperature/end. No valid received packet for more than five seconds marks Nano offline. Show timing strip without numeric pulse durations or pin assignments.',''.split(),'No UART, I2C, checksum or ACK invented. Receiver has timeout/start checks; end marker is not a demonstrated checksum. Keep 5 s freshness timeout.')

fig=canvas('Cloud synchronization with separate state ownership','Inspected ESP32 revision: Firestore REST requests, targeted at ~1 s intervals')
a=panel(fig,[.025,.07,.31,.78],'a  Core 1: local sensing',GOLD)
box(a,.12,.66,.76,.14,'Nano packet receiver',BLUE);box(a,.12,.43,.76,.14,'Ultrasonic distance',BLUE)
box(a,.12,.14,.76,.18,'Critical-section snapshot\nTDS / temp / distance / Nano online',GREEN)
b=panel(fig,[.355,.07,.31,.78],'b  Core 0: cloud I/O',ROSE)
box(b,.12,.65,.76,.15,'PATCH sensor document\nDevice owns measurements',BLUE)
box(b,.12,.38,.76,.15,'GET relay document\nCloud owns desired controls',GREEN)
box(b,.12,.11,.76,.15,'Wi-Fi reconnect checks\nNetwork work isolated from sensing',GREY)
c=panel(fig,[.685,.07,.29,.78],'c  App and actuators',GREEN)
box(c,.12,.65,.76,.15,'Mobile dashboard\nRead state / request control',BLUE)
box(c,.12,.38,.76,.15,'Desired relay state\nPump / compressor / UV',GOLD)
box(c,.12,.11,.76,.15,'Changed state → apply relays\nDevice does not republish commands',GREEN)
save(fig,'aquaflow','live-telemetry','Three responsibilities: sensing/core1 packet+distance, cloud/core0 REST PATCH sensors and GET desired relays, dashboard plus local relay application. Supplied esp.ino uses Firestore REST, not a Firebase Realtime Database listener or MQTT subscription. Target cloud sensor push and relay poll intervals ~1 s, not measured latency. Separate measurements from desired controls to avoid overwritten app commands.',['public/images/evidence/projects/aquaflow/app/mobile-control-dashboard--032.webp'],'Do not call the inspected cloud path WebSocket push/MQTT or guarantee subsecond real time. No private endpoint IDs or credentials. Freshness flag travels with retained TDS value.')

# EasyShield.
fig=canvas('A contextual visual liveness gate','Source-derived live inference path; identity recognition is a downstream system')
a=panel(fig,[.025,.38,.95,.47],'a  Live frame-to-decision path',BLUE)
stages(a,[('Camera\nframe',GREY),('Haar face\nlocalization',BLUE),('Context crop\n640 × 640',GOLD),('YOLOv12\nbox outputs',ROSE),('Real / fake\nconfidence',GREEN)],.55)
txt(a,.5,.19,'Crop padding: floor(1.5 × face width); clipped to frame bounds',11)
b=panel(fig,[.025,.07,.46,.27],'b  Liveness semantics',GREEN);txt(b,.5,.50,'Real evidence / attack evidence / no accepted output',11);txt(b,.5,.20,'Checkpoint class metadata controls the mapping',10)
c=panel(fig,[.505,.07,.47,.27],'c  Identity boundary',GOLD);txt(c,.5,.50,'Liveness decision → downstream identity stage',11);txt(c,.5,.20,'A confidence score is not identity or calibration',10)
save(fig,'easyshield','liveness-gate','Continuous live capture pipeline with Haar cascade face localization, clipped contextual crop padded floor(1.5*face width), resized640x640; YOLOv12 nano returns boxes.cls/conf; semantics map to Real/Fake. Identity gate downstream belongs to NiotoShield and not standalone tester.',''.split(),'MTCNN is offline only, not live. No class IDs 0/1 because scripts differ. No invented calibrated probabilities or accuracy.')

fig=canvas('Dataset engineering around the liveness model','Offline source workflow with distinct localization and curation stages')
a=panel(fig,[.025,.38,.95,.47],'a  Data-production stages',BLUE)
stages(a,[('Photos /\nvideo',GREY),('MTCNN\nface crops',BLUE),('Augment +\ncurate',GOLD),('DNN box\nlabels',ROSE),('YOLO\ntraining',GREEN)],.55)
txt(a,.5,.19,'Review / backup / undo  •  normalized bounding boxes  •  inspect saved run artifacts',10)
b=panel(fig,[.025,.07,.46,.27],'b  Packaged split',GREEN)
for x,w,c,s in [(.08,.64,BLUE,'Train 80%'),(.72,.08,GOLD,'10%'),(.80,.08,GREEN,'10%')]:
    b.add_patch(Rectangle((x,.31),w,.26,fc=c+'70',ec=c)); txt(b,x+w/2,.44,s,9)
txt(b,.5,.14,'Validation 10% / Test 10%',9)
c=panel(fig,[.505,.07,.47,.27],'c  Evaluation boundary',ROSE)
txt(c,.5,.52,'Current split: shuffled images',11);txt(c,.5,.21,'Identity/session-disjoint grouping needs explicit design',10)
save(fig,'easyshield','dataset-workflow','Source workflow photos/video→MTCNNextract→augmentation+curation→OpenCV DNN boxlabel generation→YOLOtraining. Preserve80/10/10 image random split. Show inspectable artifacts but no invented training loss curves.',''.split(),'MTCNN and DNN are separate offline steps; no claim identity-disjoint split.')

fig=canvas('Five-frame scan aggregation and the class-map contract','Linux tester behavior; counts shown symbolically rather than fabricated scan results')
a=panel(fig,[.025,.07,.48,.78],'a  Scan decision',BLUE)
stages(a,[('Up to 5\nface crops',BLUE),('Confidence\nfilter',GOLD),('Semantic\nvotes',GREEN)],.65)
txt(a,.5,.46,r'$n_R>n_F\;\Rightarrow\;\mathrm{REAL}$',18)
txt(a,.5,.29,r'$n_R\leq n_F\;\Rightarrow\;\mathrm{ATTACK}$',18)
txt(a,.5,.13,'Tie / no accepted predictions → attack branch',10)
b=panel(fig,[.525,.07,.45,.78],'b  Deployment metadata',ROSE)
box(b,.12,.65,.76,.15,'Dataset and benchmark\n0 = fake, 1 = real',BLUE)
box(b,.12,.40,.76,.15,'Live tester interpretation\n0 = real, 1 = fake',ROSE)
box(b,.12,.12,.76,.17,'Verify saved checkpoint class map\nDo not assume interchangeable IDs',GOLD)
save(fig,'easyshield','decision-contract','Linuxscanup to5frames confidencefilter thennR/nFvotes. REALonlynR>nF;ATTACKties/noaccepted. Separateexplicitclass-map mismatchdatasetbenchmark0fake1real vs livetester0real1fake requiring checkpointmetadata. No numericexamplevote outcomes.',''.split(),'Capture/face failures may be separate UI errors; do not assert every capture failure always reaches aggregation.')

# SmartHart.
fig=canvas('Seven-feature sequence classification','Synthetic vital signs; shapes correspond to the inspected model definition')
a=panel(fig,[.025,.39,.95,.46],'a  Feature-to-model contract',BLUE)
stages(a,[('5 simulated\nmeasurements',GREY),('Add PP / SI\n7 features',GOLD),('Scale + window\n10 × 7',BLUE),('BiLSTM\n128 / 64',ROSE),('Dense64\nsoftmax C',GREEN)],.55)
txt(a,.5,.20,'10 × 7  →  10 × 256  →  128  →  64  →  C classes',12)
b=panel(fig,[.025,.07,.46,.28],'b  Feature definitions',GOLD)
txt(b,.5,.56,r'$PP=P_{sys}-P_{dia}$',16);txt(b,.5,.23,r'$SI=HR/(P_{sys}+10^{-6})$',15)
c=panel(fig,[.505,.07,.47,.28],'c  Saved inference contract',GREEN)
txt(c,.5,.56,'Model + scaler + label map',13);txt(c,.5,.23,'Synthetic scenarios; no patient validation',11)
save(fig,'smarthart','sequence-classifier','Featurecontract5measurements plusPP/SI7;tenrow window10x7;BiLSTM128perdirection sequence10x256, second64perdirectionfinal128,Dense64,Csoftmax(currentgenerator4). Dropout.2 can be discreet annotation, not mistaken as added dimension. Threeartifacts model/scaler/labels.',''.split(),'Do not imply clinical diagnostic validation or future observations beyond the completed window.')

fig=canvas('Online sliding windows and dashboard state','The runtime advances one observation; training defaults to stride ten')
a=panel(fig,[.025,.07,.47,.78],'a  Window progression',BLUE)
for row,start in [(0,0),(1,1),(2,2)]:
    for j in range(12): a.add_patch(Rectangle((.10+j*.063,.66-row*.16),.054,.09,fc=BLUE+'70' if start<=j<start+10 else '#f0f2f4',ec=GREY,lw=.4))
    txt(a,.88,.705-row*.16,f't+{row}',9)
txt(a,.5,.17,'10 observed rows per prediction\n9 rows shared by adjacent runtime windows',11)
b=panel(fig,[.515,.07,.46,.78],'b  Streaming interface loop',GREEN)
stages(b,[('Simulator\nobservation',BLUE),('Scale /\npredict',GOLD),('UI\nscheduler',GREEN)],.65)
box(b,.12,.38,.76,.15,'Predicted label vs known simulator label',ROSE)
box(b,.12,.12,.76,.16,'Rolling correctness: most recent 100 outcomes\nDefault generation interval: 0.5 s',GREY)
save(fig,'smarthart','streaming-dashboard','Runtime10row windows shift1share9rows, trainingstride10distinct. Simulatoremit7features transformpersistedscalerpred thenTkintereventloopcharts. Comparewithlastrowknownscenarioandrollinglast100correctness. Defaultinterval.5seconds notmeasuredpredictionlatency.',''.split(),'No synthetic patient trace, fabricated accuracy curve or real wearable network. Windowlabel belongs to last row.')

(OUT/'figure-specifications.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(f'Rendered {len(manifest)} bases in {OUT}')
