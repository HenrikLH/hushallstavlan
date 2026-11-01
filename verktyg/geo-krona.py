"""Gör om sommarträdets krona (ruta 1 i bilder/vader/trees-v2.webp) till SVG-ytor per färgton, så att appen kan färga om
och tunna ut samma krona dag för dag utan att stilen ändras. Skriver JSON: [[ton, cx, cy, area, "M…Z"], …] i ruta 4:s koordinater.
Kör: python3 verktyg/geo-krona.py > /tmp/krona.json"""
import numpy as np,cv2,json,sys
from PIL import Image
im=np.array(Image.open('bilder/vader/trees-v2.webp').convert('RGBA')).astype(int)
c=im[0:512,512:1024];rgb=c[...,:3];a=c[...,3]
P=np.array([[0x0a,0x89,0x68],[0x31,0xae,0x4c],[0x6c,0xcb,0x35],[0xcc,0xf3,0x46],[0x9d,0xe1,0x38],[0xd5,0xef,0x1b]])
nav=(rgb[...,2]>rgb[...,0]+10)&(rgb[...,2]>rgb[...,1]+10)&(rgb.max(axis=2)<170)
crown=(a>110)&(np.arange(512)[:,None]<470)
d=((rgb[...,None,:]-P[None,None])**2).sum(axis=3);lab=d.argmin(axis=2)+1
lab[~crown]=0;lab[nav&crown]=0
# grenpixlar inne i kronan får närmaste kronfärg (grenarna ritas ovanpå ur ruta 4)
fill=(nav&crown)
src=(lab==0).astype(np.uint8)
dist,idx=cv2.distanceTransformWithLabels(src,cv2.DIST_L2,5,labelType=cv2.DIST_LABEL_PIXEL)
ys,xs=np.nonzero(src==0);lut=np.zeros(idx.max()+1,int);lut[idx[ys,xs]]=lab[ys,xs]
lab2=lab.copy();fy,fx=np.nonzero(fill);lab2[fy,fx]=lut[idx[fy,fx]]
lab2[(np.arange(512)[:,None]>=380)&nav]=0   # stammen under kronan hör inte till lövverket
lab2=cv2.medianBlur(lab2.astype(np.uint8),3)
out=[]
for t in range(1,7):
    # tonerna 1–4 staplas: varje lager täcker också ytan under ljusare toner, så att inget hål syns när en ljusare yta byter färg eller försvinner
    m=(lab2>=1).astype(np.uint8) if t==1 else ((lab2>=t)&(lab2<=4)).astype(np.uint8) if t<=4 else (lab2==t).astype(np.uint8)
    m=cv2.dilate(m,np.ones((2,2),np.uint8))
    n,cc,st,cen=cv2.connectedComponentsWithStats(m)
    for i in range(1,n):
        if st[i,4]<25:continue
        # yttre kant och hål i samma bana (fill-rule evenodd), annars täcker ett lager de mörkare ytorna inuti
        cs,hi=cv2.findContours((cc==i).astype(np.uint8),cv2.RETR_CCOMP,cv2.CHAIN_APPROX_NONE)
        dpath=''
        for cn,h in zip(cs,hi[0]):
            if h[3]>=0 and cv2.contourArea(cn)<6:continue
            ap=cv2.approxPolyDP(cn,0.8,True).reshape(-1,2)
            if len(ap)<3:continue
            dpath+='M'+'L'.join('%d %d'%(x+0.5,y-33) for x,y in ap)+'Z'   # ruta 1 → ruta 4 (stambasen 266.5,499 → 267,466)
        if dpath:out.append([t-1,round(cen[i][0]+.5),round(cen[i][1]-33),int(st[i,4]),dpath])
print(json.dumps(out,separators=(',',':')))
print(len(out),sum(len(o[4]) for o in out),file=sys.stderr)
