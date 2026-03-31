/**
 * Integration test script — validates data flow end-to-end without a browser.
 * Runs against the local dev server (default: http://localhost:3000).
 *
 * Usage:
 *   npx tsx scripts/integration-test.ts
 *
 * Requires the dev server running and valid Clerk session cookie.
 * Set TEST_COOKIE env var to your __session cookie value.
 */

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
const COOKIE = process.env.TEST_COOKIE || "";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

async function api(
  path: string,
  options?: RequestInit,
): Promise<{ status: number; data: Record<string, unknown> }> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Cookie: `__session=${COOKIE}`,
      ...options?.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function testProjects() {
  console.log("\n--- Projects API ---");

  const { status, data } = await api("/api/projects");
  assert(status === 200 || status === 401, `GET /api/projects → ${status}`);

  if (status === 401) {
    console.log("  ⚠ Skipping authenticated tests (no valid session)");
    return null;
  }

  assert(Array.isArray(data.projects), "Returns projects array");

  // Create a test project
  const { status: createStatus, data: createData } = await api(
    "/api/projects",
    {
      method: "POST",
      body: JSON.stringify({
        name: `Integration Test ${Date.now()}`,
        domain: "defi",
        thesis: "Test project for integration checks",
      }),
    },
  );
  assert(createStatus === 200, `POST /api/projects → ${createStatus}`);
  const projectId = (createData.project as Record<string, unknown>)
    ?.id as string;
  assert(!!projectId, `Created project with id: ${projectId}`);

  return projectId;
}

async function testChat(projectId: string) {
  console.log("\n--- Chat API ---");

  // Load messages
  const { status } = await api(
    `/api/chat?projectId=${projectId}&stageKey=ideation`,
  );
  assert(status === 200, `GET /api/chat → ${status}`);
}

async function testHealthScore(projectId: string) {
  console.log("\n--- Health Score API ---");

  const { status, data } = await api(
    `/api/health-score?projectId=${projectId}`,
  );
  assert(status === 200, `GET /api/health-score → ${status}`);
  assert(typeof data.total === "number", `Health score total: ${data.total}`);
  assert(typeof data.grade === "string", `Grade: ${data.grade}`);
}

async function testShareLinks(projectId: string) {
  console.log("\n--- Share API ---");

  // Create share link
  const { status: createStatus, data: createData } = await api("/api/share", {
    method: "POST",
    body: JSON.stringify({
      projectId,
      label: "integration-test",
    }),
  });
  assert(createStatus === 200, `POST /api/share → ${createStatus}`);
  const token = createData.token as string;
  assert(!!token, `Share token: ${token}`);

  // List share links
  const { status: listStatus, data: listData } = await api(
    `/api/share?projectId=${projectId}`,
  );
  assert(listStatus === 200, `GET /api/share → ${listStatus}`);
  assert(
    Array.isArray(listData.links) && (listData.links as unknown[]).length > 0,
    `Has share links`,
  );

  // Fetch public share
  if (token) {
    const publicRes = await fetch(`${BASE}/api/share/${token}`);
    assert(
      publicRes.status === 200,
      `GET /api/share/[token] → ${publicRes.status}`,
    );

    // Revoke
    const { status: revokeStatus } = await api("/api/share", {
      method: "DELETE",
      body: JSON.stringify({ token }),
    });
    assert(revokeStatus === 200, `DELETE /api/share → ${revokeStatus}`);
  }
}

async function testExport() {
  console.log("\n--- Export API ---");

  const { status } = await api("/api/user/export");
  assert(status === 200, `GET /api/user/export → ${status}`);
}

async function cleanup(projectId: string) {
  console.log("\n--- Cleanup ---");
  const { status } = await api(`/api/projects?id=${projectId}`, {
    method: "DELETE",
  });
  // May or may not have delete endpoint
  console.log(`  Cleanup project → ${status}`);
}

async function main() {
  console.log(`\n🧪 Integration Test — ${BASE}`);
  console.log("=".repeat(40));

  if (!COOKIE) {
    console.log(
      "\n⚠ No TEST_COOKIE set. Running unauthenticated tests only.\n",
    );
  }

  const projectId = await testProjects();

  if (projectId) {
    await testChat(projectId);
    await testHealthScore(projectId);
    await testShareLinks(projectId);
    await testExport();
    await cleanup(projectId);
  }

  console.log("\n" + "=".repeat(40));
  console.log(`Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
