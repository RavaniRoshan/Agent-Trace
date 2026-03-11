# AgentTrace

Visual debugger for AI agent loops. Step-by-step. Locally. Zero config.

AgentTrace helps you see what your agent actually did: every LLM call, every tool call, every error, and the full sequence of steps that led to the final result. The Python package records traces locally as JSON. The npm package opens a local viewer and CLI for inspecting those runs.

## What It Includes

- Python tracing decorators: `@trace`, `@trace_llm`, `@trace_tool`
- Local trace storage at `~/.agentrace/traces/`
- Viewer and CLI package: `@ravaniroshan/agentrace`
- Commands: `ui`, `traces`, `clear`
- Static marketing site in `landing/`

## Quick Start

### 1. Install the Python tracer

```bash
pip install agentrace
```

### 2. Add tracing decorators to your agent

```python
from agentrace import trace, trace_llm, trace_tool
import ollama

@trace(name="research_agent")
def run_agent(task: str):
    response = call_llm([{"role": "user", "content": task}])
    results = web_search(response.message.content)
    return results

@trace_llm
def call_llm(messages):
    return ollama.chat(model="qwen2.5:7b", messages=messages)

@trace_tool
def web_search(query: str) -> str:
    ...
```

### 3. Open the local viewer

```bash
npx @ravaniroshan/agentrace
```

The viewer opens at `http://localhost:7823` and reads traces from `~/.agentrace/traces/`.

## npm Viewer Commands

```bash
npx @ravaniroshan/agentrace              # start UI viewer
npx @ravaniroshan/agentrace ui           # start UI viewer
npx @ravaniroshan/agentrace traces       # list recorded traces in terminal
npx @ravaniroshan/agentrace clear        # delete recorded traces
npx @ravaniroshan/agentrace --version    # show version
npx @ravaniroshan/agentrace --help       # show help
```

Global install also works:

```bash
npm install -g @ravaniroshan/agentrace
agentrace ui
```

## How It Works

1. Your Python agent runs normally.
2. AgentTrace decorators capture run events in-process.
3. Each run is saved as a JSON trace file in `~/.agentrace/traces/`.
4. The npm viewer reads those files and serves a local UI for inspection.

No cloud sync is required. No trace data leaves your machine unless you choose to share it.

## Product Surface

### Python package

The Python side is responsible for instrumentation and trace creation.

Core pieces in this repo include:

- `decorators.py`
- `collector.py`
- `storage.py`
- `server.py`
- `agentrace/`

### npm package

The viewer and CLI live in `agentrace-npm/`.

Important files:

- `agentrace-npm/bin/agentrace.js`
- `agentrace-npm/src/server.js`
- `agentrace-npm/src/commands/ui.js`
- `agentrace-npm/src/commands/traces.js`
- `agentrace-npm/src/commands/clear.js`
- `agentrace-npm/src/ui/index.html`

### Landing page

The current static landing page lives in:

- `landing/index.html`

## Repository Layout

```text
Agent-Trace/
â”œâ”€â”€ agentrace/                Python package
â”œâ”€â”€ agentrace-npm/            npm CLI + local viewer
â”œâ”€â”€ examples/                 sample traced agents
â”œâ”€â”€ landing/                  static landing page
â”œâ”€â”€ decorators.py
â”œâ”€â”€ collector.py
â”œâ”€â”€ storage.py
â””â”€â”€ README.md
```

## Local Development

### Python package

```bash
pip install -e .
```

### npm package

```bash
cd agentrace-npm
npm install
node bin/agentrace.js --help
```

### Landing page

The landing page is currently a static HTML file. You can preview it by opening `landing/index.html` in a browser or by serving the `landing/` folder with any static server.

## Why AgentTrace

- See the exact step where an agent failed
- Inspect LLM prompts and outputs without adding print statements everywhere
- Inspect tool inputs, outputs, and exceptions
- Keep debugging local and lightweight
- Work with existing agent loops instead of replacing them

## Status

Current repo status:

- Python tracing flow is present in this repository
- npm viewer package is set up as `@ravaniroshan/agentrace`
- CLI commands `ui`, `traces`, and `clear` are implemented
- Landing page exists as a static site in `landing/`
- npm publishing workflow and CI workflow are present in `agentrace-npm/.github/workflows/`

## License

MIT