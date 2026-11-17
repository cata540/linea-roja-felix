// Descarga fotos de dominio público / CC BY-SA desde Wikimedia Commons, por capítulo.
// Filtra licencias, excluye IWM/NC y registra créditos en data/images.json
import fs from 'node:fs';
import path from 'node:path';

const UA = 'LineaRojaResearch/0.1 (documentary project; non-commercial research script)';
const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public', 'img');
const DATA = path.join(ROOT, 'data');
fs.mkdirSync(DATA, {recursive: true});

// [capítulo, etiqueta, consulta, nº máx. de imágenes]
const Q = [
  [0, 'elba', 'Torgau Elbe link up April 1945 American Soviet soldiers', 2],
  [0, 'berlin', 'Berlin ruins May 1945 Soviet soldiers', 2],
  [0, 'redarmy', 'Red Army soldiers marching 1945', 2],
  [0, 'churchill', 'Winston Churchill 1945 Army Signal Corps', 1],
  [0, 'tanks', 'Soviet tanks IS-2 Berlin 1945', 1],
  [0, 'us', 'American soldiers Germany May 1945 National Archives', 2],

  [1, 'churchill41', 'Winston Churchill 1941 Library of Congress', 1],
  [1, 'barbarossa', 'Operation Barbarossa 1941 German invasion Soviet Union', 2],
  [1, 'stalin', 'Joseph Stalin 1943 Tehran Conference', 2],
  [1, 'stalingrad', 'Battle of Stalingrad 1942 ruins Soviet soldiers', 2],
  [1, 'dday', 'D-Day Normandy June 1944 landing National Archives', 2],
  [1, 'moscow44', 'Churchill Stalin Moscow October 1944', 1],
  [1, 'redarmy44', 'Red Army advance 1944 Soviet infantry', 2],

  [2, 'yalta', 'Yalta Conference February 1945 Churchill Roosevelt Stalin', 2],
  [2, 'livadia', 'Livadia Palace Yalta 1945', 1],
  [2, 'roosevelt', 'Franklin Roosevelt 1945 Yalta portrait', 2],
  [2, 'molotov', 'Molotov Stettinius Eden Yalta 1945', 2],
  [2, 'bigthree', 'Big Three Yalta conference table delegations', 2],
  [2, 'warsaw45', 'Warsaw ruins January 1945', 2],

  [3, 'warsawrising', 'Warsaw Uprising 1944 Home Army', 2],
  [3, 'polish', 'Polish government in exile London 1945', 1],
  [3, 'funeral', 'Roosevelt funeral April 1945 Washington', 2],
  [3, 'truman', 'Harry Truman sworn in April 1945', 2],
  [3, 'stimson', 'Henry Stimson Secretary of War 1945', 1],
  [3, 'lublin', 'Polish Committee of National Liberation Lublin 1944', 1],
  [3, 'pacific', 'Pacific War 1945 Iwo Jima Marines', 1],

  [4, 'torgau', 'Torgau Elbe 1945 meeting Soviet American troops handshake', 2],
  [4, 'eisenhower', 'Dwight Eisenhower 1945 Germany', 2],
  [4, 'patton', 'George Patton Third Army 1945', 1],
  [4, 'reichstag', 'Reichstag Berlin May 1945 Soviet soldiers', 2],
  [4, 'prague', 'Prague uprising May 1945', 2],
  [4, 'berlinfall', 'Fall of Berlin April 1945', 2],
  [4, 'hitlerbunker', 'Berlin Brandenburg Gate 1945 ruins', 1],

  [5, 'veday', 'VE Day London May 1945 crowds', 2],
  [5, 'churchillve', 'Churchill VE Day 8 May 1945 balcony', 2],
  [5, 'reims', 'German surrender Reims 7 May 1945', 2],
  [5, 'pow', 'German prisoners of war May 1945', 2],
  [5, 'weapons', 'surrendered German weapons 1945', 1],
  [5, 'burgess', 'Whitehall London 1945 government', 1],

  [6, 'maps', 'military planners map table 1945 officers', 1],
  [6, 'sherman', 'M4 Sherman tanks Germany 1945', 2],
  [6, 'b17', 'B-17 bombers Germany 1945', 2],
  [6, 'dresden', 'Dresden 1945 ruins', 2],
  [6, 'britsoldiers', 'British soldiers Germany 1945 infantry', 2],
  [6, 'wehrmacht', 'German soldiers surrender 1945 column', 2],

  [7, 't34', 'T-34 tanks 1945 Soviet', 2],
  [7, 'artillery', 'Soviet artillery 1945 Red Army guns', 2],
  [7, 'parade', 'Red Army soldiers Berlin 1945 columns', 2],
  [7, 'brooke', 'Alan Brooke 1945 field marshal', 1],
  [7, 'sovinf', 'Soviet infantry attack 1945', 2],
  [7, 'ilyushin', 'Il-2 Sturmovik Soviet aircraft 1945', 1],

  [8, 'troopship', 'American troops returning home ship 1945', 2],
  [8, 'demob', 'demobilization soldiers 1945 returning home', 2],
  [8, 'train', 'soldiers train station homecoming 1945', 1],
  [8, 'redeploy', 'US Army redeployment Europe to Pacific 1945', 2],
  [8, 'families', 'soldier family reunion 1945', 1],
  [8, 'sovfriend', 'American Soviet friendship 1945', 1],

  [9, 'okinawa', 'Battle of Okinawa 1945 Marines', 2],
  [9, 'kamikaze', 'kamikaze attack USS 1945', 2],
  [9, 'trumanjcs', 'Truman White House June 1945 meeting', 1],
  [9, 'kyushu', 'Kyushu Japan 1945 aerial photograph', 1],
  [9, 'manchuria', 'Soviet troops Manchuria August 1945', 2],
  [9, 'transsib', 'Trans-Siberian Railway troops 1945', 1],
  [9, 'trinity', 'Trinity test July 1945 explosion', 1],

  [10, 'berlinus', 'US troops Berlin July 1945 arrival', 2],
  [10, 'berlinbr', 'British troops Berlin July 1945', 2],
  [10, 'zonesov', 'Soviet soldiers Berlin July 1945', 1],
  [10, 'control', 'Allied Control Council Berlin 1945', 2],
  [10, 'hopkins', 'Harry Hopkins Moscow Stalin May 1945', 1],
  [10, 'refugees', 'Germany refugees 1945 road', 2],

  [11, 'potsdam', 'Potsdam Conference July 1945 Cecilienhof', 2],
  [11, 'bigthree', 'Truman Churchill Stalin Potsdam July 1945', 2],
  [11, 'attlee', 'Clement Attlee 1945 Potsdam', 2],
  [11, 'election', 'British general election 1945 Labour victory', 2],
  [11, 'churchilldep', 'Churchill 1945 leaving Potsdam', 1],
  [11, 'zhukov', 'Georgy Zhukov 1945', 1],

  [12, 'fulton', 'Churchill Fulton Missouri March 1946 Iron Curtain speech', 2],
  [12, 'airlift', 'Berlin Airlift 1948 C-47', 2],
  [12, 'nato', 'North Atlantic Treaty signing April 1949', 2],
  [12, 'rds1', 'Soviet atomic bomb RDS-1 1949 test', 1],
  [12, 'korea', 'Korean War 1950 troops', 1],
  [12, 'truman47', 'Truman Doctrine 1947 Congress', 1],
  [12, 'purpleheart', 'Purple Heart medal', 1],
  [12, 'invasion', 'Operation Downfall invasion Japan plan landing craft', 2],

  // Extras genéricos del capítulo (tag "x*"): rellenan la rotación de planos.
  [0, 'x1', 'Soviet soldiers 1945', 3], [0, 'x2', 'Berlin 1945', 3],
  [1, 'x1', 'Winston Churchill 1940', 2], [1, 'x2', 'Red Army 1943', 2], [1, 'x3', 'Eastern Front 1942', 2],
  [2, 'x1', 'Yalta 1945', 2],
  [3, 'x1', 'Roosevelt 1945', 2], [3, 'x2', 'Warsaw 1944', 2],
  [4, 'x1', 'Reichstag 1945', 2], [4, 'x2', 'Soviet troops Berlin', 2], [4, 'x3', 'Prague 1945', 2],
  [5, 'x1', 'Victory in Europe Day', 3], [5, 'x2', 'Churchill 1945', 3], [5, 'x3', 'Whitehall London 1945', 2], [5, 'x4', 'German prisoners of war', 2],
  [6, 'x1', 'Allied tanks 1945', 2], [6, 'x2', 'British Army 1945', 2],
  [7, 'x1', 'Red Army 1945', 3], [7, 'x2', 'Soviet tank 1945', 3], [7, 'x3', 'Katyusha', 2],
  [8, 'x1', 'returning veterans 1945', 3], [8, 'x2', 'soldiers homecoming', 2], [8, 'x3', 'troopship returning soldiers', 2], [8, 'x4', 'troops 1945 Le Havre', 2],
  [9, 'x1', 'Iwo Jima 1945', 2], [9, 'x2', 'Soviet invasion of Manchuria', 2], [9, 'x3', 'Pacific War 1945', 2],
  [10, 'x1', 'Berlin 1945', 2], [10, 'x2', 'Potsdam 1945', 2], [10, 'x3', 'Soviet soldiers 1945', 2],
  [11, 'x1', 'Potsdam Conference', 3], [11, 'x2', 'Churchill 1945', 2],
  [12, 'x1', 'Purple Heart', 2], [12, 'x2', 'Berlin Blockade', 2], [12, 'x3', 'Iron Curtain', 2],

  [12, 'y5', 'Japanese surrender USS Missouri 1945', 2], [12, 'y6', 'Hiroshima 1945', 2], [12, 'y7', 'Nagasaki 1945', 1], [12, 'y8', 'atomic bomb 1945', 2], [12, 'y9', 'Marines landing 1945', 2], [12, 'y10', 'Kyushu 1945', 1], [12, 'y11', 'Tokyo 1945', 2], [12, 'y12', 'Truman 1945', 2],
  // Refuerzos (tag "y*")
  [5, 'y1', 'Trafalgar Square VE Day', 2], [5, 'y2', 'Piccadilly Circus 1945', 2], [5, 'y3', 'Churchill waving crowd 1945', 3], [5, 'y4', 'Winston Churchill V sign', 2],
  [8, 'y1', 'Operation Magic Carpet', 3], [8, 'y2', 'Queen Mary troops 1945', 2], [8, 'y3', 'returning troops New York 1945', 3], [8, 'y4', 'soldiers discharge 1945', 2],
  [8, 'y5', 'GI boarding train 1945', 2], [8, 'y6', 'USS Wakefield returning troops', 2], [8, 'y7', 'American soldiers Germany 1945', 2],
  [0, 'y1', 'American soldiers 1945 Germany', 2], [0, 'y2', 'Red Army 1945 Berlin', 2],
  [7, 'y1', 'Soviet soldiers 1945', 2], [7, 'y2', 'Red Army tanks Berlin', 2], [7, 'y3', 'Soviet artillery', 2],
  [10, 'y1', 'American troops Berlin 1945', 2], [10, 'y2', 'Berlin July 1945', 2], [10, 'y3', 'Soviet troops Germany 1945', 2],
  [4, 'y1', 'American soldiers Elbe', 2], [4, 'y2', 'Soviet soldiers Elbe', 2],
  [3, 'y1', 'Harry S. Truman 1945', 2], [3, 'y2', 'Polish Home Army', 2],
  [2, 'y1', 'Yalta Conference', 3], [1, 'y1', 'Moscow 1941', 2], [1, 'y2', 'Soviet soldiers 1942', 2],
  [6, 'y1', 'American soldiers 1945', 2], [6, 'y2', 'German prisoners 1945', 2],
  [9, 'y1', 'Okinawa 1945', 2], [9, 'y2', 'Pacific War Marines', 2], [9, 'y3', 'USS carrier 1945', 2],
  [11, 'y1', 'Potsdam 1945', 2], [11, 'y2', 'Attlee 1945', 2],
  [12, 'y1', 'Berlin Airlift', 3], [12, 'y2', 'NATO 1949', 2], [12, 'y3', 'Korean War', 2],
];

