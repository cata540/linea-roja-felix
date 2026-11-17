const UA='LineaRojaResearch/0.1 (documentary project; non-commercial research script)';
const strip=s=>(s||'').toString().replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
for(const cat of process.argv.slice(2)){
  const u='https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({format:'json',action:'query',generator:'categorymembers',gcmtitle:'Category:'+cat,gcmtype:'file',gcmlimit:'60',prop:'imageinfo',iiprop:'url|size|mime|extmetadata',iiextmetadatafilter:'LicenseShortName|DateTimeOriginal|Artist|Credit'});
  const t=await (await fetch(u,{headers:{'User-Agent':UA}})).text();let j;try{j=JSON.parse(t)}catch{console.log('limitado');continue}
  const pages=Object.values(j.query?.pages||{});console.log('== '+cat+' ('+pages.length+')');
  for(const p of pages.slice(0,40)){const i=p.imageinfo?.[0];const m=i?.extmetadata||{};console.log(' ',p.title.replace('File:','').slice(0,62),'|',i?.width+'x'+i?.height,'|',strip(m.LicenseShortName?.value).slice(0,14),'|',strip(m.DateTimeOriginal?.value).slice(0,12))}
  await new Promise(r=>setTimeout(r,4000));
}
