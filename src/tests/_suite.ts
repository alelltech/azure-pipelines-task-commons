import * as assert from "assert";
import { getRuntimePath } from "../RuntimeUtil";

describe(`ParamsUtils Suite`, () => {
  it('parseInput', async () => {
    assert(''.length == 0, 'should have empty string')
  })
})

describe("RuntimeUtils Suite", ()=>{
  after(() =>{
    delete process.env.EXT
  })

  it('getRuntimePath', async () => {
    process.env.EXT = 'ts';
    const runtime = getRuntimePath('');
    assert(runtime, 'runtime must be defined');
    assert(runtime.endsWith('node_modules/.bin/ts-node'), 'runtime must be "ts-node".')
  })
})
