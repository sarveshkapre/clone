import { SystemStatusSchema, type SystemStatus } from "@clone/contracts";

export async function loadSystemStatus(baseUrl: string): Promise<SystemStatus> {
  const response = await fetch(`${baseUrl}/api/v1/system/status`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`status request failed with ${response.status}`);
  }
  const payload = await response.json();
  return SystemStatusSchema.parse(payload);
}
