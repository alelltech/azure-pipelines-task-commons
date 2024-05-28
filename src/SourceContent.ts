import { getVariable, setVariable } from "azure-pipelines-task-lib";
import { _warning } from "azure-pipelines-task-lib/internal";
import { readFileSync, writeFileSync } from "fs";

export type SourceType = 'file' | 'text' | 'var';
export type DestType = 'file' | 'text' | 'var';
export const getContentHandles: Record<SourceType, (source: string) => Promise<string>> = {
  'file': (file) => Promise.resolve(readFileSync(file).toString('utf-8')),
  'var': (varname) => Promise.resolve(getVariable(varname) ?? ''),
  'text': (content) => Promise.resolve(content)
}

export const setContentHandles: Record<DestType, (dest: string, content: Buffer | string) => Promise<void>> = {
  'file': (file, content) => Promise.resolve(writeFileSync(file, content)),
  'var': (varname, value) => Promise.resolve(setVariable(varname, value.toString('utf-8'))),
  'text': (_, content) => Promise.resolve(console.log(content.toString('utf-8')))
}

export const getContent = (sourceType: SourceType, source: string) => {
  const handle = getContentHandles[sourceType] ?? getContentHandles.text
  if(getContent == getContentHandles.text && sourceType != 'text') {
    _warning(`Source Type '${sourceType}' is not implemented, using default 'text'.`);
  }
  return handle(source);
}

export const setContent = async (destType: SourceType, dest: string, content: Buffer | string) => {
  const handle = setContentHandles[destType] ?? getContentHandles.text
  if(setContent == setContentHandles.text && destType != 'text') {
    _warning(`Source Type '${destType}' is not implemented, using default 'text'.`);
  }
  handle(dest, content);
}
