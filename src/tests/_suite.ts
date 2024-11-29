import * as assert from "assert";
import { execute, parse } from "../InlineScripts";
import * as os from "node:os";
import { setVariable } from 'azure-pipelines-task-lib'
import { writeFileSync } from "node:fs";

import {
  AzLib,
  get,
  set,
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

describe("InlineScripts Suite", () => {
  after(() => {
    delete process.env.EXT;
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


  it("setHandles", async () => {
    // const result = await Promise.all([
    //   setHandles.file(tempFile, undefined, ""),
    //   setHandles.var("teste", undefined, ""),
    //   setHandles.out("teste", undefined, ""),
    //   setHandles.secret("teste", undefined, ""),
    //   setHandles.echo("", undefined, ""),
    //   // setHandles.http("https://www.google.com", undefined, ""),
    //   // setHandles.https("https://www.google.com", undefined, ""),
    // ]);

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
    assert(result);
  });
});
