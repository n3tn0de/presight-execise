import { describe, expect, it } from "vitest";
import { generateSeedData } from "./seed-data.js";

describe("generateSeedData", () => {
  it("generates exactly 10,000 deterministic users", () => {
    const first = generateSeedData();
    const second = generateSeedData();

    expect(first).toEqual(second);
    expect(first.users).toHaveLength(10_000);
    expect(first.users[0]).toEqual({
      avatar: "https://i.pravatar.cc/150?img=1",
      firstName: "Ada",
      lastName: "Smith",
      age: 18,
      nationality: "Canadian",
      hobbies: [],
    });
  });

  it("keeps ages in range and assigns zero through ten hobbies", () => {
    const data = generateSeedData();
    const counts = new Set(data.users.map((user) => user.hobbies.length));

    expect(Math.min(...data.users.map((user) => user.age))).toBe(18);
    expect(Math.max(...data.users.map((user) => user.age))).toBe(100);
    expect(counts).toEqual(new Set(Array.from({ length: 11 }, (_, index) => index)));
    expect(data.hobbies).toEqual([...new Set(data.users.flatMap((user) => user.hobbies))]);
  });
});