// Segunda pasada: consultas cortas para las etiquetas que quedaron vacías (QSET=2).
const Q2 = {
  '0 elba': 'Torgau 1945', '1 stalingrad': 'Stalingrad 1942', '1 redarmy44': 'Red Army 1944', '2 roosevelt': 'Roosevelt Yalta',
  '2 bigthree': 'Yalta Conference', '4 torgau': 'Torgau Elbe', '4 hitlerbunker': 'Brandenburg Gate 1945', '5 veday': 'VE Day 1945',
  '5 churchillve': 'Churchill VE Day', '5 pow': 'German prisoners 1945', '5 burgess': 'Whitehall 1945', '6 maps': 'Eisenhower map 1945',
  '6 wehrmacht': 'German surrender 1945', '7 sovinf': 'Soviet infantry', '7 ilyushin': 'Il-2 Sturmovik', '8 demob': 'demobilization 1945',
  '8 train': 'troop train 1945', '8 redeploy': 'troopship 1945', '8 families': 'homecoming 1945', '8 sovfriend': 'Soviet American friendship',
  '9 kyushu': 'Kyushu 1945', '9 manchuria': 'Manchuria 1945', '9 transsib': 'Trans-Siberian Railway', '10 berlinus': 'Berlin July 1945',
  '10 control': 'Allied Control Council', '10 hopkins': 'Harry Hopkins', '10 refugees': 'German refugees 1945', '11 election': '1945 general election',
  '12 truman47': 'Truman Doctrine', '12 invasion': 'Operation Downfall',
};
const MINW = process.env.QSET === '2' ? 800 : 1000;
const LIC_OK =/(public domain|^pd\b|pd-|cc0|cc by-sa|cc by \d)/i;
const LIC_BAD = /(nc|nd|fair use|copyrighted|all rights)/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (s) => (s || '').toString().replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function api(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({format: 'json', ...params});
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url, {headers: {'User-Agent': UA}});
    if (r.ok) return r.json();
    await sleep(1500 * (i + 1));
  }
  throw new Error('API fail ' + url);
}

