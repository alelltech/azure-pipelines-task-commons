import { _warning } from "azure-pipelines-task-lib/internal";
import { DestType, setContentHandles } from './SourceContent';


export function parseScript(fullScript: string): Query[] {
  const result = [];
  const regex = /(((var|file|out|secret) {1,}([^=]+)=([^\n]+))|((echo) {1,}([^\n]+)))( {0,} {0,}([^\n]+))?/gm

  let m;

  while ((m = regex.exec(fullScript)) !== null) {
    const kind = (m[3] ?? m[7]).trim()
    const dest: string = (m[4] ?? '').trim()
    const script: string = (m[5] ?? m[8]).trim()

    result.push({
      kind,
      dest,
      script
    })
  }

  return result;
}

export const execQueryMap: Record<DestType, (destination: string, value: string, query: string) => Promise<void>> = {
  'out': (varname, value, query) => {
    console.debug(`out ${varname} = ${query}`);
    return setContentHandles.out(varname, value);
  },
  'var': (varname, value, query) => {
    console.debug(`var ${varname} = ${query}`);
    return setContentHandles.var(varname, value);
  },
  'file': (file, value, query) => {
    console.debug(`file ${file} = ${query}`);
    return setContentHandles.file(file, value);
  },
  'echo': (_, value, query) => {
    console.debug(`echo ${query}`);
    return setContentHandles.echo(undefined, value);
  },
  'secret': (varname, value, query) => {
    console.debug(`out ${varname} = ${query}`);
    return setContentHandles.secret(varname, value);
  },
}

type Query = {
  kind: DestType;
  dest: string;
  script: string
};

export const executeScript = async (
  queries: Query[],
  resolveScript: (script: string, query: Query) => Promise<any>
) => {
  for (const { kind, dest, script } of queries) {
    const execQuery = execQueryMap[kind] ?? execQueryMap.echo;
    let p = script.trim();
    if (!p.startsWith('${{')) p = `$\{\{${p}`;
    if (!p.endsWith('}}')) p = `${p}\}\}`;

    const result = await resolveScript(p, { kind, dest, script });
    if (!result) {
      _warning(`Script '${script}' has not results!`);
      continue;
    }
    execQuery(dest, result, p);
  }
}

