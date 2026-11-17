const fs=require('fs');
let s=fs.readFileSync('tools/build_timeline.mjs','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('falta: '+a.slice(0,70));s=s.replace(a,b)};
// AI tags
rep("const DROP = /","const AI_TAG = {hendaye_tren: 'frontera', hambre_cola: 'hambre', gibraltar_roca: 'gibraltar', stukas_estrecho: 'wehrmacht', tren_roto: 'hambre', flota_puerto: 'naval', bloqueo_mar: 'naval', granero_vacio: 'hambre', mesa_mapas: 'mapas', pirineos_columna: 'frontera', ruinas_aldea: 'guerra', mula_arado: 'hambre', mujeres_fuente: 'hambre', kiosco_propaganda: 'regimen', despacho_balcon: 'regimen', plaza_banderas: 'regimen', balanza_trigo_canones: 'hambre', puerto_inactivo: 'hambre', vagones_frontera: 'frontera', convoy_escolta: 'naval', manos_libro_cuentas: 'dinero', telegrafista: 'mapas', trenes_este: 'barbarroja', voluntarios_estacion: 'azul', submarinos_puerto: 'naval', oficiales_prismaticos: 'gibraltar', fortaleza_estrecho: 'gibraltar', transportes_atlantico: 'atlantico'};\nconst DROP = /");
rep("images.push({chapter: AI_CH[x.id], tag: 'ia',","images.push({chapter: AI_CH[x.id], tag: (typeof AI_TAG !== 'undefined' && AI_TAG[x.id]) || 'ia', aiId: x.id,");
fs.writeFileSync('tools/build_timeline.mjs',s);
