import { createRepository } from './baseRepository.js';
import { readJSON } from '../../utils/storage.js';
import { getOrCreateGuestIdentity } from '../../utils/guestIdentity.js';
const repo=createRepository('matches');
export const matchRepository={
  getLegacy(){const candidates=['ba_matches_v1','ba_match_history_v1','ba_matches_v2'];for(const key of candidates){const value=readJSON(key,null);if(Array.isArray(value))return value;}return [];},
  async mirror(){const playerId=getOrCreateGuestIdentity().id;const matches=this.getLegacy();await repo.save(playerId,{playerId,matches,updatedAt:Date.now()});return matches;},
};
