// Descarga vídeos de archivo (dominio público) de Commons y guarda su licencia en data/videos_src.json
import fs from 'node:fs';
import path from 'node:path';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
const UA='LineaRojaResearch/0.1 (documentary project; non-commercial research script)';
const ROOT=path.resolve(import.meta.dirname,'..');
const strip=s=>(s||'').toString().replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// [consulta, regex de título, id]
const WANT=[
  ['Hitler Paris 1940 film',/^Why We Fight- Divide and Conquer/i,'wwf_divide'],
  ['Battle of Britain 1940 film',/^Why We Fight- The Battle of Britain/i,'wwf_britain'],
];
const out=path.join(ROOT,'data','videos_src.json');
const reg=fs.existsSync(out)?JSON.parse(fs.readFileSync(out,'utf8')):{};
for(const [q,re,id] of WANT){
  if(process.env.ONLY&&process.env.ONLY!==id) continue;
  if(reg[id]&&fs.existsSync(reg[id].file)) {console.log(id,'ya existe');continue;}
  const u='https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({format:'json',action:'query',generator:'search',gsrsearch:q+' filetype:video',gsrnamespace:'6',gsrlimit:'20',prop:'imageinfo',iiprop:'url|size|mime|extmetadata',iiextmetadatafilter:'LicenseShortName|Artist|Credit|DateTimeOriginal'});
  let j;for(let k=0;k<5;k++){const r=await fetch(u,{headers:{'User-Agent':UA}});const t=await r.text();try{j=JSON.parse(t);break}catch{await sleep(8000)}}
  const p=Object.values(j?.query?.pages||{}).find(p=>re.test(p.title.replace('File:','')));
  if(!p){console.log('NO ENCONTRADO',id);continue;}
  const i=p.imageinfo[0];const lic=strip(i.extmetadata?.LicenseShortName?.value);
  if(!/public domain|cc0/i.test(lic)){console.log('licencia no válida',id,lic);continue;}
  const ext=path.extname(p.title)||'.webm';const file=path.join(ROOT,'media','src',id+ext);
  console.log('descargando',id,Math.round(i.size/1e6)+'MB',lic);
  let r;for(let k=0;k<8;k++){r=await fetch(i.url,{headers:{'User-Agent':UA}});if(r.ok)break;console.log('HTTP',r.status,id,'reintento en 60 s');await sleep(60000);}
  if(!r.ok){console.log('FALLO',id);continue;}
  await pipeline(Readable.fromWeb(r.body),fs.createWriteStream(file));
  reg[id]={id,file,title:p.title,license:lic,credit:strip(i.extmetadata?.Credit?.value).slice(0,200),page:'https://commons.wikimedia.org/wiki/'+encodeURIComponent(p.title.replace(/ /g,'_')),duration:i.duration,width:i.width,height:i.height};
  fs.writeFileSync(out,JSON.stringify(reg,null,1));
  await sleep(2500);
}
console.log('FIN');
