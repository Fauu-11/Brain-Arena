import { readJSON, writeJSON } from './storage.js';
export const FEATURE_FLAGS_KEY='ba_feature_flags_v1';
export const DEFAULT_FEATURE_FLAGS={cloudSync:false,onlineProfile:false,globalLeaderboard:false,social:false,supabaseAdapter:false,indexedDbLayer:true,syncQueue:true,mutationJournal:true};
export function getFeatureFlags(){const saved=readJSON(FEATURE_FLAGS_KEY,{});return {...DEFAULT_FEATURE_FLAGS,...(saved&&typeof saved==='object'?saved:{})};}
export function setFeatureFlag(key,value){if(!Object.hasOwn(DEFAULT_FEATURE_FLAGS,key))return getFeatureFlags();const next={...getFeatureFlags(),[key]:Boolean(value)};writeJSON(FEATURE_FLAGS_KEY,next);return next;}
