import { createRepository } from './baseRepository.js';
import { readJSON, readText } from '../../utils/storage.js';
import { getOrCreateGuestIdentity } from '../../utils/guestIdentity.js';
const repo=createRepository('settings');
export const settingsRepository={
  snapshot(){return {playerId:getOrCreateGuestIdentity().id,accessibility:readJSON('ba_accessibility_v1',{}),sidebar:readJSON('ba_sidebar_layout_v2',{}),language:readText('ba_language','id'),updatedAt:Date.now()};},
  async mirror(){const snap=this.snapshot();await repo.save(snap.playerId,snap);return snap;},
};
