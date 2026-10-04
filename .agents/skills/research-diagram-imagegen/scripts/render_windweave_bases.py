"""Source-derived publication figures. No training or original-project writes."""
from pathlib import Path
import argparse
import hashlib
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, FancyArrowPatch, Circle
import numpy as np

OUTPUT = None
RECORDS = []
plt.rcParams.update({'font.family': 'sans-serif', 'font.sans-serif': ['Arial', 'DejaVu Sans'],
    'font.size': 10, 'mathtext.fontset': 'stix', 'svg.fonttype': 'path',
    'pdf.fonttype': 42, 'axes.linewidth': .7, 'savefig.facecolor': 'white'})
INK='#192c43'; BLUE='#477fb5'; RED='#ec657c'; GOLD='#cbb747'; GREY='#9aa9ba'; GREEN='#499267'
PALE='#e8f0f8'; LINE='#cfd7df'

def canvas(h=4.4):
    fig=plt.figure(figsize=(10,h),facecolor='white')
    return fig
def panel(fig, rect, label, title):
    ax=fig.add_axes(rect); ax.set_xlim(0,1); ax.set_ylim(0,1); ax.axis('off')
    ax.text(0,1.025,label,weight='bold',fontsize=12,color=INK,va='bottom')
    ax.text(.027/rect[2],1.025,title,weight='bold',fontsize=11,color=INK,va='bottom')
    return ax
def text(ax,x,y,s,size=10,color=INK,ha='center',weight='normal',**kwargs):
    return ax.text(x,y,s,fontsize=size,color=color,ha=ha,va='center',weight=weight,**kwargs)
def rect(ax,x,y,w,h,color='white',edge=LINE,ls='-',lw=.8):
    ax.add_patch(Rectangle((x,y),w,h,facecolor=color,edgecolor=edge,linewidth=lw,linestyle=ls))
def arrow(ax,x,y,xx,yy,color=INK,ls='-',rad=0):
    ax.add_patch(FancyArrowPatch((x,y),(xx,yy),arrowstyle='-|>',mutation_scale=9,
        linewidth=.95,color=color,linestyle=ls,connectionstyle=f'arc3,rad={rad}',clip_on=False))
def matrix(ax,x,y,w,h,rows=6,cols=4,color=BLUE,zero=False):
    for r in range(rows):
        for c in range(cols):
            rect(ax,x+c*w/cols,y+r*h/rows,w/cols*.90,h/rows*.88,
                 'white' if zero else color,LINE if zero else 'white',lw=.45)
def save(fig, name, title):
    outputs = {}
    for extension in ('svg', 'pdf', 'png'):
        target = OUTPUT / f'{name}.{extension}'
        metadata = {'Title': title}
        if extension == 'svg':
            metadata['Description'] = 'Source-derived schematic; no measured performance data.'
        kwargs = {'dpi': 160} if extension == 'png' else {}
        fig.savefig(target, metadata=metadata, **kwargs)
        outputs[extension] = {
            'file': target.name,
            'bytes': target.stat().st_size,
            'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
        }
    width, height = plt.imread(OUTPUT / f'{name}.png').shape[1::-1]
    RECORDS.append({'name': name, 'title': title, 'width': width, 'height': height, 'outputs': outputs})
    plt.close(fig)

