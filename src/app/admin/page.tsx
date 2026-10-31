"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/navbar";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  resumeCount: number;
}

interface Stats {
  totalUsers: number;
  totalResumes: number;
  admins: number;
  recentUsers: number;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "users">("overview");

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const res = await fetch(`/api/admin/users`, {
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

  async function deleteUser(userId: string) {
    const res = await fetch(`/api/admin/users`, {
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

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Manage users and monitor platform activity
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => setTab("overview")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === "overview"
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setTab("users")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === "users"
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Users
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-neutral-900 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            {tab === "overview" && stats && (
              <div className="space-y-8">
                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Total Users",
                      value: stats.totalUsers,
                      color: "text-blue-400",
                    },
                    {
                      label: "Total Resumes",
                      value: stats.totalResumes,
                      color: "text-green-400",
                    },
                    {
                      label: "Admins",
                      value: stats.admins,
                      color: "text-amber-400",
                    },
                    {
                      label: "New This Week",
                      value: stats.recentUsers,
                      color: "text-violet-400",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50"
                    >
                      <p className="text-xs text-neutral-500">{stat.label}</p>
                      <p className={`mt-2 text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Recent users */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Recent Signups
                  </h2>
                  <div className="space-y-2">
                    {users.slice(0, 5).map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-neutral-800 bg-neutral-900/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {user.name[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {user.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-neutral-500">
                            {user.resumeCount} resume
                            {user.resumeCount !== 1 ? "s" : ""}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              user.role === "admin"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-neutral-800 text-neutral-400"
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MCP stats */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">
                    MCP Server
                  </h2>
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
                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">
                          User
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 hidden sm:table-cell">
                          Joined
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">
                          Role
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500">
                          Resumes
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-neutral-900/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shrink-0">
                                <span className="text-white text-xs font-medium">
                                  {user.name[0].toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-neutral-500 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-neutral-500 hidden sm:table-cell">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                user.role === "admin"
                                  ? "bg-amber-500/10 text-amber-400"
                                  : "bg-neutral-800 text-neutral-400"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-400">
                            {user.resumeCount}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => toggleRole(user.id, user.role)}
                                className="text-xs text-neutral-400 hover:text-white transition-colors"
                              >
                                {user.role === "admin"
                                  ? "Demote"
                                  : "Make Admin"}
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
          </>
        )}
      </main>
    </div>
  );
}
