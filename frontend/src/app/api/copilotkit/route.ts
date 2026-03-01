import { CopilotRuntime, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";

class EmptyAdapter {
  constructor() { }
  async process(request: any) {
    return {
      threadId: request?.threadId || Math.random().toString(36).substring(2, 15)
    };
  }
}

const runtime = new CopilotRuntime({
  remoteActions: [
    {
      url: process.env.REMOTE_ACTION_URL || "http://127.0.0.1:8000/copilotkit",
    },
  ],
});

export const { GET, POST, OPTIONS } = copilotRuntimeNextJSAppRouterEndpoint({
  runtime,
  serviceAdapter: new EmptyAdapter() as any,
  endpoint: "/api/copilotkit",
});
