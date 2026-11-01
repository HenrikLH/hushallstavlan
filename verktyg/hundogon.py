"""Gör hundarnas runda ögon ovala i hundarket (bilder/vader/mascots-*.webp).
Kör: python3 verktyg/hundogon.py IN.webp UT.webp SX SY [LUTNING_GRADER]
SX/SY skalar ögat på bredden/höjden; lutningen vrider ytterkanten uppåt (spegelvänt för vänster öga).
Ögonen hittas via glansprickarna i de vakna bildrutorna; det gamla ögat fylls med pälsfärg (inpaint) innan det nya läggs på."""
import sys,numpy as np,cv2
from PIL import Image
src,dst,SX,SY=sys.argv[1],sys.argv[2],float(sys.argv[3]),float(sys.argv[4]);TILT=float(sys.argv[5]) if len(sys.argv)>5 else 0
im=np.array(Image.open(src).convert('RGBA'));Y=[88,374,675,950]
def highlights(f,d):
    r,c=f//4,f%4;x0=int(c*313.5+d*156.75);y0=Y[r];sub=im[y0:y0+140,x0:x0+157]
    w=((sub[...,:3].min(axis=2)>225)&(sub[...,3]>200)).astype(np.uint8)
    n,lab,st,cen=cv2.connectedComponentsWithStats(w)
    H=[(cen[i][0]+x0,cen[i][1]+y0) for i in range(1,n) if 2<=st[i,4]<=20]
    return sorted(H)[:2] if len(H)>=2 else []
out=im.copy()
for f in [0,4,6,8,10,12,14]:
    for d in [0,1]:
        H=highlights(f,d)
        for k,(hx,hy) in enumerate(H):
            cx,cy=int(round(hx-4)),int(round(hy+4));R=17
            box=im[cy-R:cy+R+1,cx-R:cx+R+1].astype(int);rgb=box[...,:3]
            yy,xx=np.mgrid[-R:R+1,-R:R+1];rr=np.hypot(xx,yy)
            fur=np.median(rgb[(rr>14)&(rr<=17)],axis=0)
            dist=np.abs(rgb-fur).sum(axis=2)
            m=((dist>90)&(rr<14)).astype(np.uint8)
            n,lab,st,cen=cv2.connectedComponentsWithStats(m)
            if n<2: continue
            i=max(range(1,n),key=lambda i:st[i,4] if np.hypot(cen[i][0]-R,cen[i][1]-R)<8 else 0)
            eye=(lab==i).astype(np.uint8)
            eye=cv2.morphologyEx(eye,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8))
            cnts,_=cv2.findContours(eye,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE);eye=np.zeros_like(eye);cv2.drawContours(eye,cnts,-1,1,-1)
            ys,xs=np.nonzero(eye);ex,ey=xs.mean(),ys.mean()
            # mjuk mask för ögat (för kantutjämning när det läggs på)
            soft=cv2.GaussianBlur(cv2.dilate(eye,np.ones((3,3),np.uint8)).astype(np.float32),(3,3),0.8)
            # 1) fyll gamla ögat med päls
            pm=cv2.dilate(eye,np.ones((5,5),np.uint8))*255
            patch=np.ascontiguousarray(out[cy-R:cy+R+1,cx-R:cx+R+1,:3])
            filled=cv2.inpaint(patch,pm,5,cv2.INPAINT_TELEA)
            # 2) nytt öga: skala/vrid runt ögats mitt
            ang=TILT if k==1 else -TILT  # ytterkanten uppåt: höger öga (k=1) moturs, vänster medurs
            M=cv2.getRotationMatrix2D((ex,ey),ang,1.0)
            A=np.array([[SX,0,ex-SX*ex],[0,SY,ey-SY*ey]],np.float32)
            R3=np.vstack([M,[0,0,1]]);A3=np.vstack([A,[0,0,1]]);T=(R3@A3)[:2].astype(np.float32)
            src_rgb=im[cy-R:cy+R+1,cx-R:cx+R+1,:3]
            new=cv2.warpAffine(src_rgb,T,(2*R+1,2*R+1),flags=cv2.INTER_CUBIC,borderMode=cv2.BORDER_REPLICATE)
            nm=cv2.warpAffine(soft,T,(2*R+1,2*R+1),flags=cv2.INTER_LINEAR)[...,None]
            res=filled*(1-nm)+new*nm
            out[cy-R:cy+R+1,cx-R:cx+R+1,:3]=np.clip(res,0,255).astype(np.uint8)
Image.fromarray(out).save(dst,'WEBP',quality=90,alpha_quality=100,method=6)
print('klart',dst)
