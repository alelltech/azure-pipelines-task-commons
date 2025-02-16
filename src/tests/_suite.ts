import "mocha";
import assert from "assert";
import { getRuntimePath } from "../RuntimeUtil";
import { execute, executeScript, parse, parseScript } from "../InlineScripts";
import * as os from "node:os";
import { setVariable } from 'azure-pipelines-task-lib'
import { writeFileSync } from "node:fs";

import {
  AzLib,
  get,
  getContentHandles,
  set,
  setContentHandles,
  setHandles,
} from "../SourceContent";
import * as path from "path";

const tempFile = path.resolve(os.tmpdir(), "teste.txt");

writeFileSync(tempFile, "sample data");

const azlib: AzLib = {
  console,
  writeFileSync,
  setVariable
}

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
        `file ${tempFile} = .metadata.annotations`,
        "var://teste = .metadata.annotations",
        `file://${tempFile} = .metadata.annotations`,
        "https://www.google.com = .metadata.annotations",
        "var://teste = .metadata.annotations {{ MYVAR | upper | lower }}",
      ].join("\n")
    );

    assert(queries, "queries must be defined");
    assert(queries.length === 16, "queries must have 16 items.");
  });
  it("executeScript", async () => {
    process.env.EXT = "ts";
    const queries = parseScript(
      [
        `var NAME    =      .metadata.name | downcase`,
        `var KIND    =    .kind`,
        `echo      .kind | uppercase`,
        `file  ${tempFile}  = .metadata.annotations`,
        `out outTest   =   .emptyResultTest | uppercase`,
        `secret secretTest =     .emptyResultTest | uppercase`,
        `var DOC_TWO_NAME    =      $[1].metadata.name | downcase`,
      ].join("\n")
    );

    let counter = 0;
    await executeScript(queries, async (script, query) => {
      counter += 1;
      return `EXECUTED: ${script}`;
    });
    assert(counter === queries.length);
  });

  it("execute", async () => {
    process.env.EXT = "ts";
    const queries = parse(
      [
        `var NAME    =      .metadata.name | downcase`,
        `var KIND    =    .kind`,
        `echo      .kind | uppercase`,
        `file  ${tempFile}  = .metadata.annotations`,
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
        `file ${tempFile} = .metadata.annotations`,
        "var://teste = .metadata.annotations",
        `file://${tempFile} = .metadata.annotations`,
        // "https://www.google.com = .metadata.annotations",
        "var://teste = .metadata.annotations",
      ].join("\n")
    );

    let counter = 0;
    await execute(queries, async (query, _parsedQuery) => {
      counter += 1;
      // console.log(_parsedQuery);
      return `EXECUTED: ${query}`;
    },
    azlib);
    assert(counter === queries.length);
  });
});
describe("SourceContent Suite", () => {
  it("getContentHandles", async () => {
    const result = await Promise.all([
      getContentHandles.file(tempFile),
      getContentHandles.text(""),
      getContentHandles.var("teste"),
    ]);
    assert(result);
  });

  it("setContentHandles", async () => {
    const result = await Promise.all([
      setContentHandles.file(tempFile, ""),
      setContentHandles.var("teste", ""),
      setContentHandles.out("teste", ""),
      setContentHandles.secret("teste", ""),
      setContentHandles.echo("", ""),
    ]);
    assert(result);
  });

  it("setHandles", async () => {

    await setHandles.file(tempFile, undefined, "", azlib);
    await setHandles.var("teste", undefined, "", azlib);
    await setHandles.out("teste", undefined, "", azlib);
    await setHandles.secret("teste", undefined, "", azlib);
    await setHandles.echo("", undefined, "", azlib);
    // setHandles.http("https://www.google.com", undefined, ""),
    // setHandles.https("https://www.google.com", undefined, ""),

    assert(true);
  });

  it("get", async () => {
    const result = await Promise.all([
      get("var://MY_VAR_NAME"),
      get(`file://${tempFile}`),
      get("https://www.google.com"),
      get("my raw any string without protocol reference"),
    ]);
    assert(result);
  });

  it("set", async () => {
    const result = await Promise.all([
      set("var://MY_VAR_NAME", "", azlib),
      set(`file://${tempFile}`, "", azlib),
      // set("https://www.google.com", ""),
      set("echo", "my raw any string without protocol reference", azlib),
    ]);
    assert(result, "");
  });
});
