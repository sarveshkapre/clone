import { MissionControl } from "@/components/mission-control";

export const dynamic = "force-dynamic";

async function loadStatus() {
  const baseUrl = process.env.CLONE_V2_API_BASE_URL?.trim() || "http://127.0.0.1:8787";
  try {
    const response = await fetch(`${baseUrl}/api/v1/system/status`, { cache: "no-store" });
    if (!response.ok) {
      return { active: false, runState: `unreachable (${response.status})` };
    }
    const payload = await response.json();
    return {
      active: Boolean(payload.active),
      runState: String(payload.run_state || "unknown"),
    };
  } catch {
    return { active: false, runState: "unreachable" };
  }
}

export default async function HomePage() {
  const status = await loadStatus();
  return (
    <main>
      <MissionControl status={status} />
    </main>
  );
}
