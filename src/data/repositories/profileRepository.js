import { createRepository } from './baseRepository.js';
import { readJSON, writeJSON } from '../../utils/storage.js';
import { getOrCreateGuestIdentity } from '../../utils/guestIdentity.js';
const repo=createRepository('profile');
const LEGACY_KEY='ba_profile_v1';
export const profileRepository={
  async get(){const guest=getOrCreateGuestIdentity();const local=readJSON(LEGACY_KEY,{});return {...local,playerId:local.playerId||guest.id};},
  async save(profile){const guest=getOrCreateGuestIdentity();const next={...profile,playerId:profile?.playerId||guest.id,updatedAt:Date.now()};writeJSON(LEGACY_KEY,next);await repo.save(next.playerId,next);return next;},
  async mirror(){const profile=await this.get();await repo.save(profile.playerId,profile);return profile;},
};