def render_architecture():
    # 1. A multi-panel system view: compact encoding, CPU preparation, and consumption.
    fig=canvas(5.0)
    a=panel(fig,[.055,.52,.90,.36],'a','Streaming data path')
    centers=[.075,.275,.475,.675,.90]
    labels=['ERA5 archive','Sample address','CPU worker','Prefetch / collate','GPU step']
    subs=['location CSVs',r'$i\mapsto(j,a)$','slice + normalize',r'$W$ workers, $P$ batches','forward / backward']
    for x,label,sub in zip(centers,labels,subs):
        text(a,x,.86,label,10,weight='bold');text(a,x,.09,sub,9)
    for x,xx in zip(centers[:-1],centers[1:]): arrow(a,x+.060,.49,xx-.065,.49)
    for k in range(3):
        rect(a,.025+k*.013,.30+k*.035,.07,.35,'white',BLUE)
        for q in range(4):a.plot([.035+k*.013,.084+k*.013],[.36+k*.035+q*.056]*2,color=LINE,lw=.65)
    for k in range(3):
        rect(a,.225,.30+k*.115,.10,.09,PALE,BLUE)
        text(a,.275,.345+k*.115,['file','offset','stride'][k],8)
    matrix(a,.438,.31,.078,.36,7,4)
    for k in range(3): matrix(a,.627+k*.023,.32+k*.045,.073,.30,5,4,color=[BLUE,GOLD,GREY][k])
    rect(a,.861,.28,.079,.40,PALE,BLUE)
    for y in np.linspace(.34,.61,4):
        for x in np.linspace(.873,.922,3):rect(a,x,y,.013,.046,BLUE,'white',lw=.3)
    b=panel(fig,[.055,.10,.90,.27],'b','Training lifecycle and retained state')
    stages=[(.03,'Index',r'$\{N_j,C_j\}_{j=0}^{F-1}$'),(.285,'Normalize',r'$(n,\mu,M_2)\to(\mu,\sigma)$'),
            (.545,'Construct',r'$(X_{enc},T_{enc},X_{dec},T_{dec},Y)$'),(.84,'Consume',r'$\mathcal{L}\,/\,R\to\nabla_\theta$')]
    for x,l,math in stages:
        text(b,x+.07,.79,l,10,weight='bold');text(b,x+.07,.51,math,11)
    for x,xx in [(.15,.27),(.40,.53),(.68,.82)]:arrow(b,x,.67,xx,.67)
    b.plot([.01,.99],[.18,.18],color=LINE,lw=.8)
    text(b,.19,.02,'once at initialization',9,color=GREY)
    text(b,.72,.02,'repeated during training',9,color=BLUE)
    save(fig,'architecture','CPU–GPU streaming system')

def render_index():
    # 2. The actual worked indexing example, visually aligned to row boundaries.
    fig=canvas(4.6)
    a=panel(fig,[.055,.55,.42,.32],'a','Implicit sample address space')
    for name,x,n,c in [('A',.05,4,BLUE),('B',.43,6,RED)]:
        text(a,x+.15,.94,f'File {name}',10,weight='bold')
        for k in range(n):
            rect(a,x+k*.052,.53,.047,.22,c,'white')
            text(a,x+k*.052+.024,.39,str(k if name=='A' else k+4),8)
    text(a,.48,.11,r'$C=[4,10],\quad i=6$',13)
    rect(a,.43+2*.052-.006,.51,.059,.26,'none',INK,lw=1.2)
    b=panel(fig,[.55,.55,.395,.32],'b','Resolve index 6')
    for y,s in zip([.82,.57,.32,.07],[r'$j=\mathrm{bisect\_right}([4,10],6)=1$',r'$\ell=6-C_0=2$',r'$a=\ell s=2\times9=18$',r'$[a,a+L+H)=[18,90)$']):text(b,.46,y,s,12)
    c=panel(fig,[.055,.10,.89,.28],'c','Selected rows in file B')
    x0=.025; scale=.95/117
    rect(c,x0,.42,117*scale,.22,'#f4f6f8',LINE)
    rect(c,x0+18*scale,.42,45*scale,.22,BLUE,'white')
    rect(c,x0+63*scale,.42,27*scale,.22,RED,'white')
    for n in [0,18,63,90,117]:
        x=x0+n*scale;c.plot([x,x],[.36,.67],color=INK,lw=.65);text(c,x,.22,str(n),9)
    text(c,x0+40.5*scale,.86,'encoder: 45 rows',10,color=BLUE)
    text(c,x0+76.5*scale,.86,'target: 27 rows',10,color=RED)
    text(c,.48,.00,'Half-open row intervals; stride = 9 observations',9,color=GREY)
    save(fig,'index','Implicit window indexing')

