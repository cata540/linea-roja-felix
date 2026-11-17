// Genera ilustraciones históricas con fal.ai (FLUX schnell). Tope duro de gasto: MAX_IMG imágenes (~0,003 $ c/u).
// La clave FAL_KEY se lee en tiempo de ejecución del .env de Ápex Fauna (autorizado por el usuario); NUNCA se imprime ni se copia al repo.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const ENV = 'C:/Users/frand/Documents/Codex/apex-fauna/video01_tejon_miel/.env';
const key = (fs.readFileSync(ENV, 'utf8').match(/^FAL_KEY=(.+)$/m) || [])[1]?.trim();
if (!key) throw new Error('FAL_KEY no encontrada');
const MAX_IMG = 28; // el usuario autoriza ampliar el tope (antes 10 / 0,05 $) para eliminar repeticiones
const COST_PER_IMG = 0.003; // schnell ≈ 0,003 $/megapíxel (se factura 1 MP mínimo)
const STYLE = 'cinematic sepia-toned vintage 1940 illustration, muted desaturated palette, dark vignette, soft film grain, dramatic lighting, painterly historical realism, no text, no letters';
const PROMPTS = [
  ['hendaye_tren', 'a wartime railway station platform on the French-Spanish border, an armored government train, two delegations of officials in long coats waiting, overcast autumn sky'],
  ['hambre_cola', 'a long queue of thin women and children with empty baskets in front of a closed bakery in a poor Spanish village, post civil war poverty'],
  ['gibraltar_roca', 'the Rock of Gibraltar seen across the bay of Algeciras under a stormy sky, warships in the bay'],
  ['stukas_estrecho', 'German dive bombers diving over the Strait of Gibraltar, anti-aircraft smoke, ships below'],
  ['tren_roto', 'an old steam locomotive and a broken railway line in rural Spain, an ox cart crossing the tracks, empty fields'],
  ['flota_puerto', 'British battleships and destroyers at anchor in a harbour at dawn, mist over the water'],
  ['bloqueo_mar', 'a cargo ship stopped at sea by a destroyer, sailors inspecting the cargo, grey ocean, wartime blockade'],
  ['mesa_mapas', 'officers in uniform leaning over a large table with a map of the Iberian peninsula, lamp light, dark room, seen from behind'],
  ['pirineos_columna', 'a long column of military trucks and motorcycles winding up a snowy mountain pass in the Pyrenees'],
  ['granero_vacio', 'an empty granary with a few sacks of wheat, dry cracked fields visible through the door, rural Spain'],
  ['ruinas_aldea', 'a ruined Spanish village street after the civil war, damaged church bell tower, rubble, a few villagers walking'],
  ['mula_arado', 'a poor farmer ploughing dry land with a mule, a whitewashed village in the background, Spain 1940'],
  ['mujeres_fuente', 'women in black dresses carrying water jugs at a village fountain in rural Spain, poverty, 1940'],
  ['kiosco_propaganda', 'a Spanish newspaper kiosk with propaganda posters of the regime, men in hats reading newspapers on a street, 1940'],
  ['despacho_balcon', 'a silhouette of a man in a large dark office standing at a balcony window overlooking Madrid rooftops at dusk, seen from behind'],
  ['plaza_banderas', 'a large crowd in a Spanish plaza under many flags at a regime rally, seen from a high angle'],
  ['balanza_trigo_canones', 'a heavy old balance scale, sacks of wheat on one side and artillery shells on the other, dramatic still life, dark background'],
  ['puerto_inactivo', 'a Spanish port at dawn with idle cargo ships, empty docks and cranes, fog'],
  ['vagones_frontera', 'old freight wagons standing at a railway station on a border, workers and guards on the platform, grey sky'],
  ['convoy_escolta', 'a convoy of merchant ships escorted by a destroyer on a rough grey sea'],
  ['manos_libro_cuentas', 'close up of two mens hands over a table with a ledger book and bundles of banknotes, desk lamp, secret negotiation'],
  ['telegrafista', 'a telegraph operator at a desk with a typewriter and wires in a dim office at night, 1940'],
  ['trenes_este', 'long freight trains loaded with military vehicles heading east across a snowy plain'],
  ['voluntarios_estacion', 'young volunteers in uniform boarding a train at a railway station while a crowd waves goodbye, 1941'],
  ['submarinos_puerto', 'submarines moored at a quay in a harbour with sailors on deck, evening light'],
  ['oficiales_prismaticos', 'two men in civilian clothes with binoculars on a rocky hillside overlooking a bay and a fortress rock'],
  ['fortaleza_estrecho', 'an old coastal fortress on a cliff overlooking a narrow strait at dusk, ships passing'],
  ['transportes_atlantico', 'a fleet of troop transports and warships crossing the Atlantic under a stormy sky toward volcanic islands'],
];
const OUT = path.join(ROOT, 'public', 'ai');
fs.mkdirSync(OUT, {recursive: true});
const manifestPath = path.join(ROOT, 'data', 'ai.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : [];
let n = manifest.length;
for (const [id, prompt] of PROMPTS) {
  if (manifest.find((m) => m.id === id)) continue;
  if (n >= MAX_IMG) { console.log('tope alcanzado'); break; }
  const r = await fetch('https://fal.run/fal-ai/flux/schnell', {
    method: 'POST',
    headers: {Authorization: `Key ${key}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({prompt: `${prompt}, ${STYLE}`, image_size: 'landscape_16_9', num_inference_steps: 4, num_images: 1, enable_safety_checker: true}),
  });
  if (!r.ok) { console.log(id, 'HTTP', r.status, (await r.text()).slice(0, 120).replace(key, '***')); continue; }
  const j = await r.json();
  const url = j.images?.[0]?.url;
  if (!url) { console.log(id, 'sin imagen'); continue; }
  const img = Buffer.from(await (await fetch(url)).arrayBuffer());
  fs.writeFileSync(path.join(OUT, id + '.jpg'), img);
  manifest.push({id, file: `ai/${id}.jpg`, prompt, model: 'fal-ai/flux/schnell', seed: j.seed});
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
  n++;
  console.log(`ok ${id} (${(img.length / 1024).toFixed(0)} KB) · generadas ${n} · coste estimado ${(n * COST_PER_IMG).toFixed(3)} $`);
}
console.log(`TOTAL ${n} imágenes · coste estimado ${(n * COST_PER_IMG).toFixed(3)} $ (tope 0,05 $)`);
