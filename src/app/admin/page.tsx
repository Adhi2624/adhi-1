"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "@/components/navbar";

type Tab = "overview" | "users" | "analytics" | "config";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  tier: "free" | "pro" | "team";
  emailVerified: boolean;
  createdAt: string;
  resumeCount: number;
}

interface Stats {
  totalUsers: number;
  totalResumes: number;
  admins: number;
  recentUsers: number;
}

interface McpCallLog {
  id: string;
  userId: string;
  method: string;
  toolName: string | null;
  timestamp: string;
}

interface Analytics {
  totalUsers: number;
  totalResumes: number;
  mcpCallsLastHour: number;
  mcpCallsLast24h: number;
  mcpCallsLast7d: number;
  mcpCallsTotal: number;
  topMcpUsers: { userId: string; email?: string; count: number }[];
  recentMcpCalls: McpCallLog[];
  tierDistribution: Record<string, number>;
}

interface TierLimits {
  maxResumes: number;
  mcpAccess: boolean;
  maxMcpCallsPerHour: number;
  maxMcpCallsPerDay: number;
  customTemplates: boolean;
  versionHistory: boolean;
  collaboration: boolean;
}

interface ConfigData {
  tierLimits: Record<string, TierLimits>;
  rateLimits: Record<string, { maxPerWindow: number; windowMinutes: number }>;
}