def render_normalization():
    # 3. Parallel sufficient statistics and an exact analytical merger example.
    fig=canvas(4.6)
    a=panel(fig,[.055,.16,.43,.72],'a','Parallel summary reduction')
    for y,j,c in [(.77,'A',BLUE),(.48,'B',RED),(.19,'C',GREY)]:
        matrix(a,.02,y-.06,.08,.15,5,3,color=c)
        text(a,.08,y+.16,f'file {j}',9)
        arrow(a,.12,y,.24,y)
        text(a,.37,y,fr'$(n_{j},\mu_{j},M_{{2,{j}}})$',12,color=c)
        arrow(a,.52,y,.70,.48)
    text(a,.82,.60,'merge',10,weight='bold')
    text(a,.82,.39,r'$(n,\mu,M_2)$',12)
    arrow(a,.82,.29,.82,.10)
    text(a,.82,.01,r'$\sigma=\sqrt{M_2/n}$',12)
    b=panel(fig,[.56,.16,.38,.72],'b','Between-file correction')
    for y,label,values,c in [(.77,'A',[0,2],BLUE),(.47,'B',[4,6],RED)]:
        text(b,.04,y,label,10,color=c,weight='bold')
        for v in values:
            x=.17+v*.115;b.plot(x,y,'o',color=c,ms=6);text(b,x,y+.14,str(v),9,color=c)
        b.plot([.17+values[0]*.115,.17+values[1]*.115],[y,y],color=c,lw=.8)
    text(b,.48,.20,r'$\mu_A=1,\quad\mu_B=5,\quad\mu=3$',12)
    text(b,.48,-.015,r'$M_2=2+2+4^2\!\cdot\!\frac{2\cdot2}{4}=20$',12)
    text(b,.48,-.16,'Exact toy values; not weather measurements',8,color=GREY)
    save(fig,'normalization','Parallel normalization summaries')

def render_tensors():
    # 4. Timeline + sparse tensor block geometry, with TeX mathematical labels.
    fig=canvas(5.3)
    a=panel(fig,[.055,.59,.89,.26],'a','Observation alignment')
    for x,w,c in [(.025,.59,BLUE),(.615,.354,RED)]:rect(a,x,.39,w,.24,c,'white')
    rect(a,.025+21*.944/72,.39,24*.944/72,.24,'none',GOLD,lw=2)
    for n in [0,21,45,72]:text(a,.025+n*.944/72,.23,str(n),9)
    text(a,.31,.80,r'encoder history $L=45$',11,color=BLUE)
    text(a,.79,.80,r'forecast $H=27$',11,color=RED)
    text(a,.45,.02,r'known decoder context $K=24$',10,color='#9b8921')
    b=panel(fig,[.055,.13,.89,.29],'b','Five tensors returned per sample')
    names=[r'$X_{enc}$',r'$T_{enc}$',r'$X_{dec}$',r'$T_{dec}$',r'$Y$']
    shapes=[r'$45\times4$',r'$45\times4$',r'$51\times4$',r'$51\times4$',r'$27\times2$']
    for k,(name,shape) in enumerate(zip(names,shapes)):
        x=.025+k*.20
        text(b,x+.065,.86,name,12)
        if k==2:
            matrix(b,x,.56,.13,.23,3,4,color=GOLD);matrix(b,x,.30,.13,.25,3,4,zero=True)
        else:matrix(b,x,.30,.13,.49,6,2 if k==4 else 4,color=[BLUE,GREY,BLUE,GREY,RED][k])
        text(b,x+.065,.14,shape,11)
        text(b,x+.065,-.08,'Int64' if k in [1,3] else 'Float32',8,color=GREY)
    text(b,.445,-.27,'outline cells: zero placeholders',8,color=GREY)
    save(fig,'tensors','Encoder–decoder tensor contract')

