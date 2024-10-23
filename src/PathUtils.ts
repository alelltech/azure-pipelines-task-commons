/**
 * Enable to debug typescript with ts-node alternating between "js" and "ts" extensions
 *
 */


import { existsSync } from 'fs';
import * as path from 'path';

/**
 * Search for file or directory navigating to up
 * @param entity entity to find
 * @param from dir to initial search
 * @returns
 */
export const pathLookUp = (entity: string, from: string = __dirname) => {
  let p = path.resolve(from, entity);
  for (let i = 0; i < 4; i++) {
    if(existsSync(p)) return JSON.parse(p);
    p = path.resolve(p, '..', entity);
  }
}
