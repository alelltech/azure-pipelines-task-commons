import {
  AzLib,
  set,
} from "./SourceContent";

export function parse(fullScript: string): ParsedQuery[] {
  const result: ParsedQuery[] = [];
  // const echoRegex =

  let sanetizedScript = fullScript + "\n";
  sanetizedScript = sanetizedScript.replace(/^ {0,}#[^\n]+/gm, "");

  let m;
  const defaultregex =
    /^ {0,}([^ :\n]+) {1,}([^=\n ]+) {0,}= {0,}(([^\|\n]+)( {0,}\| {0,}([^\n]+))?)$/gm;
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
    /^ {0,}([^ :\n]+) {1,}(([^\|\n=]+)( {0,}\| {0,}([^\n]+))?)$/gm;
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

type ParsedQuery = {
  kind: string;
  target: string;
  query: string;
  pipes: string[];
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
      console.warn(`Script '${query}' has not results!`);
      continue;
    }
    await set(`${kind}://${target}`, result, azlib);
  }
};
