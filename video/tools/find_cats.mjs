const UA='LineaRojaResearch/0.1 (documentary project; non-commercial research script)';
const qs=process.argv.slice(2);
for(const q of qs){
  const u='https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({format:'json',action:'query',generator:'search',gsrsearch:q,gsrnamespace:'14',gsrlimit:'6',prop:'categoryinfo'});
  const j=await (await fetch(u,{headers:{'User-Agent':UA}})).json();
  const pages=Object.values(j.query?.pages||{}).sort((a,b)=>a.index-b.index);
  console.log('== '+q+'\n'+pages.map(p=>`   ${p.title.replace('Category:','')} (${p.categoryinfo?.files??0} files)`).join('\n'));
  await new Promise(r=>setTimeout(r,3500));
}
