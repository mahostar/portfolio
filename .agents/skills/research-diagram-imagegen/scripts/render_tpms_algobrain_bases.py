from pathlib import Path
import json
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Polygon

import argparse
parser=argparse.ArgumentParser(description='Render source-grounded TPMS, AlgoBrain and EasyShield scientific bases.')
parser.add_argument('--output-dir', required=True)
parser.add_argument('--overwrite', action='store_true')
args=parser.parse_args()
OUT=Path(args.output_dir).resolve()
OUT.mkdir(parents=True, exist_ok=True)
if any(OUT.glob('*-base.*')) and not args.overwrite:
    parser.error('Selected output directory already contains bases; use a fresh directory or --overwrite.')
plt.rcParams.update({'font.family':'DejaVu Sans', 'font.size':10, 'mathtext.fontset':'stix', 'svg.fonttype':'path', 'pdf.fonttype':42})
INK='#192c43'
COLORS=['#9aa9ba','#477fb5','#b99a37','#d15d75','#499267']
PALES=['#f0f2f4','#eaf3fc','#fff8df','#fcecef','#edf7ed']
manifest=[]

def canvas(title, subtitle='', cover=False):
    f=plt.figure(figsize=(14,8), facecolor='white')
    a=f.add_axes([.015,.02,.97,.96]); a.set(xlim=(0,14),ylim=(0,8)); a.axis('off')
    a.text(.2,7.7,title,fontsize=27 if cover else 19,weight='bold',color=INK,va='top')
    a.text(.2,7.12,subtitle,fontsize=11,color=INK,va='top')
    return f,a

def panel(a,x,y,w,h,title,i):
    a.add_patch(FancyBboxPatch((x,y),w,h,boxstyle='round,pad=.04,rounding_size=.10',facecolor=PALES[i%5],edgecolor=COLORS[i%5],lw=1))
    a.text(x+.15,y+h-.16,title,fontsize=12,weight='bold',va='top',color=INK)

def box(a,x,y,w,h,title,body='',i=1):
    a.add_patch(FancyBboxPatch((x,y),w,h,boxstyle='round,pad=.025,rounding_size=.06',facecolor='white',edgecolor=COLORS[i%5],lw=.8))
    a.text(x+w/2,y+h-.15,title,ha='center',va='top',weight='bold',fontsize=10,color=INK)
    a.text(x+w/2,y+h/2-.15,body,ha='center',va='center',fontsize=9,color=INK,linespacing=1.65)

def arrow(a,p,q,c=INK):
    a.add_patch(FancyArrowPatch(p,q,arrowstyle='-|>',mutation_scale=13,lw=1.3,color=c,clip_on=False))

def wave(a,x,y,w,h,c=COLORS[1],raw=False):
    t=np.linspace(0,1,400)
    v=np.sin(2*np.pi*8*t)*(.25+.7*np.exp(-((t-.55)/.15)**2))
    if raw: v += .35*np.sin(2*np.pi*.8*t)+.15*np.sin(2*np.pi*49*t)
    a.plot(x+w*t,y+h*.5+h*.3*v,color=c,lw=1)

def save(f,name,spec):
    for ext in ['png','svg','pdf']:
        f.savefig(OUT/f'{name}-base.{ext}',dpi=160)
    manifest.append({'name':name,'base':str(OUT/f'{name}-base.png'),'spec':spec})
    plt.close(f)

f,a=canvas('TPMS Studio: desktop geometry workflow','Source-derived architecture: GUI_API.py and tpms_generator.py')
panel(a,.2,4.05,13.6,2.7,'a   Configuration and asynchronous generation',1)
stages=[('Desktop controls','Preset / custom equation\nCell count, domain size\nBand, target file size'),('GenerationWorker','QThread runs API\nDisable Generate button\nReturn result / error'),('TPMSGeneratorAPI','Select resolution\nEvaluate scalar field\nExtract triangle mesh'),('Mesh assessment','Merge vertices\nFix normals\nWatertight + Euler'),('Preview / export','PyVistaQt viewer\nTriangles + status\nSTL export')]
for i,(title,body) in enumerate(stages):
    x=.45+i*2.7; box(a,x,4.5,2.35,1.7,title,body,i)
    if i<4: arrow(a,(x+2.38,5.25),(x+2.66,5.25))
panel(a,.2,.45,6.5,3.2,'b   Reproducible configuration',2)
box(a,.5,1.0,2.7,2.0,'Geometry',r'$\omega_a=2\pi n_a/L_a$'+'\n6 main presets\nIsovalue C and field band',2)
box(a,3.6,1.0,2.7,2.0,'Sampling budget','Explicit grid or size estimate\nAutomatic grid cap: 300\nNo automatic decimation',1)
panel(a,7.0,.45,6.8,3.2,'c   Result semantics',4)
box(a,7.4,1.0,2.8,2.0,'Returned mesh','Vertices + triangular faces\nTopology status and Euler\nElapsed generation time',4)
box(a,10.5,1.0,2.9,2.0,'Export boundary','Export checks success\nWatertight status reported\nNot a printability guarantee',3)
save(f,'tpms-software','Two paths are separate: desktop worker API shown here; React educational viewer not in this pipeline. No learned model, no automatic export topology gate, no guarantee of physical wall thickness or target filesize.')

