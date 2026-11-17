#!/bin/bash
cd /c/Users/frand/Documents/Codex/linea-roja/video2_felix
C="-c user.name=LineaRoja -c user.email=noreply@users.noreply.github.com"
# lotes de ~80 MB de clips
ls video/public/clips | split -l 28 - /tmp/lote_
for L in /tmp/lote_*; do
  while read f; do git add "video/public/clips/$f"; done < $L
  git $C commit -q -m "clips lote $(basename $L)" && for i in 1 2 3; do git push -q origin main && break || sleep 20; done
done
git add -A
git $C commit -q -m "Montaje v2 final: mezcla foto/clip, clips HD

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
for i in 1 2 3; do git push -q origin main && break || sleep 20; done
echo FIN-PUSH
