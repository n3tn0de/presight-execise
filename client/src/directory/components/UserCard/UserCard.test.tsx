import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { UserCard } from "./UserCard";

afterEach(cleanup);

describe("UserCard", () => {
  it("shows two hobbies and a clickable remaining count", () => {
    render(
      <UserCard
        user={{
          id: "1",
          avatar: "avatar.jpg",
          firstName: "Ada",
          lastName: "Lovelace",
          age: 36,
          nationality: "British",
          hobbies: ["Chess", "Skiing", "Reading"],
        }}
      />,
    );

    expect(screen.getByText("Chess")).toBeInTheDocument();
    expect(screen.getByText("Skiing")).toBeInTheDocument();
    const moreButton = screen.getByRole("button", {
      name: "Show 1 more hobbies",
    });
    expect(moreButton).toHaveAttribute("title", "Reading");

    fireEvent.click(moreButton);
    expect(screen.getByRole("tooltip")).toHaveTextContent("Reading");
  });
});
