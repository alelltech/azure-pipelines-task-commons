import { _warning } from "azure-pipelines-task-lib/internal";
import {
  AzLib,
  DestType,
  set,
  setContentHandles,
  SetProtocols,
} from "./SourceContent";

/**
 * @deprecated @see {@link parse}
 * @param fullScript
 * @returns
 */
export function parseScript(fullScript: string): Query[] {
  const result = [];
  const regex =
    /(((var|file|out|secret) {1,}([^= ]+) {0,}= {0,}([^\n]+))|((echo) {1,}([^\n]+)))( {0,} {0,}([^\n]+))?/gm;

  let m;

  while ((m = regex.exec(fullScript)) !== null) {
    const kind = (m[3] ?? m[7]).trim();
    const dest: string = (m[4] ?? "").trim();
    const script: string = (m[5] ?? m[8]).trim();

    result.push({
      kind,
      dest,
      script,
    });
  }

  return result;
}

export function parse(fullScript: string): ParsedQuery[] {
  const result: ParsedQuery[] = [];
  // const echoRegex =

  let sanetizedScript = fullScript + "\n";
  sanetizedScript = sanetizedScript.replace(/^ {0,}#[^\n]+/gm, "");

  let m;
  const defaultregex =
    /^ {0,}([^ :\n]+) {1,}([^=\n ]+) {0,}= {0,}([^\|\n]+)( {0,}\| {0,}([^\n]+))?$/gm;
  while ((m = defaultregex.exec(sanetizedScript)) !== null) {
    const kind = (m[1] || "").trim();
    const target: string = (m[2] || "").trim();
    const query: string = (m[3] || "").trim();
    const pipes: string = (m[5] || "").trim();

    result.push({
      kind,
      target,
      query,
      pipes: pipes.split("|").map((p) => p.trim()),
    });
  }

  const echoregex =
    /^ {0,}([^ :\n]+) {1,}([^\|\n=]+)( {0,}\| {0,}([^\n]+))?$/gm;
  while ((m = echoregex.exec(sanetizedScript)) !== null) {
    const kind = (m[1] || "").trim();
    const target: string = "";
    const script: string = (m[2] || "").trim();
    const pipes: string = (m[4] || "").trim();

    result.push({
      kind,
      target,
      query: script,
      pipes: pipes.split("|").map((p) => p.trim()),
    });
  }

  const uriregex =
    /^ {0,}((([^: \n]+):\/\/([^ ]+))) {1,}= {0,}(([^\|\n]+)( {0,}\| {0,}([^\n]+))?)$/gm;
  while ((m = uriregex.exec(sanetizedScript)) !== null) {
    const kind = (m[3] || "").trim();
    const target: string = (m[4] || "").trim();
    const script: string = (m[5] || "").trim();
    const pipes: string = (m[7] || "").trim();

    result.push({
      kind,
      target,
      query: script,
      pipes: pipes.split("|").map((p) => p.trim()),
    });
  }

  return result;
}

/**
 * @deprecated @see {@link set}
 */
export const execQueryMap: Record<
  DestType,
  (destination: string, value: string, query: string) => Promise<void>
> = {
  out: (varname, value, query) => {
    console.debug(`out ${varname} = ${query}`);
    return setContentHandles.out(varname, value);
  },
  var: (varname, value, query) => {
    console.debug(`var ${varname} = ${query}`);
    return setContentHandles.var(varname, value);
  },
  file: (file, value, query) => {
    console.debug(`file ${file} = ${query}`);
    return setContentHandles.file(file, value);
  },
  echo: (_, value, query) => {
    console.debug(`echo ${query}`);
    return setContentHandles.echo(undefined, value);
  },
  secret: (varname, value, query) => {
    console.debug(`out ${varname} = ${query}`);
    return setContentHandles.secret(varname, value);
  },
};

/**
 * @deprecated @see {@link ParsedQuery}
 */
type Query = {
  kind: DestType;
  dest: string;
  script: string;
};

type ParsedQuery = {
  kind: string;
  target: string;
  query: string;
  pipes: string[];
};

/**
 * @deprecated @see {@link execute}
 * @param queries
 * @param resolveScript
 */
export const executeScript = async (
  queries: Query[],
  resolveScript: (script: string, query: Query) => Promise<any>
) => {
  for (const { kind, dest, script } of queries) {
    const execQuery = execQueryMap[kind] ?? execQueryMap.echo;
    const p = script.trim();

    const result = await resolveScript(p, { kind, dest, script });
    if (!result) {
      _warning(`Script '${script}' has not results!`);
      continue;
    }
    execQuery(dest, result, p);
  }
};

export const execute = async (
  parsedQueries: ParsedQuery[],
  evaluateScript: (script: string, query: ParsedQuery) => Promise<any>,
  azlib: AzLib
) => {
  for (const { kind, target, query, pipes } of parsedQueries) {
    const q = query.trim();

    console.debug(`${kind}://${target} = ${q}`);
    const result = await evaluateScript(q, { kind, target, query: q, pipes });
    if (!result) {
      _warning(`Script '${query}' has not results!`);
      continue;
    }
    await set(`${kind}://${target}`, result, azlib);
  }
};
