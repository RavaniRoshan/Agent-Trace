# AgentTrace

Visual debugger for AI agent loops. Step-by-step. Locally. Zero config.

## Quick Start
```bash
npx @ravaniroshan/agentrace
```

Opens the trace viewer at http://localhost:7823

## Full Setup

Install the Python tracer in your agent project:
```bash
pip install agentrace
```

Add decorators to your agent:
```python
from agentrace import trace, trace_llm, trace_tool

@trace(name="my_agent")
def run_agent(task: str):
    ...

@trace_llm
def call_llm(messages):
    return ollama.chat(model="qwen2.5:7b", messages=messages)

@trace_tool
def web_search(query: str) -> str:
    ...
```

View traces from any terminal:
```bash
npx @ravaniroshan/agentrace
```

## Commands
```bash
npx @ravaniroshan/agentrace              # start UI viewer (default)
npx @ravaniroshan/agentrace ui           # start UI viewer
npx @ravaniroshan/agentrace traces       # list all traces in terminal
npx @ravaniroshan/agentrace clear        # delete all traces
npx @ravaniroshan/agentrace --version    # show version
npx @ravaniroshan/agentrace --help       # show help
```

## Global Install
```bash
npm install -g @ravaniroshan/agentrace
agentrace ui
```

## How It Works

The Python library saves trace files to ~/.agentrace/traces/
The npm CLI reads those same files and serves the web viewer.
No configuration needed between the two.

## Requirements
- Node.js 18+
- Python agent instrumented with pip install agentrace

## License
MIT
