import * as assert from "assert";
import { getRuntimePath } from "../RuntimeUtil";
import { execute, executeScript, parse, parseScript } from "../InlineScripts";
import { json } from "stream/consumers";
import { get, set } from "../SourceContent";

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

  it("parse", async () => {
    process.env.EXT = "ts";
    const runtime = getRuntimePath("");
    const queries = parse(
      [
        `var NAME    =      .metadata.name | downcase`,
        `var KIND    =    .kind`,
        `echo      .kind | uppercase`,
        `file  ./bar/annotations.json  = .metadata.annotations`,
        `out outTest   =   .emptyResultTest | uppercase`,
        `secret secretTest =     .emptyResultTest | uppercase`,
        `var DOC_TWO_NAME    =      $[1].metadata.name | downcase`,
        "# Extract results to variables",
        "var NAME = .metadata.name | downcase",
        "var KIND = .kind",
        "",
        "# Extract results to variables with ;isOutput=true flag",
        "out KIND = .kind",
        "# Just print results",
        "echo .kind",
        "# Extract results to JSON file",
        "file ./foo/bar.json = .metadata.annotations",
        "var://teste = .metadata.annotations",
        "file://./teste.txt = .metadata.annotations",
        "http://hostname.com.br/users/teste?param=x& = .metadata.annotations",
        "$var://teste = [class='teste']",
        "var://teste = .metadata.annotations",
      ].join("\n")
    );

    assert(queries, "queries must be defined");
    assert(queries.length === 17, "queries must have 17 items.");
    assert(
      JSON.stringify(queries) ===
        `[{"kind":"var","dest":"NAME","script":".metadata.name | downcase"},{"kind":"var","dest":"KIND","script":".kind"},{"kind":"echo","dest":"","script":".kind | uppercase"},{"kind":"file","dest":"./bar/annotations.json","script":".metadata.annotations"},{"kind":"out","dest":"outTest","script":".emptyResultTest | uppercase"},{"kind":"secret","dest":"secretTest","script":".emptyResultTest | uppercase"},{"kind":"var","dest":"DOC_TWO_NAME","script":"$[1].metadata.name | downcase"},{"kind":"var","dest":"NAME","script":".metadata.name | downcase"},{"kind":"var","dest":"KIND","script":".kind"},{"kind":"out","dest":"KIND","script":".kind"},{"kind":"echo","dest":"","script":".kind"},{"kind":"file","dest":"./foo/bar.json","script":".metadata.annotations"},{"kind":"var","dest":"teste","script":".metadata.annotations"},{"kind":"file","dest":"./teste.txt","script":".metadata.annotations"},{"kind":"http","dest":"hostname.com.br/users/teste?param=x&","script":".metadata.annotations"},{"kind":"$var","dest":"teste","script":"[class='teste']"},{"kind":"var","dest":"teste","script":".metadata.annotations"}]`
    );
  });
  it("executeScript", async () => {
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

    let counter = 0;
    await executeScript(queries, async (script, query) => {
      counter += 1;
      return `EXECUTED: \n ${script}`;
    });
    assert(counter === queries.length);
  });

  it("execute", async () => {
    process.env.EXT = "ts";
    const runtime = getRuntimePath("");
    const queries = parse(
      [
        `var NAME    =      .metadata.name | downcase`,
        `var KIND    =    .kind`,
        `echo      .kind | uppercase`,
        `file  ./bar/annotations.json  = .metadata.annotations`,
        `out outTest   =   .emptyResultTest | uppercase`,
        `secret secretTest =     .emptyResultTest | uppercase`,
        `var DOC_TWO_NAME    =      $[1].metadata.name | downcase`,
        "# Extract results to variables",
        "var NAME = .metadata.name | downcase",
        "var KIND = .kind",
        "",
        "# Extract results to variables with ;isOutput=true flag",
        "out KIND = .kind",
        "# Just print results",
        "echo .kind",
        "# Extract results to JSON file",
        "file ./foo/bar.json = .metadata.annotations",
        "var://teste = .metadata.annotations",
        "file://./teste.txt = .metadata.annotations",
        // "http://hostname.com.br/users/teste?param=x& = .metadata.annotations",
        "$var://teste = [class='teste']",
        "var://teste = .metadata.annotations",
      ].join("\n")
    );

    let counter = 0;
    await execute(queries, async (query, _parsedQuery) => {
      counter += 1;
      console.log(_parsedQuery);
      return `EXECUTED: \n ${query}`;
    });
    assert(counter === queries.length);
  });
});
describe("SourceContent Suite", () => {
  it("get", async () => {
    await Promise.all([
      get("var://MY_VAR_NAME"),
      get("file:///path/to/file.txt"),
      // get("http://host:8080/my-get-route-path..."),
      get("my raw any string without protocol reference"),
    ]);
  });

  it("set", async () => {
    await Promise.all([
      set("var://MY_VAR_NAME", ""),
      // set("file:///path/to/file.txt"),
      // set("http://host:8080/my-get-route-path..."),
      set("echo", "my raw any string without protocol reference"),
    ]);
  });
});
