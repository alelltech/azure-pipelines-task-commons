import * as assert from "assert";
import { getRuntimePath } from "../RuntimeUtil";
import { executeScript, parseScript } from "../InlineScripts";
import { json } from "stream/consumers";
import { get } from "../SourceContent";

describe(`ParamsUtils Suite`, () => {
  it("parseInput", async () => {
    assert("".length == 0, "should have empty string");
  });
});

describe("RuntimeUtils Suite", () => {
  after(() => {
    delete process.env.EXT;
  });

  it("getRuntimePath", async () => {
    process.env.EXT = "ts";
    const runtime = getRuntimePath("");
    assert(runtime, "runtime must be defined");
    assert(
      runtime.endsWith("node_modules/.bin/ts-node"),
      'runtime must be "ts-node".'
    );
  });
});

describe("InlineScripts Suite", () => {
  after(() => {
    delete process.env.EXT;
  });

  it("parseScript", async () => {
    process.env.EXT = "ts";
    const runtime = getRuntimePath("");
    const queries = parseScript(
      [
        `var NAME    =      .metadata.name | downcase`,
        `var KIND    =    .kind`,
        `echo      .kind | uppercase`,
        `file  ./bar/annotations.json  = .metadata.annotations`,
        `out outTest   =   .emptyResultTest | uppercase`,
        `secret secretTest =     .emptyResultTest | uppercase`,
        `var DOC_TWO_NAME    =      $[1].metadata.name | downcase`,
      ].join("\n")
    );

    assert(queries, "queries must be defined");
    assert(queries.length === 7, "queries must have 7 items.");
    assert(
      JSON.stringify(queries) ===
        '[{"kind":"var","dest":"NAME","script":".metadata.name | downcase"},{"kind":"var","dest":"KIND","script":".kind"},{"kind":"echo","dest":"","script":".kind | uppercase"},{"kind":"file","dest":"./bar/annotations.json","script":".metadata.annotations"},{"kind":"out","dest":"outTest","script":".emptyResultTest | uppercase"},{"kind":"secret","dest":"secretTest","script":".emptyResultTest | uppercase"},{"kind":"var","dest":"DOC_TWO_NAME","script":"$[1].metadata.name | downcase"}]'
    );
  });
  // it('executeScript', async () => {
  //   process.env.EXT = 'ts';
  //   const runtime = getRuntimePath('');
  //   const queries = parseScript([
  //     `var NAME    =      .metadata.name | downcase`,
  //     `var KIND    =    .kind`,
  //     `echo      .kind | uppercase`,
  //     `file  ./bar/annotations.json  = .metadata.annotations`,
  //     `out outTest   =   .emptyResultTest | uppercase`,
  //     `secret secretTest =     .emptyResultTest | uppercase`,
  //     `var DOC_TWO_NAME    =      $[1].metadata.name | downcase`,
  //   ].join('\n'));

  //   let counter = 0
  //   await executeScript(queries, async (script, query) => {
  //     counter+=1;
  //     return `EXECUTED: \n ${script}`;
  //   });
  //   assert(counter === queries.length)
  // })
});
describe("SourceContent Suite", () => {
  it("get", async () => {
    let result: string = "";

    result = await get("var://MY_VAR_NAME");

    result = await get("file:///path/to/file.txt");

    result = await get("http://host:8080/my-get-route-path...");

    result = await get("my raw any string without protocol reference");
  });
});
