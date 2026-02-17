import { z } from "zod";

export const RunStateSchema = z.enum([
  "stopped",
  "starting",
  "running",
  "stopping",
  "failed",
  "finished",
]);

export const SystemStatusSchema = z.object({
  active: z.boolean(),
  run_state: RunStateSchema,
  run_state_raw: z.string().default("unknown"),
  run_id: z.string().default(""),
  run_pid: z.number().int().nonnegative().default(0),
  updated_at: z.string().datetime().optional(),
});

export const RunCreateInputSchema = z.object({
  repos: z.array(
    z.object({
      name: z.string().min(1),
      path: z.string().min(1),
      branch: z.string().default("main"),
      tasks_per_repo: z.number().int().min(0).max(1000).optional(),
    }),
  ),
  parallel_repos: z.number().int().min(1).max(64).default(5),
  max_cycles: z.number().int().min(1).max(10000).default(30),
  tasks_per_repo: z.number().int().min(0).max(1000).default(0),
  preset_id: z.string().optional(),
});

export const RunSummarySchema = z.object({
  id: z.string().min(1),
  state: RunStateSchema,
  started_at: z.string(),
  ended_at: z.string().optional(),
  repo_count: z.number().int().nonnegative(),
  repos_changed: z.number().int().nonnegative().default(0),
  repos_no_change: z.number().int().nonnegative().default(0),
});

export const RunEventSchema = z.object({
  topic: z.string().min(1),
  type: z.string().min(1),
  ts: z.string(),
  cursor: z.string().min(1),
  payload: z.record(z.any()),
});

export const TaskQueueItemSchema = z.object({
  id: z.string().min(1),
  repo: z.string().default("*"),
  title: z.string().min(1),
  details: z.string().default(""),
  status: z.enum(["QUEUED", "CLAIMED", "DONE", "BLOCKED", "CANCELED"]).default("QUEUED"),
  priority: z.number().int().min(1).max(5).default(3),
  is_interrupt: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
});

export const LaunchPresetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  code_root: z.string().min(1),
  mode: z.enum(["auto", "custom"]).default("auto"),
  parallel_repos: z.number().int().min(1).max(64).default(5),
  max_cycles: z.number().int().min(1).max(10000).default(30),
  tasks_per_repo: z.number().int().min(0).max(1000).default(0),
  selected_repos: z
    .array(
      z.object({
        name: z.string().min(1),
        path: z.string().min(1),
        branch: z.string().default("main"),
      }),
    )
    .default([]),
  created_at: z.string(),
  updated_at: z.string(),
});

export type SystemStatus = z.infer<typeof SystemStatusSchema>;
export type RunCreateInput = z.infer<typeof RunCreateInputSchema>;
export type RunSummary = z.infer<typeof RunSummarySchema>;
export type RunEvent = z.infer<typeof RunEventSchema>;
export type TaskQueueItem = z.infer<typeof TaskQueueItemSchema>;
export type LaunchPreset = z.infer<typeof LaunchPresetSchema>;
