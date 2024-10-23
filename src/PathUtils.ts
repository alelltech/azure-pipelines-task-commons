/**
 * Enable to debug typescript with ts-node alternating between "js" and "ts" extensions
 *
 */


import { existsSync } from 'fs';
import * as path from 'path';

/**
 * Search for file or directory navigating to up
 * @param entity entity to find
 * @returns
 */
export const pathLookUp = (entity: string) => {
  let p = path.resolve(__dirname, entity);
  for (let i = 0; i < 4; i++) {
    if(existsSync(p)) return JSON.parse(p);
    p = path.resolve(p, '..', entity);
  }
}
