const { CopilotRuntime, OpenAIAdapter } = require('@copilotkit/runtime');

class EmptyAdapter {
  constructor() {}
  async *getResponse(forwardedProps) {
    yield { content: "" };
  }
}

const runtime = new CopilotRuntime({
  remoteActions: [
    { url: "http://127.0.0.1:8000/copilotkit" }
  ]
});

console.log("Empty adapter created:", new EmptyAdapter());
