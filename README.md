# Samples to use.



## Getting and Setting from/to different sources.

`task.json`
```json
...
  "groups": [{
    "name": "advanced",
    "displayName": "Advanced",
    "isExpanded": false
  }],
  "inputs": [
    {
      "name": "sourceType",
      "label": "Type of source input",
      "required": true,
      "defaultValue": "text",
      "type": "pickList",
      "options": {
        "file": "file",
        "var": "var",
        "text": "text"
      },
      "helpMarkDown": "Indicate type of **source input reference**, can be **File**, **Variable** or **Raw Text Expression**",
      "groupName": "advanced"
    },
    {
      "name": "source",
      "label": "Source input reference or expression",
      "required": true,
      "defaultValue": "",
      "type": "string",
      "helpMarkDown": ""
    },
    {
      "name": "destType",
      "label": "Type of destination output",
      "required": true,
      "defaultValue": "var",
      "type": "pickList",
      "options": {
        "file": "file",
        "var": "var",
        "text": "text"
      },
      "helpMarkDown": "Indicate type of **destination output reference**, can be **File**, **Variable** or **Raw Text Expression**",
      "groupName": "advanced"
    },
    {
      "name": "dest",
      "label": "Destination output reference or expression (not required)",
      "defaultValue": "",
      "type": "string"
    }
  ]
...
```

`YourTask.ts`
```ts
import {
  TaskResult,
  getInput,
  setResult,
  setVariable
} from 'azure-pipelines-task-lib/task';
import { DestType, SourceType, getContent, setContent } from '@alell/azure-pipelines-task-commons';

...

  const source = getInput('source', true);
  const sourceType: SourceType = getInput('sourceType', true) as any;
  const dest = getInput('dest', false);
  const destType: DestType = getInput('destType', true) as any;

  const sourceContent = await getContent(sourceType, source);

  setContent(destType, dest, `${sourceContent} some out content sufix`);

```

`azure-pipeline.yml`
```yaml

  - task: YourTask@1
    displayName: "My Task"
    inputs:
      sourceType: file
      source: ./my-file.txt
      destType: var
      dest: MY_ENCODED_64_VAR

```


*If you like our project help us to make more best solutions.*

> `Bitcoin` / network `BTC`:
>
> `1NvnQAp2e46Fqv4YaoYTioypJZdq4Kc3Az`



> `Etherium` / network `Etherium`:
>
> `0x38a2113604fb3d642bbd009301e94848a499cea4`

> `BitTorrent` / network `Tron`:
>
> `TD9LHa5BjWQpf4oP3uYWP8ghnojJWJy53C`
