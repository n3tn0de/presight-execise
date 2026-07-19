import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserCard } from "./UserCard";

describe("UserCard", () => {
  it("shows two hobbies and the remaining count", () => {
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
    expect(screen.getByText("+1")).toBeInTheDocument();
    expect(screen.queryByText("Reading")).not.toBeInTheDocument();
  });
});
