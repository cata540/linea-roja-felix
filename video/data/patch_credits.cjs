const fs=require("fs");let s=fs.readFileSync("tools/build_credits.mjs","utf8");
const a="L.push('Documento: recreación gráfica propia; original en The National Archives (UK), CAB 120/691.');";
const b="L.push('Vídeo de archivo: NARA / U.S. Army Signal Corps y películas del gobierno de EE. UU. (dominio público), vía Wikimedia Commons.');";
const w="fs.writeFileSync(path.resolve(ROOT, '..', 'Creditos_Felix.txt'), text);";
for(const x of [a,b,w]) if(!s.includes(x)) throw new Error("falta "+x.slice(0,40));
s=s.replace(a,"L.push('Documentos y telegrama: recreación gráfica propia a partir de la Directiva nº 18 (PS-444, Núremberg) y del acta de Vigón (Avalon Project).');");
s=s.replace(b,"L.push('Vídeo de archivo: películas del gobierno de EE. UU. (Why We Fight; Naval Photographic Center / NARA; dominio público) y Prelinger Archives (Spain in Revolt; sin restricciones conocidas), vía Archive.org / Wikimedia Commons.');");
s=s.replace(w,"fs.writeFileSync(path.resolve(ROOT, '..', 'CREDITOS.txt'), text);\n"+
"const ts = (fr) => { const ms = Math.round(fr / 30 * 1000); const p = (n, k = 2) => String(n).padStart(k, '0'); return p(Math.floor(ms / 3600000)) + ':' + p(Math.floor(ms / 60000) % 60) + ':' + p(Math.floor(ms / 1000) % 60) + ',' + p(ms % 1000, 3); };\n"+
"fs.writeFileSync(path.resolve(ROOT, '..', 'Operacion_Felix_1940.srt'), tl.subs.map((c, i) => (i + 1) + '\n' + ts(c.from) + ' --> ' + ts(c.from + c.dur) + '\n' + c.text + '\n').join('\n'));");
fs.writeFileSync("tools/build_credits.mjs",s);