def render_locality():
    # 5. Cache behavior represented by file requests and hit/miss states.
    fig=canvas(4.8)
    for rect_,letter,title,files in [([.055,.58,.40,.27],'a','Local file access',['A','A','A','A','B','B']),
                                  ([.055,.18,.40,.27],'b','Interleaved file access',['A','B','C','A','C','B'])]:
        ax=panel(fig,rect_,letter,title);prev=None
        for k,file in enumerate(files):
            x=.075+k*.158;color={'A':BLUE,'B':RED,'C':GOLD}[file]
            rect(ax,x-.045,.48,.09,.28,color,'white');text(ax,x,.62,file,11,color='white',weight='bold')
            hit=file==prev;text(ax,x,.19,'reuse' if hit else 'read',9,color=GREEN if hit else INK)
            if k<5:arrow(ax,x+.047,.62,x+.108,.62)
            prev=file
        text(ax,.47,-.05,'one active DataFrame per worker',8,color=GREY)
    c=fig.add_axes([.58,.24,.36,.55])
    c.text(-.08,1.17,'c',transform=c.transAxes,fontsize=12,weight='bold',color=INK)
    c.text(.01,1.17,'Queued tensor payload',transform=c.transAxes,fontsize=11,weight='bold',color=INK)
    workers=np.arange(1,17)
    for p,color in [(1,BLUE),(2,GOLD),(4,RED)]:
        mib=workers*p*32*4824/(1024**2)
        c.plot(workers,mib,color=color,lw=1.4,label=fr'$P={p}$')
    c.set_xlabel(r'Worker count $W$',color=INK)
    c.set_ylabel('Raw tensor payload (MiB)',color=INK)
    c.set_xticks([1,4,8,12,16]);c.set_xlim(1,16);c.set_ylim(0,10)
    c.spines[['top','right']].set_visible(False)
    c.spines[['left','bottom']].set_color(INK)
    c.tick_params(colors=INK,labelsize=9,width=.7)
    c.grid(axis='y',color=LINE,lw=.5)
    c.legend(frameon=False,fontsize=9,loc='upper left')
    c.text(.5,-.29,r'$M=WPB\,S,\quad B=32,\ S=4824$ bytes',transform=c.transAxes,ha='center',fontsize=11,color=INK)
    c.text(.5,-.41,'Analytical estimate; excludes file caches',transform=c.transAxes,ha='center',fontsize=8,color=GREY)
    save(fig,'locality','File-cache locality and analytical prefetch payload')

def render_sequence():
    # 6. Sequence lifelines and a schematic of preparation ahead of consumption.
    fig=canvas(5.5)
    a=panel(fig,[.055,.32,.89,.54],'a','Batch request and sample construction')
    xs=[.07,.35,.64,.93];labels=['Training loop','DataLoader','CPU worker','CSV / cache']
    for x,l in zip(xs,labels):
        text(a,x,.97,l,10,weight='bold');a.plot([x,x],[.08,.87],color=GREY,lw=.7,ls=(0,(3,3)))
    steps=[(0,1,.83,'request batch'),(1,2,.68,'assign indices'),(2,3,.53,'read on miss'),
           (3,2,.39,'active DataFrame'),(2,1,.25,'five aligned tensors'),(1,0,.10,'collated batch')]
    for f,t,y,label in steps:
        arrow(a,xs[f],y,xs[t],y,ls='--' if f>t else '-')
        text(a,(xs[f]+xs[t])/2,y+.065,label,9)
    b=panel(fig,[.055,.10,.89,.125],'b','Preparation ahead of GPU demand (schematic)')
    for y,l,c,offset in [(.63,'CPU',BLUE,0),(.12,'GPU',RED,.14)]:
        text(b,.025,y,l,9,weight='bold')
        for k in range(4):
            x=.09+offset+k*.18;rect(b,x,y-.12,.15,.26,c,'white');text(b,x+.075,y,f'batch {k+1}',8,color='white')
    arrow(b,.12,-.27,.94,-.27);text(b,.52,-.50,'ordering only; widths do not represent measured durations',8,color=GREY)
    save(fig,'sequence','CPU–GPU batch-production sequence')