f,a=canvas('From an implicit field to a closed TPMS shell','Mathematical geometry and boundary closure; illustrations are analytical / schematic')
panel(a,.2,3.5,6.5,3.3,'a   Periodic scalar field and solid band',1)
a.text(.55,6.10,r'$\theta_a=\omega_a x_a,\quad \omega_a=2\pi n_a/L_a$',fontsize=15)
a.text(.55,5.5,r'$F=\sin\theta_x\cos\theta_y+\sin\theta_y\cos\theta_z$',fontsize=14)
a.text(.55,5.12,r'$\qquad+\sin\theta_z\cos\theta_x-C$',fontsize=14)
a.text(.55,4.48,r'$S=\tau/2-|F|\quad ;\quad S\geq0\ \mathrm{is\ solid}$',fontsize=16)
a.text(.55,3.9,'Band parameter is not a signed-distance thickness.',fontsize=10)
panel(a,7.0,3.5,6.8,3.3,'b   Exterior padding closes boundary cuts',3)
xs=np.linspace(0,1,400); ys=.85*np.sin(2*np.pi*xs)
a.fill_between(7.6+5.5*xs,4.45+ys*.4-.16,4.45+ys*.4+.16,color=COLORS[1],alpha=.5)
a.plot([7.5,7.5],[3.98,5.2],color=COLORS[3],lw=5);a.plot([13.25,13.25],[3.98,5.2],color=COLORS[3],lw=5)
a.text(7.5,5.82,'Sampled interior',fontsize=11)
a.text(7.5,5.3,'One exterior layer: S = -1',fontsize=11,color=COLORS[3])
a.text(7.5,3.78,'Zero crossing produces end caps (schematic).',fontsize=10)
panel(a,.2,.35,6.5,2.75,'c   Marching cubes and physical coordinates',2)
box(a,.5,.8,2.45,1.7,'Extract S = 0','PyMCubes\nVertices and triangles',2)
box(a,3.7,.8,2.6,1.7,'Rescale vertices',r'$x_a=(v_a-1)L_a/(r_a-1)$'+'\nSubtract pad offset\nPhysical coordinate units',1)
arrow(a,(3.0,1.6),(3.65,1.6))
panel(a,7.0,.35,6.8,2.75,'d   Topology checks after extraction',4)
box(a,7.4,.8,2.75,1.7,'Clean mesh','Merge vertices / fix normals\nCheck closed connectivity\nEuler number',4)
box(a,10.5,.8,2.9,1.7,'Watertight condition','Each edge has two faces\nStatus checked per mesh\nFeature fidelity still matters',3)
arrow(a,(10.2,1.6),(10.45,1.6))
save(f,'tpms-geometry','Exact band S=tau/2-|F|, C subtracted once, negative pad value -1 one voxel each side, marching cubes level0 and subtract1 before scaling L/(r-1). Closed edge connectivity is checked per mesh. No guarantee all settings watertight, no signed distance, no guaranteed physical thickness, no exact size budget.')

f,a=canvas('AlgoBrain: custom bio-amplifier and acquisition hardware','Functional analog path from project notes and original prototype; not a calibrated circuit schematic')
panel(a,.2,4.0,13.6,2.7,'a   Four-stage TL074 analog front end',1)
stages=[('Electrodes','Forehead channel\nEar references\nMixed EEG / EMG'),('Differential input','Measure relative signal\nCommon interference\nElectrode interface'),('High-pass stage','Reduce DC drift\nPreserve changing signal\nAnalog conditioning'),('Gain stage','Amplify signal\nMatch acquisition range\nAvoid clipping'),('Low-pass stage','Limit fast components\nOutput to Arduino A0\nADC acquisition')]
for i,(title,body) in enumerate(stages):
    x=.45+i*2.7;box(a,x,4.4,2.35,1.75,title,body,i)
    if i<4:arrow(a,(x+2.38,5.2),(x+2.65,5.2))
panel(a,.2,.45,6.5,3.15,'b   Physical prototype',2)
box(a,.6,1.0,2.65,1.9,'Custom PCB','TL074 quad op-amp\nPassive conditioning\n3D-printed enclosure',2)
box(a,3.7,1.0,2.55,1.9,'Arduino acquisition','Analog input A0\nRaw ADC values\nSerial / control firmware',1)
arrow(a,(3.3,1.8),(3.65,1.8))
panel(a,7,.45,6.8,3.15,'c   Signal interpretation',4)
wave(a,7.5,1.1,5.6,1.4,raw=True)
a.text(7.5,2.7,'Biological activity + motion + interference',fontsize=11)
a.text(7.5,.9,'Waveform is illustrative, not a recorded EEG trace.',fontsize=10)
save(f,'algobrain-hardware','Functional diagram only. Four-stage TL074 differential input/highpass/gain/lowpass, forehead+ear references, custom PCB and Arduino A0. No resistor values, calibrated gains, cutoff frequencies, certified safety, thought decoding or clinical claim. Illustrative waveforms not experiment.')

