import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import CreateClassModal from "@/components/CreateClassModal";
import { ToastProvider } from "@/components/ui/Toast";

describe("CreateClassModal", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("validates required fields before submit", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ToastProvider>
        <CreateClassModal />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText(/New Class/i));
    fireEvent.click(screen.getByRole("button", { name: /Create Class/i }));

    expect(await screen.findAllByText(/harus/i)).toHaveLength(2);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
