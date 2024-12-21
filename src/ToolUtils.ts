import * as path from "path";
import * as http from 'http';
import * as fs from 'fs';
import { getVar } from "./BuiltInVariables";
import { URL } from "url";

// export async function downloadTool(
//   url: string,
//   opts: {
//     cache_root?: string
//     tool_name: string
//     semantic_version?: string
//     platform?: string
//   }
// ){
//   return new Promise((resolve, reject) => {
//     try {

//       const parsedUrl = new URL(url);
//       const urlSemver = /\d+.\d+.\d+/.exec(url);
//       const urlPlatform = /arm\d{0,}|x86|x64|x86-x64|intel|amd\d{0,}|amd64/.exec(url);

//       const { cache_root, tool_name, semantic_version, platform, } = {
//         cache_root: path.join(getVar('AGENT_TOOLSDIRECTORY')),
//         tool_name: '',
//         semantic_version: (urlSemver?.toString()) || '1.0.0',
//         platform: (urlPlatform?.toString()) || 'x64',
//         ...opts
//       };

//       const name = tool_name || parsedUrl.hostname
//       const destDir = cache_root;
//       const tempFile = path.join(cache_root, name, semantic_version, platform);

//       var out = fs.createWriteStream(tempFile);
//       http.get(url, function(response) {
//         response.pipe(out);

//         out.on('finish', () => out.close(() => resolve(destDir)));

//       }).on('error', function(err) { // Handle errors
//         fs.unlink(tempFile, void(0));
//         reject(err);
//       });
//     } catch (error) {
//       reject(error);
//     }
//   });
// }

// export async function installTool(
//   url: string,
//   opts: {
//     cache_root?: string
//     tool_name: string
//     semantic_version?: string
//     platform?: string
//   }
// ){

//   const archive = await downloadTool(url, opts);

// }
