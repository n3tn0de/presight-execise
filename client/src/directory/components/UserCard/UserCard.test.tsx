import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { UserCard } from "./UserCard";

afterEach(cleanup);

describe("UserCard", () => {
  it("prioritizes selected hobbies before alphabetizing other hobbies", () => {
    render(
      <UserCard
        user={{
          id: "selected",
          avatar: "avatar.jpg",
          firstName: "Ada",
          lastName: "Lovelace",
          age: 36,
          nationality: "British",
          hobbies: ["Writing", "Chess", "Reading"],
        }}
        selectedHobbies={["Chess"]}
      />,
    );

    const hobbyTags = screen
      .getAllByText(/Chess|Reading|Writing/)
      .map((element) => element.textContent);
    expect(hobbyTags.slice(0, 2)).toEqual(["Chess", "Reading"]);
  });

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
    expect(screen.getByText("Reading")).toBeInTheDocument();
    const moreButton = screen.getByRole("button", {
      name: "Show 1 more hobbies",
    });
    expect(moreButton).toHaveAttribute("title", "Skiing");

    fireEvent.click(moreButton);
    expect(screen.getByRole("tooltip")).toHaveTextContent("Skiing");
  });
});
