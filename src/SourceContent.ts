import { getVariable, setVariable, warning } from "azure-pipelines-task-lib";
import { readFileSync, writeFileSync } from "fs";
import path = require("path");
import axios from "axios";
import { Agent } from "http";

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

/**
 * @deprecated use {@link getHandles}
 */
export const getContentHandles: Record<
  SourceType,
  (source: string) => Promise<string>
> = {
  file: (file) => Promise.resolve(readFileSync(file).toString("utf-8")),
  var: (varname) => Promise.resolve(getVariable(varname) ?? ""),
  text: (content) => Promise.resolve(content),
};

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
    const res = await axios.get(parsed.toString(), {
      timeout: 1000,
      transformResponse: (x) => x,
      validateStatus: () => true,
    });
    return res.data;
  },
  https: async (url, parsed) => {
    const res = await axios.get(parsed.toString(), {
      timeout: 1000,
      transformResponse: (x) => x,
      validateStatus: () => true,
    });
    return res.data;
  },
};

/**
 * @deprecated @see {@link setHandles}
 */
export const setContentHandles: Record<
  DestType,
  (dest: string, content: Buffer | string) => Promise<void>
> = {
  file: (file, content) => Promise.resolve(writeFileSync(file, content)),
  var: (varname, value) =>
    Promise.resolve(setVariable(varname, value.toString("utf-8"))),
  out: (varname, value) =>
    Promise.resolve(setVariable(varname, value.toString("utf-8"), false, true)),
  secret: (varname, value) =>
    Promise.resolve(setVariable(varname, value.toString("utf-8"), true, false)),
  echo: (_, content) => Promise.resolve(console.log(content.toString("utf-8"))),
};

export const setHandles: Record<
  SetProtocols,
  (
    dest: string,
    parsedUrl: URL | undefined,
    content: Buffer | string
  ) => Promise<void>
> = {
  file: (file, parsedUrl, content) =>
    Promise.resolve(writeFileSync(file, content)),
  var: (varname, parsedUrl, value) =>
    Promise.resolve(setVariable(varname, value.toString("utf-8"))),
  out: (varname, parsedUrl, value) =>
    Promise.resolve(setVariable(varname, value.toString("utf-8"), false, true)),
  secret: (varname, parsedUrl, value) =>
    Promise.resolve(setVariable(varname, value.toString("utf-8"), true, false)),
  echo: (_, parsedUrl, content) =>
    Promise.resolve(console.log(content.toString("utf-8"))),
  http: async (url, parsed) => {
    const res = await axios.post(url, {
      timeout: 1000,
    });
    return res.data;
  },
  https: async (url, parsed) => {
    const res = await axios.post(url, {
      timeout: 1000,
    });
    return res.data;
  },
};

/**
 * @deprecated @see {@link get}
 * @param sourceType
 * @param source
 * @returns
 */
export const getContent = (sourceType: SourceType, source: string) => {
  const handle = getContentHandles[sourceType] ?? getContentHandles.text;
  if (handle == getContentHandles.text && sourceType != "text") {
    warning(
      `Source Type '${sourceType}' is not implemented, using default 'text'.`
    );
  }
  return handle(source);
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
 * @deprecated
 * @param destType
 * @param dest
 * @param content
 */
export const setContent = async (
  destType: DestType,
  dest: string,
  content: Buffer | string
) => {
  const handle = setContentHandles[destType] ?? getContentHandles.text;
  if (setContent == setContentHandles.echo && destType != "echo") {
    warning(
      `Destination Type '${destType}' is not implemented, using default 'text'.`
    );
  }
  await handle(dest, content);
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
export const set = async (targetUri: string, content: Buffer | string) => {
  try {
    const parsedUri = new URL(targetUri);
    const protocol = parsedUri.protocol.slice(0, -1);

    const handle = setHandles[protocol];
    if (!handle) {
      warning(
        `Target Type '${protocol}' is not implemented, using default 'echo', IF YOU REALY WANT TO USE RAW TEXT DO NOT USE URI sintax.`
      );
      await setHandles.echo(targetUri, parsedUri, content);
    }

    await handle(`${parsedUri.host}${parsedUri.pathname}`, parsedUri, content);
  } catch (error) {
    warning(`Error parsing set(sourceUri): '${targetUri}'`);
    warning(error?.data ?? error);
    await setHandles.echo(targetUri, undefined, content);
  }
};
