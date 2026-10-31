import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

let mockUser: { id: string; name: string; email: string; role: string } | null = null;
const mockLogout = vi.fn();

vi.mock("@/components/auth-provider", () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    logout: mockLogout,
  }),
}));

import Navbar from "@/components/navbar";

describe("Navbar", () => {
  beforeEach(() => {
    mockUser = null;
    vi.clearAllMocks();
  });

  it("renders brand link", () => {
    render(<Navbar />);
    expect(screen.getByText("Typeset")).toBeInTheDocument();
  });

  it("shows login and register for unauthenticated users", () => {
    mockUser = null;
    render(<Navbar />);
    const loginLinks = screen.getAllByText(/Log in/i);
    expect(loginLinks.length).toBeGreaterThan(0);
  });

  it("shows dashboard link for authenticated users", () => {
    mockUser = { id: "1", name: "Test", email: "t@t.com", role: "user" };
    render(<Navbar />);
    const dashLinks = screen.getAllByText(/Dashboard/i);
    expect(dashLinks.length).toBeGreaterThan(0);
  });

  it("shows admin link for admin users", () => {
    mockUser = { id: "1", name: "Admin", email: "a@t.com", role: "admin" };
    render(<Navbar />);
    const adminLinks = screen.getAllByText(/Admin/i);
    expect(adminLinks.length).toBeGreaterThan(0);
  });
});
