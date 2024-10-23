/**
 * Enable to debug typescript with ts-node alternating between "js" and "ts" extensions
 *
 */


import * as path from 'path';

export const { EXT } = {
  ...{
    /** @deprecated */
    EXT: 'js'
  },
  ...process.env,
} ;
/**
 * @deprecated
 */
export const getExt = () => {
  return process.env.EXT ?? 'js';
}
/**
 * @deprecated
 * @param old
 * @returns
 */
export const getRuntimePath = (old: string) => {
  if( getExt() === 'ts'){
    return path.resolve(process.cwd(), 'node_modules/.bin/ts-node');
  }
  return old;
}
