"""Matplotlib STL reference rendering; no dimensions or manufacturing instructions.
Private source is read only. Rendered outlines are references for imagegen.
"""
from pathlib import Path
import struct,json
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection

def mesh(path):
    raw=path.read_bytes(); n=struct.unpack_from('<I',raw,80)[0]
    if 84+50*n==len(raw):
        dt=np.dtype([('normal','<f4',(3,)),('v','<f4',(3,3)),('attr','<u2')]);return np.frombuffer(raw,dt,count=n,offset=84)['v'].copy()
    import re
    v=np.array([[float(s) for s in m] for m in re.findall(rb'vertex\s+([-+\d.eE]+)\s+([-+\d.eE]+)\s+([-+\d.eE]+)',raw)])
    return v.reshape(-1,3,3)

import argparse
parser=argparse.ArgumentParser(description='Read supplied STL files and render geometry-only reference sheets.')
parser.add_argument('--source-root',type=Path,required=True,help='Directory containing fish feader/ and filter/')
parser.add_argument('--output-dir',type=Path,required=True)
parser.add_argument('--overwrite',action='store_true')
args=parser.parse_args()
source_root=args.source_root.resolve()
out=args.output_dir.resolve()
if out.exists() and not args.overwrite and any(out.glob('*')):
    parser.error('Output directory is not empty. Select a new directory or explicitly pass --overwrite.')
out.mkdir(parents=True,exist_ok=True)
for name,files in [('feeder-components',[('Base','fish feader/base_flat.stl'),('Rotor','fish feader/rotor_flat.stl'),('Wall','fish feader/wall_flat.stl'),('Lid','fish feader/lid_flat.stl')]),('filter-shape',[('Filter body','filter/filter.STL')])]:
    fig=plt.figure(figsize=(12,6));fig.text(.03,.94,'Source CAD outlines — '+name.replace('-',' '),fontsize=16,weight='bold');fig.text(.03,.89,'Geometry reference only; dimensions and fabrication parameters omitted',fontsize=10)
    for i,(label,file) in enumerate(files):
        arr=mesh(source_root/file);stride=max(1,len(arr)//2200)
        pos=[.025+i*.245,.08,.235,.73] if len(files)>1 else [.15,.08,.7,.73]
        ax=fig.add_axes(pos,projection='3d');ax.add_collection3d(Poly3DCollection(arr[::stride],facecolor='#dfe7ec',edgecolor='#416985',linewidth=.15,alpha=.75))
        xyz=arr.reshape(-1,3);lo=xyz.min(0);hi=xyz.max(0);center=(hi+lo)/2;span=(hi-lo).max()*.58
        ax.set_xlim(center[0]-span,center[0]+span);ax.set_ylim(center[1]-span,center[1]+span);ax.set_zlim(center[2]-span,center[2]+span);ax.view_init(35,-60);ax.set_box_aspect([1,1,1]);ax.axis('off');ax.set_title(label,fontsize=12)
    fig.savefig(out/f'{name}.png',dpi=160);plt.close(fig)
print('Rendered two geometry-reference sheets; source files were read only.')
