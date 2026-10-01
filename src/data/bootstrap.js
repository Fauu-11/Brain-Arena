import { mirrorHeavyLegacyData, dbPut } from './localDb.js';
import { profileRepository, progressRepository, matchRepository, settingsRepository } from './repositories/index.js';
import { getOrCreateGuestIdentity } from '../utils/guestIdentity.js';
import { getFeatureFlags } from '../utils/featureFlags.js';
import { recordMutation } from '../utils/mutationJournal.js';
export async function bootstrapLocalDataLayer(){
  const identity=getOrCreateGuestIdentity();const flags=getFeatureFlags();
  const mirrored=await mirrorHeavyLegacyData();
  await Promise.allSettled([profileRepository.mirror(),progressRepository.mirror(),matchRepository.mirror(),settingsRepository.mirror()]);
  await dbPut('meta',{id:'bootstrap-v19',playerId:identity.id,mirrored:mirrored.mirrored,featureFlags:flags,updatedAt:Date.now()});
  const marker='ba_bootstrap_v19_logged';let shouldLog=true;try{shouldLog=localStorage.getItem(marker)!=='1';localStorage.setItem(marker,'1');}catch{}
  if(shouldLog) await recordMutation({type:'MIGRATION',entity:'local-data-layer',entityId:identity.id,meta:{mirrored:mirrored.mirrored,schema:19}});
  return {identity,mirrored,flags};
}