const manifestPath = path.join(DATA, 'images.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : [];
const seen = new Set(manifest.map((m) => m.title));

for (const [chap, tag, query0, max] of Q) {
  if (process.env.ONLY && !new RegExp(process.env.ONLY).test(`${chap} ${tag}`)) continue;
  if (manifest.filter((m) => m.chapter === chap && m.tag === tag).length >= max) continue;
  const query = process.env.QSET === '2' ? Q2[`${chap} ${tag}`] : query0;
  if (!query) continue;
  let j;
  try {
    j = await api({
      action: 'query', generator: 'search', gsrsearch: `${query} filetype:bitmap`, gsrnamespace: '6', gsrlimit: '20',
      prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata',
      iiextmetadatafilter: 'LicenseShortName|Artist|Credit|ImageDescription|DateTimeOriginal|Restrictions|UsageTerms',
    });
  } catch (e) {
    console.log('FAIL', chap, tag, e.message);
    continue;
  }
  const pages = Object.values(j.query?.pages || {}).sort((a, b) => a.index - b.index);
  let got = 0;
  for (const p of pages) {
    if (got >= max) break;
    const i = p.imageinfo?.[0];
    if (!i || seen.has(p.title)) continue;
    if (!/image\/jpeg|image\/png/.test(i.mime)) continue;
    if (i.width < MINW || i.height < 560) continue;
    const ar = i.width / i.height;
    if (ar < 0.9 || ar > 2.4) continue;
    const m = i.extmetadata || {};
    const lic = strip(m.LicenseShortName?.value);
    const credit = strip(m.Credit?.value);
    const artist = strip(m.Artist?.value);
    const desc = strip(m.ImageDescription?.value);
    const blob = `${p.title} ${credit} ${artist} ${desc}`;
    if (!LIC_OK.test(lic) || LIC_BAD.test(lic)) continue;
    if (/imperial war museum|\biwm\b|\bBU ?\d{3,}\b|\b[A-Z]{1,2} ?\d{4,5}\b.*imperial/i.test(blob)) continue;
    if (strip(m.Restrictions?.value)) continue;
    const slug = p.title.replace(/^File:/, '').replace(/\.[^.]+$/, '').replace(/[^\w]+/g, '_').slice(0, 60);
    const rel = `img/ch${String(chap).padStart(2, '0')}/${tag}_${slug}.jpg`;
    const dest = path.join(ROOT, 'public', rel);
    fs.mkdirSync(path.dirname(dest), {recursive: true});
    const fileName = p.title.replace(/^File:/, '').replace(/ /g, '_');
    const w = Math.min(1920, i.width);
    const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=${w}`;
    let ok = false;
    for (let t = 0; t < 3 && !ok; t++) {
      try {
        const r = await fetch(url, {headers: {'User-Agent': UA}, redirect: 'follow'});
        const ct = r.headers.get('content-type') || '';
        if (r.ok && ct.startsWith('image/')) {
          fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
          ok = true;
        } else await sleep(2000 * (t + 1));
      } catch {
        await sleep(2000);
      }
    }
    if (!ok) continue;
    seen.add(p.title);
    got++;
    manifest.push({
      chapter: chap, tag, file: rel, title: p.title, license: lic, artist: artist.slice(0, 120), credit: credit.slice(0, 160),
      description: desc.slice(0, 240), date: strip(m.DateTimeOriginal?.value).slice(0, 40),
      page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, '_'))}`, width: i.width, height: i.height,
    });
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
    await sleep(700);
  }
  console.log(`ch${chap} ${tag}: ${got}/${max}`);
  await sleep(400);
}
console.log('TOTAL', manifest.length);