def render_feedback():
    # 7. Learning routes with recorded future observations as feedback.
    fig=canvas(4.5)
    a=panel(fig,[.055,.58,.89,.28],'a','History and withheld future')
    rect(a,.01,.30,.50,.26,BLUE,'white');rect(a,.51,.30,.30,.26,RED,'white')
    text(a,.26,.43,'observed history',10,color='white')
    text(a,.66,.43,'withheld future',10,color='white')
    for x,s in [(.01,'0'),(.51,'45'),(.81,'72')]:text(a,x,.17,s,9)
    text(a,.26,.82,r'$S:\ 45$ history rows + time marks',11,color=BLUE)
    text(a,.68,.82,r'$Y:\ 27$ target rows',11,color=RED)
    text(a,.91,.42,'stream next\nwindow',9)
    arrow(a,.82,.43,.85,.43)
    b=panel(fig,[.055,.18,.89,.24],'b','Optimization routes using the same streamed sample')
    for y,label,color in [(.73,'Supervised',BLUE),(.13,'RL policy',GOLD)]:
        text(b,.07,y,label,10,color=color,weight='bold')
        arrow(b,.15,y,.23,y,color)
        text(b,.32,y,'forecast' if label=='Supervised' else 'sample forecast',10)
        arrow(b,.42,y,.50,y,color)
        text(b,.62,y,r'$\mathcal{L}_{MSE}(\widehat Y,Y)$' if label=='Supervised' else r'$R(\widehat Y,Y)$',13)
        arrow(b,.73,y,.81,y,color)
        text(b,.91,y,'backpropagate' if label=='Supervised' else 'policy gradient',10)
    arrow(b,.91,.02,.91,-.08,GOLD)
    arrow(b,.91,-.08,.32,-.08,GOLD)
    arrow(b,.32,-.08,.32,.02,GOLD)
    text(b,.61,-.28,'reward feedback updates forecast sampling probabilities',9,color=INK)
    text(b,.48,-.56,'Reward: component error + temporal pattern + event agreement + variability',9,color=GREY)
    save(fig,'feedback','Forecast–reward learning loop')

def main():
    global OUTPUT
    parser = argparse.ArgumentParser(description='Render the seven inspected WindWeave scientific bases with Matplotlib; no ML or original-project writes.')
    parser.add_argument('--output-dir', required=True, type=Path, help='Explicit task directory for SVG, PDF, PNG, and bases-manifest.json')
    parser.add_argument('--figures', nargs='+', choices=FIGURES, default=list(FIGURES), help='Optional subset of figures')
    parser.add_argument('--overwrite', action='store_true', help='Explicitly replace selected generated files in output-dir')
    args = parser.parse_args()
    OUTPUT = args.output_dir.resolve()
    selected = list(dict.fromkeys(args.figures))
    targets = [OUTPUT / f'{name}.{extension}' for name in selected for extension in ('svg', 'pdf', 'png')]
    targets.append(OUTPUT / 'bases-manifest.json')
    if not args.overwrite:
        existing = [str(target) for target in targets if target.exists()]
        if existing:
            parser.error('Output already exists; use a sibling directory or --overwrite: ' + ', '.join(existing))
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for name in selected:
        FIGURES[name]()
    (OUTPUT / 'bases-manifest.json').write_text(json.dumps(RECORDS, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'directory': str(OUTPUT), 'figures': [record['name'] for record in RECORDS]}))

FIGURES = {
    'architecture': render_architecture,
    'index': render_index,
    'normalization': render_normalization,
    'tensors': render_tensors,
    'locality': render_locality,
    'sequence': render_sequence,
    'feedback': render_feedback,
}

if __name__ == '__main__':
    main()
