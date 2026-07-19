import { describe, expect, it } from "vitest";
import { buildFacetsQueries, buildUsersQuery } from "./sql-builder";

const query = {
  q: "Ada",
  nationality: ["Canadian", "French"],
  hobby: ["Chess", "Reading"],
  sortBy: "last_name" as const,
  sortDir: "desc" as const,
  limit: 20,
};

describe("directory SQL builder", () => {
  it("parameterizes filters, uses all-hobby matching, and whitelists ordering", () => {
    const built = buildUsersQuery(query);
    expect(built.text).toContain("u.first_name ILIKE $1");
    expect(built.text).toContain("u.nationality = ANY($2::text[])");
    expect(built.text.match(/EXISTS \(/g)).toHaveLength(2);
    expect(built.text).toContain('ORDER BY u.last_name DESC, u.id DESC');
    expect(built.values).toEqual(["%Ada%", ["Canadian", "French"], "Chess", "Reading", 21]);
    expect(built.text).not.toContain("Ada");
  });

  it("escapes LIKE wildcards in the search pattern", () => {
    const built = buildUsersQuery({ ...query, q: "50%_\\off" });
    expect(built.text).toContain("ILIKE $1 ESCAPE '\\'");
    expect(built.values[0]).toBe("%50\\%\\_\\\\off%");
  });

  it("builds facet queries from the same active filters", () => {
    const [hobbies, nationalities] = buildFacetsQueries(query);
    expect(hobbies.text).toContain("COUNT(DISTINCT u.id)");
    expect(hobbies.text).toContain("JOIN user_hobbies facet_hobby");
    expect(hobbies.text.indexOf("JOIN")).toBeLessThan(hobbies.text.indexOf("WHERE"));
    expect(nationalities.text).toContain("u.nationality");
    expect(hobbies.values).toEqual(nationalities.values);
  });
});
