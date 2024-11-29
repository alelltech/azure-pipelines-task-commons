import { getVariable, setVariable, warning } from "azure-pipelines-task-lib";
import { readFileSync, writeFileSync } from "fs";
import * as path from "path";
import fetcher from "axios";

/**
 * @deprecated use {@link GetProtocols}
 */
export type SourceType = "file" | "text" | "var";
export type GetProtocols = "var" | "file" | "http" | "https";

/**
 * @deprecated use {@link SetProtocols}
 */
export type DestType = "file" | "echo" | "var" | "out" | "secret";
export type SetProtocols =
  | "file"
  | "echo"
  | "var"
  | "out"
  | "secret"
  | "http"
  | "https";

export const getHandles: Record<
  GetProtocols,
  (sourceUri: string, parsedUrl: URL) => Promise<string>
> = {
  file: (file, parsed) =>
    Promise.resolve(
      readFileSync(path.join(parsed.hostname, parsed.pathname)).toString(
        "utf-8"
      )
    ),
  var: (varname, parsed) => Promise.resolve(getVariable(parsed.hostname) ?? ""),
  http: async (url, parsed) => {
    const res = await fetcher(parsed.toString(), {
      method: "GET",
      validateStatus: () => true,
      transformResponse: (x) => x,
    });
    return res.data;
  },
  https: async (url, parsed) => {
    const res = await fetcher(parsed.toString(), {
      method: "GET",
      validateStatus: () => true,
      transformResponse: (x) => x,
    });
    return res.data;
  },
};

export type AzLib = {
  setVariable?: typeof setVariable,
  console?: Console,
  writeFileSync?: typeof writeFileSync
}
export const setHandles: Record<
  SetProtocols,
  (
    dest: string,
    parsedUrl: URL | undefined,
    content: Buffer | string,
    azlib: AzLib
  ) => Promise<void>
> = {
  file: async (file, parsedUrl, content, azlib) =>{
    azlib.writeFileSync(file, content)
  },
  var: async (varname, parsedUrl, value, azlib) => {
    azlib.setVariable(varname, value.toString("utf-8"))
  },
  out: async (varname, parsedUrl, value, azlib) =>{
    azlib.setVariable(varname, value.toString("utf-8"), false, true)
  },
  secret: async (varname, parsedUrl, value, azlib) =>{
    azlib.setVariable(varname, value.toString("utf-8"), true, false)
  },
  echo: async (_, parsedUrl, content, azlib) =>{
    azlib.console.log(content.toString("utf-8"))
  },
  http: async (url, parsed) => {
    const res = await fetcher(url, {
      method: "POST",
      validateStatus: () => true,
      transformResponse: (x) => x,
    });
    // return res.text();
  },
  https: async (url, parsed) => {
    const res = await fetcher(url, {
      method: "POST",
      validateStatus: () => true,
      transformResponse: (x) => x,
    });
    // return res.text();
  },
};


/**
 *
 * @param sourceUri
 * **uri based source** target or **raw string**
 *
 * [**var** | **file** | **http**]://target
 *
 * `var://MY_VAR_NAME`
 *
 * `file:///path/pf/file.txt`
 *
 * `http://host:port/my-get-route-path...`
 *
 * `my raw any string without protocol reference`
 * @returns content from sourceUri
 */
export const get = async (sourceUri: string): Promise<string> => {
  try {
    if (!/^ {0,}([^: \n]+):\/\//i.test(sourceUri)) return sourceUri;

    const parsedUri = new URL(sourceUri);
    const protocol = parsedUri.protocol.slice(0, -1);

    const handle = getHandles[protocol];
    if (!handle) {
      warning(
        `Source Type '${protocol}' is not implemented, using default 'text', IF YOU REALY WANT TO USE RAW TEXT DO NOT USE URI sintax.`
      );
      return Promise.resolve(sourceUri);
    }

    return await handle(
      `${parsedUri.host}${parsedUri.pathname}`,
      parsedUri,
      sourceUri
    );
  } catch (error) {
    // warning(`Error parsing get(sourceUri): '${sourceUri}'`);
    // warning(error?.data ?? error);
    // DO NOT SEND TOO MANY WARNINGS
    return Promise.resolve(sourceUri);
  }
};

/**
 *
 * @param targetUri
 * **uri based** of target or **raw string**
 *
 * [ **file** | **echo** | **var** | **out** | **secret** | **http** | **https** ]://target
 *
 * `var://MY_VAR_NAME`
 * `out://MY_VAR_NAME`
 * `secret://MY_VAR_NAME`
 *
 * `file:///path/pf/file.txt`
 *
 * `http[s]://host:port/my-get-route-path...`
 *
 * @returns
 */
export const set = async (targetUri: string, content: Buffer | string, azlib: AzLib) => {
  try {
    if(targetUri === 'echo'){
      await setHandles.echo(targetUri, undefined, content, azlib);
      return;
    }

    if(!/(file|var|out|secret|http|https):\/\//.test(targetUri)){
      warning(`Invalid uri format.`);
      await setHandles.echo(targetUri, undefined, content, azlib);
      return;
    }

    const parsedUri = new URL(targetUri);
    const protocol = parsedUri.protocol.slice(0, -1);

    const handle = setHandles[protocol];
    if (!handle) {
      warning(
        `Target Type '${protocol}' is not implemented, using default 'echo', IF YOU REALY WANT TO USE RAW TEXT DO NOT USE URI sintax.`
      );
      await setHandles.echo(targetUri, parsedUri, content, azlib);
    }

    await handle(`${parsedUri.host}${parsedUri.pathname}`, parsedUri, content, azlib);
  } catch (error) {
    warning(`Error parsing set(sourceUri): '${targetUri}'`);
    warning(error?.data ?? error);
    await setHandles.echo(targetUri, undefined, content, azlib);
  }
};
