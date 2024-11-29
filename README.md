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

## About US

<style>
.flex-container { display: flex; flex-wrap: nowrap; }
.flex-container img.social { width: 60px; height: 60px; margin: 10px; text-align: center; line-height: 75px; font-size: 30px; }
</style>

<div class="flex-container">
  <div>
    <img src="assets/me.jpg" style="border-radius: 50%;width: 100px" />
  </div>

  <div><a href="https://www.hackerrank.com/profile/alan_sferreira">
  <img class="social" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGhlaWdodD0iNTEycHgiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB3aWR0aD0iNTEycHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnIGlkPSJfeDMxXzYwLWhhY2tlcnJhbmsiPjxnPjxnPjxwYXRoIGQ9Ik00NTQuODQzLDE0MS4wMDFjLTEzLjAxOS0yMi40MTctMTcyLjgzMi0xMTUtMTk4Ljg1OS0xMTVjLTI2LjAxOSwwLTE4NS44OTUsOTIuMzUxLTE5OC44NCwxMTUgICAgIGMtMTIuOTQ3LDIyLjY0OS0xMy4wMTksMjA3LjM1OCwwLDIzMC4wMDljMTMuMDE4LDIyLjYzOSwxNzIuODM5LDExNC45ODksMTk4Ljg0LDExNC45ODljMjYsMCwxODUuODQxLTkyLjQ2NiwxOTguODUxLTExNC45OTkgICAgIEM0NjcuODQyLDM0OC40NjcsNDY3Ljg1MSwxNjMuNDE3LDQ1NC44NDMsMTQxLjAwMXogTTMwOS44NjIsMzk4LjE1Yy0zLjU1OSwwLTM2Ljc1Ni0zMi4xMzctMzQuMTQxLTM0Ljc2MiAgICAgYzAuNzgxLTAuNzgsNS42MjUtMS4zMjgsMTUuNzY4LTEuNjQ0YzAtMjMuNTY0LDAuNTMtNjEuNjIyLDAuODQ0LTc3LjU1M2MwLjAzOC0xLjgxNC0wLjM5NS0zLjA4MS0wLjM5NS01LjI1NmgtNzEuODEyICAgICBjMCw2LjM3OS0wLjQxMiwzMi41MjMsMS4yMzIsNjUuNDc5YzAuMjA1LDQuMDc4LTEuNDIsNS4zNTMtNS4xNTgsNS4zMzVjLTkuMTAyLTAuMDI1LTE4LjIxMS0wLjA5OS0yNy4zMjEtMC4wNzEgICAgIGMtMy42ODMsMC4wMDktNS4yNzQtMS4zNzQtNS4xNTctNS40ODhjMC44MjYtMzAuMDQzLDIuNjYtNzUuNDg4LTAuMTM0LTE5MS4wN3YtMi44NDljLTguNjg4LTAuMzE0LTE0LjcxNy0wLjg2Mi0xNS41MDgtMS42NTIgICAgIGMtMi42MjQtMi42MjQsMzEuMDMyLTM0Ljc2LDM0LjU4MS0zNC43NmMzLjU1OCwwLDM2Ljk4OSwzMi4xNDUsMzQuMzgzLDM0Ljc2Yy0wLjc4MiwwLjc4MS03LjA5OCwxLjMzOC0xNS4wNjcsMS42NTJ2Mi44NCAgICAgYy0yLjE3NCwyMy4xMzUtMS44MjMsNzEuNTA2LTIuMzYyLDk0LjY4Nmg3Mi4xMDdjMC00LjA4OSwwLjM1MS0zMS4yMTItMS4wNzctNzUuMTQ1Yy0wLjA5MS0zLjA0NywwLjg1My00LjY0NiwzLjc4MS00LjY3MiAgICAgYzkuOTQ1LTAuMDcyLDE5LjktMC4xMTcsMjkuODU1LTAuMDU1YzMuMTA4LDAuMDE5LDQuMTA1LDEuNTQ2LDQuMDQzLDQuODM0Yy0zLjI4LDE3MS44NjEtMC41OTQsMTU5Ljg2Ny0wLjU5NCwxODguOTc1ICAgICBjNy45NywwLjMxNSwxNS4xMTIsMC44NjQsMTUuODk1LDEuNjU1QzM0Ni4yMTMsMzY2LjAwNCwzMTMuNDIsMzk4LjE1LDMwOS44NjIsMzk4LjE1TDMwOS44NjIsMzk4LjE1eiIgc3R5bGU9ImZpbGw6IzAwQjc2MDsiLz48L2c+PC9nPjwvZz48ZyBpZD0iTGF5ZXJfMSIvPjwvc3ZnPg=="/>
  </a></div>

  <div><a href="https://github.com/alansferreira">
  <img class="social" src="data:image/png;base64,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"/>
  </a></div>

  <div><a href="https://www.linkedin.com/in/alansferreira/">
  <img class="social" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGhlaWdodD0iMTAwJSIgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoyOyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgd2lkdGg9IjEwMCUiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6c2VyaWY9Imh0dHA6Ly93d3cuc2VyaWYuY29tLyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnIGlkPSJnNTg5MSI+PHBhdGggZD0iTTUxMiw2NGMwLC0zNS4zMjMgLTI4LjY3NywtNjQgLTY0LC02NGwtMzg0LDBjLTM1LjMyMywwIC02NCwyOC42NzcgLTY0LDY0bDAsMzg0YzAsMzUuMzIzIDI4LjY3Nyw2NCA2NCw2NGwzODQsMGMzNS4zMjMsMCA2NCwtMjguNjc3IDY0LC02NGwwLC0zODRaIiBpZD0iYmFja2dyb3VuZCIgc3R5bGU9ImZpbGw6IzI4NjdiMjsiLz48ZyBpZD0ic2hhcGVzIj48cmVjdCBoZWlnaHQ9IjI1Ny45NjIiIGlkPSJyZWN0MTEiIHN0eWxlPSJmaWxsOiNmZmY7IiB3aWR0aD0iODUuNzYiIHg9IjYxLjA1MyIgeT0iMTc4LjY2NyIvPjxwYXRoIGQ9Ik0xMDQuNTEyLDU0LjI4Yy0yOS4zNDEsMCAtNDguNTEyLDE5LjI5IC00OC41MTIsNDQuNTczYzAsMjQuNzUyIDE4LjU4OCw0NC41NzQgNDcuMzc3LDQ0LjU3NGwwLjU1NCwwYzI5LjkwMywwIDQ4LjUxNiwtMTkuODIyIDQ4LjUxNiwtNDQuNTc0Yy0wLjU1NSwtMjUuMjgzIC0xOC42MTEsLTQ0LjU3MyAtNDcuOTM1LC00NC41NzNaIiBpZD0icGF0aDEzLTAiIHN0eWxlPSJmaWxsOiNmZmY7ZmlsbC1ydWxlOm5vbnplcm87Ii8+PHBhdGggZD0iTTM1Ny4yNzgsMTcyLjYwMWMtNDUuNDksMCAtNjUuODY2LDI1LjAxNyAtNzcuMjc2LDQyLjU4OWwwLC0zNi41MjNsLTg1LjczOCwwYzEuMTM3LDI0LjE5NyAwLDI1Ny45NjEgMCwyNTcuOTYxbDg1LjczNywwbDAsLTE0NC4wNjRjMCwtNy43MTEgMC41NTQsLTE1LjQyIDIuODI3LC0yMC45MzFjNi4xODgsLTE1LjQgMjAuMzA1LC0zMS4zNTIgNDMuOTkzLC0zMS4zNTJjMzEuMDEyLDAgNDMuNDM2LDIzLjY2NCA0My40MzYsNTguMzI3bDAsMTM4LjAybDg1Ljc0MSwwbDAsLTE0Ny45M2MwLC03OS4yMzcgLTQyLjMwNSwtMTE2LjA5NyAtOTguNzIsLTExNi4wOTdaIiBpZD0icGF0aDE1IiBzdHlsZT0iZmlsbDojZmZmO2ZpbGwtcnVsZTpub256ZXJvOyIvPjwvZz48L2c+PC9zdmc+"/>
  </a></div>
</div>


## Help us

See [CONTRIBUTING.md](https://github.com/alelltech/npm-embeded-hello-world/blob/main/CONTRIBUTING.md)

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
