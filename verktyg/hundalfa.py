"""Gör hundarnas ark helt täckande (alfa ≥ 200 → 255) så att öron- och huvudlagren kan överlappa utan synliga skarvar.
Kör: python3 verktyg/hundalfa.py bilder/vader/mascots-v4.webp bilder/vader/mascots-v5.webp"""
import sys
from PIL import Image
im=Image.open(sys.argv[1]).convert('RGBA');r,g,b,a=im.split()
a=a.point(lambda v:255 if v>=200 else v)
Image.merge('RGBA',(r,g,b,a)).save(sys.argv[2],'WEBP',quality=92,alpha_quality=100,method=6)
