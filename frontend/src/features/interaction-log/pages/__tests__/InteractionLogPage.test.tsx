import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import theme from "../../../../theme/theme";
import InteractionLogPage from "../InteractionLogPage";
import InteractionAPIClient from "../../../../APIClients/InteractionAPIClient";

jest.mock("../../../../APIClients/InteractionAPIClient");
jest.setTimeout(40000);

class MockResizeObserver {
  // eslint-disable-next-line class-methods-use-this
  observe() {}

  // eslint-disable-next-line class-methods-use-this
  unobserve() {}

  // eslint-disable-next-line class-methods-use-this
  disconnect() {}
}
global.ResizeObserver = global.ResizeObserver || MockResizeObserver;

const mockInteractions = [
  {
    id: 1,
    shortDescription: "Assigned a task to Aaron",
    longDescription: "Erin assigned the task Walk to Aaron.",
    createdAt: "2025-02-13T12:00:00.000Z",
    interactionType: "Assigned Task",
    actor: {
      id: 1,
      firstName: "Erin",
      lastName: "Hi",
      role: "Administrator",
      profilePhoto: null,
    },
  },
  {
    id: 2,
    shortDescription: "Completed a walk",
    longDescription: "Volunteer completed a walk task.",
    createdAt: "2025-03-01T12:00:00.000Z",
    interactionType: "Completed Task",
    actor: {
      id: 3,
      firstName: "Sam",
      lastName: "Volunteer",
      role: "Volunteer",
      profilePhoto: null,
    },
  },
];

const renderPage = () =>
  render(
    <ChakraProvider theme={theme}>
      <InteractionLogPage />
    </ChakraProvider>,
  );

describe("InteractionLogPage filters", () => {
  beforeEach(() => {
    (InteractionAPIClient.getInteractions as jest.Mock).mockResolvedValue(
      mockInteractions,
    );
  });

  it("renders Interaction, Animal Tag, Role, and Date chips (no Task Category)", async () => {
    renderPage();
    await waitFor(() => screen.getByText("Assigned a task to Aaron"));

    expect(screen.getAllByText("Interaction").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Animal Tag").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Role").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Date").length).toBeGreaterThan(0);
    expect(screen.queryByText("Task Category")).not.toBeInTheDocument();
  });

  it("filters logs by Role", async () => {
    renderPage();
    await waitFor(() => screen.getByText("Assigned a task to Aaron"));

    userEvent.click(screen.getAllByText("Role")[0]);
    const popover = await screen.findByText("Filter by Role");
    const popoverBody = popover.closest('[role="dialog"]') as HTMLElement;
    const volunteerRow = within(popoverBody)
      .getByText("Volunteer")
      .closest("div") as HTMLElement;
    userEvent.click(
      within(volunteerRow).getByRole("checkbox", { hidden: true }),
    );

    await waitFor(() => {
      expect(
        screen.queryByText("Assigned a task to Aaron"),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Completed a walk")).toBeVisible();
    });
  });

  it("filters logs by Date", async () => {
    const now = new Date();
    const target = new Date(2025, 1, 1);
    const monthsFromNow =
      (now.getFullYear() - target.getFullYear()) * 12 +
      (now.getMonth() - target.getMonth());

    renderPage();
    await waitFor(() => screen.getByText("Assigned a task to Aaron"));

    userEvent.click(screen.getAllByText("Date")[0]);
    const popover = await screen.findByText("Filter by Date");
    const popoverBody = popover.closest('[role="dialog"]') as HTMLElement;

    const navLabel = monthsFromNow >= 0 ? "Previous month" : "Next month";
    for (let i = 0; i < Math.abs(monthsFromNow); i += 1) {
      userEvent.click(within(popoverBody).getByLabelText(navLabel));
    }

    userEvent.click(within(popoverBody).getByText("13"));

    await waitFor(() => {
      expect(screen.getByText("Assigned a task to Aaron")).toBeVisible();
      expect(screen.queryByText("Completed a walk")).not.toBeInTheDocument();
    });
  });

  it("filters logs by Role via the mobile combined Filter panel", async () => {
    renderPage();
    await waitFor(() => screen.getByText("Assigned a task to Aaron"));

    userEvent.click(screen.getByText("Filter"));

    const closeIcon = await screen.findByAltText("Close");
    const panel = closeIcon.closest("button")?.parentElement
      ?.parentElement as HTMLElement;
    const volunteerRow = within(panel)
      .getByText("Volunteer")
      .closest("div") as HTMLElement;
    userEvent.click(
      within(volunteerRow).getByRole("checkbox", { hidden: true }),
    );

    await waitFor(() => {
      expect(
        screen.queryByText("Assigned a task to Aaron"),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Completed a walk")).toBeVisible();
    });
  });
});
