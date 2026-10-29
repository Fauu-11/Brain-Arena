import { useLayoutEffect } from 'react';
import { registerCheckpoint } from '../utils/gameCheckpoint.js';
export function useGameCheckpoint(gameId, state, restore, stable, active) {
  useLayoutEffect(()=>{registerCheckpoint(gameId,state,restore,stable,active);});
}
