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
        for yv in (range(max(0,np.where((keep&bc&(A>200)).any(axis=1))[0].max()-62),hw) if d==0 else []):  # bara bäddens rader, inte mössan
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
        bedm=keep&bc&(A>200);BY,BX=np.where(bedm);Bb=BY.max()
        if d==0:  # röda bäddens vänstra ände är hel: spara dess rundning (indrag per rad från botten) och bredd
            prof={};lx=None
            for yv in range(Bb+3,0,-1):
                xs_=np.where(a[yv]>128)[0]
                if not len(xs_):continue
                x0_=xs_.min();c_=img[yv,x0_+1,:3]
                if not((c_[0]>c_[1]+40) or c_.max()<90):break  # ovanför bädden (päls, filt)
                prof[Bb-yv]=x0_
            lx=min(prof.values());prof={r:x-lx for r,x in prof.items()};Wr=np.where(a[Bb-6]>128)[0].max()-lx
        else:  # blå bädden är avhuggen i båda ändarna redan i hundarket: förläng den till den röda bäddens bredd och rundning
            cx=(BX.min()+BX.max())/2
            rd=(sub[...,0]>sub[...,2]+20)&(sub[...,0]>sub[...,1]+20)&(np.arange(ww)[None,:]<BX.min()+8);a[rd]=0  # röda kantprickar från grannen
            for r,ins in prof.items():
                yv=Bb-r
                if not 0<=yv<hw:continue
                bed=np.where(bedm[yv])[0]
                if not len(bed):continue
                for s_,xb in((-1,bed.min()),(1,bed.max())):
                    xo=int(round(cx+s_*(Wr/2-ins)))  # nya ytterkanten
                    if s_*(xo-xb)<=0:continue
                    out_=np.where(keep[yv]&(a[yv]>120))[0];xr_=out_.min() if s_<0 else out_.max()
                    if abs(xr_-xb)>4:continue  # öra eller mössa ytterst: rör inte
                    colr=sub[yv,xb-3*s_,:3]
                    for xv in range(xb-s_,xo+s_,s_):
                        if 0<=xv<ww:img[yv,xv,:3]=colr*(.8 if xv==xo else 1);a[yv,xv]=200 if xv==xo else 255
                    if 0<=xo+s_<ww:a[yv,xo+s_]=0
        # bäddens sidor: raka väggar blir mjuka bågar (Henrik: runda kanterna). Indraget växer i kvadrat från
        # väggens mitt mot dess över- och underkant; bara rader där bädden ligger ytterst rörs.
        bedc=lambda c:(c[2]>c[0]+40) if d else ((c[0]>c[1]+60 and c[1]<90) or c.max()<90)
        for s_ in(-1,1):
            rows=[]
            for yv in range(Bb+3,Bb-(62 if s_>0 and d==0 and f in (9,13) else 72),-1):  # bara bäddens rader (mössan i bildruta 9 och 13 når ned till höger)
                xs_=np.where(a[yv]>128)[0]
                if not len(xs_):continue
                xe=xs_.min() if s_<0 else xs_.max()
                if not bedc(img[yv,xe-s_*2,:3].astype(int)):break
                rows.append(yv)
            if len(rows)<8:continue
            yt,yb_=min(rows),max(rows);ym=(yt+yb_)/2;hh=(yb_-yt)/2;IM=18 if d==0 else 9  # röda bädden rundas mer (Henrik)
            xe0=np.median([ (np.where(a[yv]>128)[0].min() if s_<0 else np.where(a[yv]>128)[0].max()) for yv in rows if abs(yv-ym)<hh*.3])
            for yv in rows:
                ins=IM*((yv-ym)/hh)**2;lim=xe0-s_*ins  # gränsen för denna rad
                xs_=np.where(a[yv]>0)[0];xv=xs_.min() if s_<0 else xs_.max()
                while 0<=xv<ww and s_*(xv-lim)>0:  # utifrån och in, bara så länge det är bädd (inte öron)
                    if a[yv,xv]>128 and not bedc(img[yv,xv,:3].astype(int)):break
                    a[yv,xv]=int(a[yv,xv]*np.clip(1-s_*(xv-lim),0,1));xv-=s_
        ys,xs=np.where(a>20);bx=(xs.min()+xs.max())/2;by=ys.max()
        ox=int(round(W/2-bx));oy=H-4-by
        cell=np.zeros((H,W,4),np.int32);
        yy,xx=np.where(a>0);ty,tx=yy+oy,xx+ox;ok=(ty>=0)&(ty<H)&(tx>=0)&(tx<W)
        assert ok.all(),('utanför ruta',f,d)
        cell[ty,tx,:3]=img[yy,xx,:3];cell[ty,tx,3]=a[yy,xx]
        out[k*H:(k+1)*H,d*W:(d+1)*W]=cell
Image.fromarray(out).save(dst,'WEBP',quality=90,method=6);print('klart',dst,out.shape)
