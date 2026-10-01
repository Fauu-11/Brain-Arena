import { buildNormalizedPlayerModel, validateNormalizedPlayerModel } from './normalizedModel.js';
import { DATA_SCHEMA_VERSION } from './migration.js';
function checksum(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,'0');}
export function createSupabaseMigrationPackage(){
  const player=buildNormalizedPlayerModel();const validation=validateNormalizedPlayerModel(player);if(!validation.valid)throw new Error(`migration-model-invalid:${validation.issues.join(',')}`);
  const payload={format:'brain-arena-supabase-migration',version:1,sourceAppVersion:'1.19.1',sourceSchema:DATA_SCHEMA_VERSION,generatedAt:Date.now(),player};
  const serialized=JSON.stringify(payload);return {...payload,checksum:checksum(serialized)};
}
export function downloadSupabaseMigrationPackage(){
  const payload=createSupabaseMigrationPackage();const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`brain-arena-v2-migration-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);return payload;
}
export function inspectSupabaseMigrationPackage(payload){const valid=payload?.format==='brain-arena-supabase-migration'&&payload?.version===1&&payload?.sourceSchema>=19&&validateNormalizedPlayerModel(payload.player).valid;return {valid,sourceSchema:Number(payload?.sourceSchema)||0,playerId:payload?.player?.identity?.id||null};}
