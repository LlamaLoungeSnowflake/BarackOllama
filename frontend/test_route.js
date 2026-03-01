const { POST } = require('./.next/server/app/api/copilotkit/route.js');
async function test() {
  try {
    const req = {
      method: 'POST',
      headers: { get: () => 'application/json' },
      json: async () => ({ query: '{ hello }' })
    };
    const res = await POST(req);
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch (err) {
    console.error("Caught error:", err);
  }
}
test();
