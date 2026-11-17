const UA='LineaRojaResearch/0.1 (documentary project; non-commercial research script)';
const qs=process.argv.slice(2);
const strip=s=>(s||'').toString().replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
for(const q of qs){
  const u='https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({format:'json',action:'query',generator:'search',gsrsearch:q+' filetype:video',gsrnamespace:'6',gsrlimit:'12',prop:'imageinfo',iiprop:'url|size|mime|extmetadata',iiextmetadatafilter:'LicenseShortName|Artist|Credit|DateTimeOriginal'});
  const r=await fetch(u,{headers:{'User-Agent':UA}});const t=await r.text();let j;try{j=JSON.parse(t)}catch{console.log('limitado:',t.slice(0,60));await new Promise(r=>setTimeout(r,8000));continue}
  const pages=Object.values(j.query?.pages||{}).sort((a,b)=>a.index-b.index);
  console.log('== '+q);
  for(const p of pages){const i=p.imageinfo?.[0];if(!i)continue;const m=i.extmetadata||{};
    console.log(`  ${p.title.replace('File:','').slice(0,70)} | ${Math.round(i.duration||0)}s | ${i.width}x${i.height} | ${Math.round(i.size/1e6)}MB | ${strip(m.LicenseShortName?.value).slice(0,18)} | ${strip(m.Credit?.value).slice(0,40)}`)}
  await new Promise(r=>setTimeout(r,3000));
}
