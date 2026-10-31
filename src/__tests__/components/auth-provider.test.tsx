import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "@/components/auth-provider";

const mockFetch = vi.fn();
global.fetch = mockFetch;

function TestConsumer() {
  const { user, loading, login, logout, register } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="user">{user ? user.name : "null"}</div>
      <button onClick={() => login("test@test.com", "pass123")}>Login</button>
      <button onClick={() => register("Test", "test@test.com", "pass123")}>Register</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts in loading state and fetches user", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: "1", name: "Alice", email: "a@t.com", role: "user" } }),
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Alice");
    });
  });

  it("sets user to null when not authenticated", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ user: null }),
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("null");
    });
  });

  it("login sets user on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ user: null }),
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("null");
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: "1", name: "Bob", email: "b@t.com", role: "user" } }),
    });

    await act(async () => {
      await userEvent.click(screen.getByText("Login"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Bob");
    });
  });

  it("logout clears user", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: "1", name: "Alice", email: "a@t.com", role: "user" } }),
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Alice");
    });

    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await act(async () => {
      await userEvent.click(screen.getByText("Logout"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("null");
    });
  });

  it("register sets user on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ user: null }),
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("null");
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: "2", name: "Test", email: "test@test.com", role: "user" } }),
    });

    await act(async () => {
      await userEvent.click(screen.getByText("Register"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Test");
    });
  });

  it("login returns error on failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ user: null }),
    });

    let loginResult: { error?: string } = {};

    function ErrorTestConsumer() {
      const { login, loading } = useAuth();
      if (loading) return <div>Loading...</div>;
      return (
        <button onClick={async () => { loginResult = await login("bad@t.com", "wrong"); }}>
          Login
        </button>
      );
    }

    render(
      <AuthProvider>
        <ErrorTestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid credentials" }),
    });

    await act(async () => {
      await userEvent.click(screen.getByText("Login"));
    });

    expect(loginResult.error).toBe("Invalid credentials");
  });
});