interface UserDetail {
  userId: string;
  email: string;
  name: string;
  tier: string;
  role: string;
  resumeCount: number;
  mcpCallsLastHour: number;
  mcpCallsLast24h: number;
  mcpCallsTotal: number;
  recentMcpCalls: McpCallLog[];
  mcpConnected: boolean;
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    free: "bg-neutral-800 text-neutral-400",
    pro: "bg-blue-500/10 text-blue-400",
    team: "bg-violet-500/10 text-violet-400",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colors[tier] || colors.free}`}>
      {tier}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${
        role === "admin"
          ? "bg-amber-500/10 text-amber-400"
          : "bg-neutral-800 text-neutral-400"
      }`}
    >
      {role}
    </span>
  );
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [configData, setConfigData] = useState<ConfigData | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [savingConfig, setSavingConfig] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [usersRes, statsRes] = await Promise.all([
      fetch("/api/admin/users"),
      fetch("/api/admin/stats"),
    ]);
    if (usersRes.ok) setUsers(await usersRes.json());
    if (statsRes.ok) setStats(await statsRes.json());
    setLoading(false);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    const res = await fetch("/api/admin/analytics");
    if (res.ok) setAnalytics(await res.json());
  }, []);

  const fetchConfig = useCallback(async () => {
    const res = await fetch("/api/admin/config");
    if (res.ok) setConfigData(await res.json());
  }, []);

  const hasFetched = useRef(false);
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchData();
    }
  });

  function switchTab(newTab: Tab) {
    setTab(newTab);
    setSelectedUser(null);
    if (newTab === "analytics" && !analytics) fetchAnalytics();
    if (newTab === "config" && !configData) fetchConfig();
  }

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: newRole as "user" | "admin" } : u
        )
      );
    }
  }

  async function changeTier(userId: string, tier: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, tier: tier as "free" | "pro" | "team" } : u
        )
      );
    }
  }

  async function deleteUser(userId: string) {
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (stats) {
        setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
      }
    }
  }

  async function viewUser(userId: string) {
    const res = await fetch(`/api/admin/users/${userId}`);
    if (res.ok) {
      setSelectedUser(await res.json());
    }
  }

  async function saveConfig(data: ConfigData) {
    setSavingConfig(true);
    await fetch("/api/admin/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSavingConfig(false);
    fetchConfig();
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "users", label: "Users" },
    { key: "analytics", label: "Analytics" },
    { key: "config", label: "Config" },
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Manage users, analytics, and platform configuration
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-900 border border-neutral-800">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => switchTab(t.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tab === t.key
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-neutral-900 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* User detail modal */}
            {selectedUser && (
              <div className="mb-8 p-6 rounded-xl border border-neutral-800 bg-neutral-900/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {selectedUser.name[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{selectedUser.name}</p>
                      <p className="text-xs text-neutral-500">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-neutral-500 hover:text-white text-sm"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <StatCard label="Resumes" value={selectedUser.resumeCount} color="text-green-400" />
                  <StatCard label="MCP Calls (1h)" value={selectedUser.mcpCallsLastHour} color="text-blue-400" />
                  <StatCard label="MCP Calls (24h)" value={selectedUser.mcpCallsLast24h} color="text-violet-400" />
                  <StatCard label="MCP Total" value={selectedUser.mcpCallsTotal} color="text-amber-400" />
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">Tier:</span>
                    <TierBadge tier={selectedUser.tier} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">Role:</span>
                    <RoleBadge role={selectedUser.role} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${selectedUser.mcpConnected ? "bg-green-400" : "bg-neutral-600"}`} />
                    <span className="text-xs text-neutral-500">
                      MCP {selectedUser.mcpConnected ? "Connected" : "Never connected"}
                    </span>
                  </div>
                </div>

                {selectedUser.recentMcpCalls.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-white mb-3">Recent MCP Calls</h3>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {selectedUser.recentMcpCalls.slice(0, 10).map((call) => (
                        <div key={call.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-900 text-xs">
                          <span className="text-neutral-300">{call.toolName || call.method}</span>
                          <span className="text-neutral-600">{new Date(call.timestamp).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Overview tab */}
            {tab === "overview" && stats && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard label="Total Users" value={stats.totalUsers} color="text-blue-400" />
                  <StatCard label="Total Resumes" value={stats.totalResumes} color="text-green-400" />
                  <StatCard label="Admins" value={stats.admins} color="text-amber-400" />
                  <StatCard label="New This Week" value={stats.recentUsers} color="text-violet-400" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Recent Signups</h2>
                  <div className="space-y-2">
                    {users.slice(0, 5).map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 cursor-pointer hover:bg-neutral-900 transition-colors"
                        onClick={() => viewUser(user.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">{user.name[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{user.name}</p>
                            <p className="text-xs text-neutral-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <TierBadge tier={user.tier} />
                          <span className="text-xs text-neutral-500">
                            {user.resumeCount} resume{user.resumeCount !== 1 ? "s" : ""}
                          </span>
                          <RoleBadge role={user.role} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">MCP Server</h2>
                  <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-sm text-green-400">Online</span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Endpoint: <code className="text-blue-400">/api/mcp</code>
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Transport: Streamable HTTP | Protocol: 2024-11-05
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Tools available: 8 | Resources: 1
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Users tab */}
            {tab === "users" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-neutral-400">
                    {users.length} user{users.length !== 1 ? "s" : ""} total
                  </p>
                  <button
                    onClick={fetchData}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Refresh
                  </button>
                </div>

                <div className="rounded-xl border border-neutral-800 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-900 border-b border-neutral-800">
                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">User</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 hidden sm:table-cell">Joined</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">Role</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">Tier</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">Resumes</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-neutral-900/50 transition-colors">
                          <td className="px-4 py-3">
                            <button
                              onClick={() => viewUser(user.id)}
                              className="flex items-center gap-3 text-left"
                            >
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shrink-0">
                                <span className="text-white text-xs font-medium">{user.name[0].toUpperCase()}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                              </div>
                            </button>
                          </td>
                          <td className="px-4 py-3 text-xs text-neutral-500 hidden sm:table-cell">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <RoleBadge role={user.role} />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={user.tier}
                              onChange={(e) => changeTier(user.id, e.target.value)}
                              className="bg-neutral-800 text-xs text-neutral-300 rounded-md px-2 py-1 border border-neutral-700 focus:border-blue-500 focus:outline-none"
                            >
                              <option value="free">Free</option>
                              <option value="pro">Pro</option>
                              <option value="team">Team</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-400">{user.resumeCount}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => viewUser(user.id)}
                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                Details
                              </button>
                              <button
                                onClick={() => toggleRole(user.id, user.role)}
                                className="text-xs text-neutral-400 hover:text-white transition-colors"
                              >
                                {user.role === "admin" ? "Demote" : "Promote"}
                              </button>
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Analytics tab */}
            {tab === "analytics" && (
              <div className="space-y-8">
                {!analytics ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-24 rounded-xl bg-neutral-900 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <StatCard label="MCP Calls (1h)" value={analytics.mcpCallsLastHour} color="text-blue-400" />
                      <StatCard label="MCP Calls (24h)" value={analytics.mcpCallsLast24h} color="text-green-400" />
                      <StatCard label="MCP Calls (7d)" value={analytics.mcpCallsLast7d} color="text-violet-400" />
                      <StatCard label="MCP Calls (Total)" value={analytics.mcpCallsTotal} color="text-amber-400" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h2 className="text-lg font-semibold text-white mb-4">Tier Distribution</h2>
                        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-3">
                          {Object.entries(analytics.tierDistribution).map(([tier, count]) => (
                            <div key={tier} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <TierBadge tier={tier} />
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-32 h-2 bg-neutral-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${analytics.totalUsers > 0 ? (count / analytics.totalUsers) * 100 : 0}%` }}
                                  />
                                </div>
                                <span className="text-sm text-neutral-400 w-8 text-right">{count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold text-white mb-4">Top MCP Users (7d)</h2>
                        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-2">
                          {analytics.topMcpUsers.length === 0 ? (
                            <p className="text-xs text-neutral-500">No MCP activity yet</p>
                          ) : (
                            analytics.topMcpUsers.map((u, i) => (
                              <div key={u.userId} className="flex items-center justify-between py-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-neutral-600 w-4">{i + 1}.</span>
                                  <button
                                    onClick={() => viewUser(u.userId)}
                                    className="text-xs text-blue-400 hover:text-blue-300 truncate max-w-[200px]"
                                  >
                                    {u.email || u.userId.slice(0, 8)}
                                  </button>
                                </div>
                                <span className="text-xs text-neutral-400">{u.count} calls</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-white mb-4">Recent MCP Calls</h2>
                      <div className="rounded-xl border border-neutral-800 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-neutral-900 border-b border-neutral-800">
                              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">Tool</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 hidden sm:table-cell">Method</th>
                              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">User</th>
                              <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500">Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800">
                            {analytics.recentMcpCalls.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-xs text-neutral-500">
                                  No MCP calls recorded yet
                                </td>
                              </tr>
                            ) : (
                              analytics.recentMcpCalls.map((call) => (
                                <tr key={call.id} className="hover:bg-neutral-900/50">
                                  <td className="px-4 py-3 text-xs text-neutral-300">{call.toolName || "-"}</td>
                                  <td className="px-4 py-3 text-xs text-neutral-500 hidden sm:table-cell">{call.method}</td>
                                  <td className="px-4 py-3">
                                    <button
                                      onClick={() => viewUser(call.userId)}
                                      className="text-xs text-blue-400 hover:text-blue-300"
                                    >
                                      {call.userId.slice(0, 8)}...
                                    </button>
                                  </td>
                                  <td className="px-4 py-3 text-xs text-neutral-500 text-right">
                                    {new Date(call.timestamp).toLocaleString()}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Config tab */}
            {tab === "config" && (
              <div className="space-y-8">
                {!configData ? (
                  <div className="h-48 rounded-xl bg-neutral-900 animate-pulse" />
                ) : (
                  <ConfigEditor data={configData} onSave={saveConfig} saving={savingConfig} />
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function ConfigEditor({ data, onSave, saving }: { data: ConfigData; onSave: (d: ConfigData) => void; saving: boolean }) {
  const [tierLimits, setTierLimits] = useState(data.tierLimits);
  const [rateLimits, setRateLimits] = useState(data.rateLimits);
  const [prevData, setPrevData] = useState(data);

  if (data !== prevData) {
    setPrevData(data);
    setTierLimits(data.tierLimits);
    setRateLimits(data.rateLimits);
  }

  function updateTierField(tier: string, field: string, value: number | boolean) {
    setTierLimits((prev) => ({
      ...prev,
      [tier]: { ...prev[tier], [field]: value },
    }));
  }

  function updateRateField(type: string, field: string, value: number) {
    setRateLimits((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Tier Limits</h2>
          <button
            onClick={() => onSave({ tierLimits, rateLimits })}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {(["free", "pro", "team"] as const).map((tier) => (
            <div key={tier} className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50">
              <div className="flex items-center gap-2 mb-4">
                <TierBadge tier={tier} />
                <span className="text-sm font-medium text-white capitalize">{tier}</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-500 block mb-1">Max Resumes (-1 = unlimited)</label>
                  <input
                    type="number"
                    value={tierLimits[tier]?.maxResumes ?? 0}
                    onChange={(e) => updateTierField(tier, "maxResumes", parseInt(e.target.value))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-neutral-500">MCP Access</label>
                  <button
                    onClick={() => updateTierField(tier, "mcpAccess", !tierLimits[tier]?.mcpAccess)}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      tierLimits[tier]?.mcpAccess ? "bg-green-500" : "bg-neutral-700"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        tierLimits[tier]?.mcpAccess ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 block mb-1">MCP Calls / Hour</label>
                  <input
                    type="number"
                    value={tierLimits[tier]?.maxMcpCallsPerHour ?? 0}
                    onChange={(e) => updateTierField(tier, "maxMcpCallsPerHour", parseInt(e.target.value))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 block mb-1">MCP Calls / Day</label>
                  <input
                    type="number"
                    value={tierLimits[tier]?.maxMcpCallsPerDay ?? 0}
                    onChange={(e) => updateTierField(tier, "maxMcpCallsPerDay", parseInt(e.target.value))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-neutral-500">Custom Templates</label>
                  <button
                    onClick={() => updateTierField(tier, "customTemplates", !tierLimits[tier]?.customTemplates)}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      tierLimits[tier]?.customTemplates ? "bg-green-500" : "bg-neutral-700"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        tierLimits[tier]?.customTemplates ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-neutral-500">Version History</label>
                  <button
                    onClick={() => updateTierField(tier, "versionHistory", !tierLimits[tier]?.versionHistory)}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      tierLimits[tier]?.versionHistory ? "bg-green-500" : "bg-neutral-700"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        tierLimits[tier]?.versionHistory ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-neutral-500">Collaboration</label>
                  <button
                    onClick={() => updateTierField(tier, "collaboration", !tierLimits[tier]?.collaboration)}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      tierLimits[tier]?.collaboration ? "bg-green-500" : "bg-neutral-700"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        tierLimits[tier]?.collaboration ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Email Rate Limits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(rateLimits).map(([type, config]) => (
            <div key={type} className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50">
              <h3 className="text-sm font-medium text-white capitalize mb-3">{type.replace("-", " ")}</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-500 block mb-1">Max per Window</label>
                  <input
                    type="number"
                    value={config.maxPerWindow}
                    onChange={(e) => updateRateField(type, "maxPerWindow", parseInt(e.target.value))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 block mb-1">Window (minutes)</label>
                  <input
                    type="number"
                    value={config.windowMinutes}
                    onChange={(e) => updateRateField(type, "windowMinutes", parseInt(e.target.value))}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
