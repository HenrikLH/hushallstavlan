"""Gör ett eget ark med de sovande hundarna, en hel bädd per ruta (bilder/vader/sleep-v1.webp).
I hundarket ligger bäddarna så brett att de går utanför sina rutor och nuddar varandra, så den
vanliga sömmen klipper kanten och visar en bit av grannens bädd. Här delas paret efter färg
(röd bädd/röda kläder = hund 0, blå = hund 1, annars sömmen) och varje hund läggs i en egen ruta.
Kör: python3 verktyg/sovbaddar.py bilder/vader/mascots-v4.webp bilder/vader/sleep-v1.webp
Rutorna: 8 rader (bildruta 1,3,…,15) × 2 kolumner (hund 0/1), W×H px, bäddens botten på rad H-4, mitten på W/2."""
import sys,json,subprocess,numpy as np,cv2
from PIL import Image
src,dst=sys.argv[1],sys.argv[2];W,H=220,210
im=np.array(Image.open(src).convert('RGBA')).astype(np.int32);Y=[88,374,675,950]
js=open('app.js',encoding='utf8').read();i=js.index('GEO_DOG_SEAMS=');j=js.index(';',i)
SEAMS=json.loads(js[i+14:j].replace(',]',']'))
out=np.zeros((8*H,2*W,4),np.uint8)
for k,f in enumerate(range(1,16,2)):
    r,c=f//4,f%4;cx=c*313.5;x0=int(cx)-40;x1=min(1254,int(cx)+345);y0=Y[r];y1=y0+258
    sub=im[y0:y1,x0:x1];R,G,B,A=[sub[...,q] for q in range(4)];hw,ww=A.shape
    seam=np.interp(np.arange(hw),[p[1] for p in SEAMS[f]],[p[0] for p in SEAMS[f]])+cx-x0
    side=(np.arange(ww)[None,:]>seam[:,None]).astype(int)
    red=(R>G+60)&(R>B+25)&(G<90);blue=(B>R+40)&(B>G+15)
    # vattendelare från bäddarna: röd bädd/kläder = hund 0, blå = hund 1, genomskinligt = bakgrund
    mk=np.zeros((hw,ww),np.int32);far=np.abs(np.arange(ww)[None,:]-seam[:,None])>25;mk[far&(A>200)]=1+side[far&(A>200)];mk[red&(A>200)]=1;mk[blue&(A>200)]=2;mk[A<5]=3
    ws=cv2.watershed(np.ascontiguousarray(sub[...,:3].astype(np.uint8)),mk)
    lab=np.where(ws==1,0,np.where(ws==2,1,side))
    for d in (0,1):
        m=((lab==d)&(A>8)).astype(np.uint8)
        n,cc,st,_=cv2.connectedComponentsWithStats(m,connectivity=8)
        big=1+np.argmax(st[1:,4]);keep=np.isin(cc,[q for q in range(1,n) if q==big or (st[q,4]>40 and abs(np.median(np.where(cc==q)[1])-np.median(np.where(cc==big)[1]))<90)])
        a=np.where(keep,A,0);img=sub.copy()
        # bäddarna skymmer varandras ändar där de möts: röda bäddens högra och blå bäddens vänstra ände rundas
        # efter en ellips anpassad till bäddens underkant (svept uppåt, bädden är en låg cylinder)
        bc=red if d==0 else blue;sg=1 if d==0 else -1
        bm=(keep&bc).astype(np.uint8);cs,_=cv2.findContours(bm,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE);P=max(cs,key=len)[:,0]
        xe=P[:,0].max() if sg>0 else P[:,0].min();yb=np.median(P[:,1]);Q=P[(P[:,1]>yb)&(sg*(xe-P[:,0])>22)]
        (ex,ey),(ea,eb),ang=cv2.fitEllipse(Q.astype(np.float32))
        t=np.deg2rad(ang);Yg,Xg=np.mgrid[0:hw,0:ww];u=(Xg-ex)*np.cos(t)+(Yg-ey)*np.sin(t);v=-(Xg-ex)*np.sin(t)+(Yg-ey)*np.cos(t)
        rr=np.sqrt((u/(ea/2))**2+(v/(eb/2))**2);inside=np.clip((1-rr)*ea/2+.5,0,1)
        sw=inside.copy()
        for s_ in range(1,26):sw[:-s_]=np.maximum(sw[:-s_],inside[s_:])
        inside=sw
        for yv in range(hw):
            row=np.where(keep[yv]&(a[yv]>0))[0]
            if not len(row):continue
            bed=np.where(keep[yv]&bc[yv]&(A[yv]>200))[0]
            if not len(bed):continue
            xb=bed.max() if sg>0 else bed.min()
            if abs(xb-(row.max() if sg>0 else row.min()))>6:continue  # något annat än bädden (öra, mössa) är ytterst
            for xv in range(xb+sg,xb+sg*30,sg):  # ta bort grannens kantpixlar och rita bädden vidare till ellipsen
                if not 0<=xv<ww:break
                al=max(inside[yv,xv],1.0 if sg*(xb-xv)>=0 else 0);a[yv,xv]=int(255*al) if al>0 else 0
                if al>0:img[yv,xv]=sub[yv,xb-2*sg]
        ys,xs=np.where(a>20);bx=(xs.min()+xs.max())/2;by=ys.max()
        ox=int(round(W/2-bx));oy=H-4-by
        cell=np.zeros((H,W,4),np.int32);
        yy,xx=np.where(a>0);ty,tx=yy+oy,xx+ox;ok=(ty>=0)&(ty<H)&(tx>=0)&(tx<W)
        assert ok.all(),('utanför ruta',f,d)
        cell[ty,tx,:3]=img[yy,xx,:3];cell[ty,tx,3]=a[yy,xx]
        out[k*H:(k+1)*H,d*W:(d+1)*W]=cell
Image.fromarray(out).save(dst,'WEBP',quality=90,method=6);print('klart',dst,out.shape)
