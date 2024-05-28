import { getInput, getVariable, setVariable } from "azure-pipelines-task-lib";
import { _getVariableKey, _loadData } from "azure-pipelines-task-lib/internal";

/**
 * After your sets must call @{link azure-pipelines-task-lib/internal#_loadData}
 * @param input
 */
export const setIn = <I> (input: Partial<I>) => {
  for (const key of Object.keys(input)) {
    process.env[`INPUT_${key}`] = input[key]
  }
}

/**
 * After your sets must call @{link azure-pipelines-task-lib/internal#_loadData}
 * @param variables
 */
export const setVar = <V> (variables: Partial<V>) => {
  for (const key of Object.keys(variables)) {
    setVariable(key.toString(), variables[key] ?? '');
  }
}


export const getParam = <I, V>({
  inName,
  varName,
  required,
  defaultValue,
}: {inName?: keyof I, varName?: keyof V, required?: boolean, defaultValue?: any},
_getInput: typeof getInput) => {
  let valu;
  if(inName) valu = _getInput(inName as string, required);
  if(!valu && varName) valu = getVariable(varName as string);
  return valu ?? defaultValue;
}

/**
 * **Merge** and **Parse** all necessary params across input and variables,
 * > **Inputs overrites Variables**
 * @returns
 */
export function parseParams <I, V> (paramsMap: Record<keyof I, keyof V>, defaults: Partial<Record<keyof I, any>>, _getInput: typeof getInput): Partial<I> {
  return Object.keys(paramsMap).reduce((p, paramKey)=>{
    p[paramKey] = getParam<I, V>({
      inName: paramKey as keyof I,
      varName: paramsMap[paramKey],
      required: undefined,
      defaultValue: (defaults ?? {})[paramKey]
    }, _getInput);
    return p
  }, {})
}

export function parseInput<I>(paramsMap: Record<keyof I, any>, _getInput: typeof getInput): Partial<I> {
  return Object.keys(paramsMap)
  .reduce((p, inputKey)=>{
    p[inputKey] = _getInput(inputKey);
    return p
  },
  {});
}

export function parseVariables<I, V>(paramsMap: Record<keyof I, keyof V>): Partial<V> {
  let varName;
  return Object.keys(paramsMap)
  .reduce((p, inputKey)=>{
    varName = paramsMap[inputKey];
    p[varName] = getVariable(varName);
    return p
  },
  {});
}