f,a=canvas('AlgoBrain: digital acquisition, analysis and control','Separate source variants; shared filter concept does not imply identical sampling cadence')
panel(a,.2,3.65,13.6,3.05,'a   Data sender and desktop analysis',1)
stages=[('Acquire + filter','A0 raw samples\n500 Hz target\nFour causal SOS'),('Serial protocol','115200 baud\nraw, filtered, cycle\nCycle modulo 1000'),('Desktop ingestion','Serial reader thread\nQueue to processing\n2500-sample deques'),('Spectrum + record','Last 256 samples\nHann window + FFT\nCSV with event labels')]
for i,(title,body) in enumerate(stages):
    x=.5+i*3.4;box(a,x,4.15,2.85,1.95,title,body,i+1)
    if i<3:arrow(a,(x+2.9,5.1),(x+3.35,5.1))
panel(a,.2,.45,13.6,2.85,'b   Archived IR control variant',3)
stages=[('Envelope decision','128-sample rolling mean\nSensitivity factor 4\nThreshold > 13'),('IR transmitter','Send on rising event\nTwo NEC sends\nTwo 200 ms delays'),('IR receiver','Decode frame\nToggle if unblocked\nRed / green indicators'),('Re-arm condition','5 s without decoded IR\nEvery frame refreshes timer\nCode check commented out')]
for i,(title,body) in enumerate(stages):
    x=.5+i*3.4;box(a,x,1.0,2.85,1.7,title,body,i+1)
    if i<3:arrow(a,(x+2.9,1.8),(x+3.35,1.8))
a.text(.5,.61,'Controller timer is 20 ms (50 Hz nominal); blocking IR delays further interrupt acquisition.',fontsize=10,color=INK)
save(f,'algobrain-software','Upper branch simple_data_sender.ino 1e6/500=2000us target500Hz and desktop2500deques FFTlast256 Hann assumes500Hz. Lower IR variant 1e7/500=20000us50Hznominal, rolling integer envelope factor4 threshold>13, rising twoNECsends two200ms delays. Receiver resets lastSignalTime for everyframe, rearm only >5s quiet, specific code validation disabled. No ML, zero-phase, verified latency or thought classifier.')

for name,title,subtitle,stages in [
 ('algobrain-cover','ALGOBRAIN','BIO-SIGNAL ACQUISITION & PROCESSING',[
 ('1  BIO-AMPLIFIER','Forehead / ear references\nCustom TL074 front end\nDifferential + HP + gain + LP'),
 ('2  ACQUISITION','Arduino A0\n500 Hz sender target\nRaw / filtered / cycle'),
 ('3  SIGNAL PROCESSING','Four causal SOS filters\nWaveform inspection\n128-sample envelope variant'),
 ('4  ANALYSIS','Serial queue + deques\nHann-window FFT\nEvent-labeled CSV'),
 ('5  CONTROL','Threshold rising event\nIR transmitter / receiver\nRelay + status indicators')]),
 ('easyshield-cover','EASYSHIELD','VISUAL LIVENESS & DATASET ENGINEERING',[
 ('1  SOURCE DATA','Photos / videos\nReal face / presentation attacks\nFace-centered samples'),
 ('2  CURATION','MTCNN extraction\nAugmentation + inspection\nManual review / undo'),
 ('3  CUDA TRAINING','Normalized YOLO box labels\n80 / 10 / 10 image split\nYOLOv12-nano training'),
 ('4  LIVE INFERENCE','Camera + Haar localization\nContextual crop\n640 x 640 model input'),
 ('5  LIVENESS GATE','Class + confidence\nLinux five-frame vote\nIdentity remains downstream')])]:
    f,a=canvas(title,subtitle,True)
    for i,(t,b) in enumerate(stages):
        x=.2+i*2.76;panel(a,x,.65,2.5,5.95,t,i)
        box(a,x+.15,4.15,2.2,1.6,'Source-derived stages',b,i)
        wave(a,x+.25,2.15,2.0,1.3,COLORS[i],raw=i==0)
        a.text(x+.22,1.15,'Illustrative schematic',fontsize=8,color=INK)
        if i<4:arrow(a,(x+2.5,3.4),(x+2.75,3.4))
    save(f,name,'Cover-only. Rich white scientific panel style from WindWeave. AlgoBrain no NVIDIA/CUDA or learned models. EasyShield NVIDIA/CUDA technology branding in header only, no certification/endorsement claim. No fabricated performance statistics. Waveforms and face examples illustrative only; domain imagery should replace generic base waveforms on EasyShield.')

(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps(manifest,indent=2))
