import { createRepository } from './baseRepository.js';
import { readJSON } from '../../utils/storage.js';
import { getOrCreateGuestIdentity } from '../../utils/guestIdentity.js';
const repo=createRepository('progress');
const keys=['ba_progress_v1','ba_rank_v1','ba_season_v1','ba_mastery_v1','ba_achievements_v1','ba_missions_v1','ba_personal_goals_v1'];
export const progressRepository={
  snapshot(){const playerId=getOrCreateGuestIdentity().id;const data={};for(const key of keys)data[key]=readJSON(key,null);return {playerId,data,updatedAt:Date.now()};},
  async mirror(){const snap=this.snapshot();await repo.save(snap.playerId,snap);return snap;},
};
