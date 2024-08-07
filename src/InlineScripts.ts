import { _warning } from "azure-pipelines-task-lib/internal";
import {
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
    /(((var|file|out|secret) {1,}([^=]+)=([^\n]+))|((echo) {1,}([^\n]+)))( {0,} {0,}([^\n]+))?/gm;

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
  const regex =
    /(((var|file|out|secret) {1,}([^=]+)=([^\n]+))|((echo) {1,}([^\n]+)))( {0,} {0,}([^\n]+))?|((([^: \n]+):\/\/([^ ]+))) {1,}=([^\n]+)/gm;

  let m;

  while ((m = regex.exec(fullScript)) !== null) {
    const kind = (m[3] || m[7] || m[13] || "").trim();
    const target: string = (m[4] || m[14] || "").trim();
    const script: string = (m[5] || m[8] || m[15]).trim();

    result.push({
      kind,
      target,
      query: script,
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
  evaluateScript: (script: string, query: ParsedQuery) => Promise<any>
) => {
  for (const { kind, target, query } of parsedQueries) {
    const q = query.trim();

    console.debug(`${kind}://${target} = ${q}`);
    const result = await evaluateScript(q, { kind, target, query: q });
    if (!result) {
      _warning(`Script '${query}' has not results!`);
      continue;
    }
    await set(`${kind}://${target}`, result);
  }
};
