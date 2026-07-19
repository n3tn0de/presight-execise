import type { DirectoryQuery } from "@presight/shared";
import type { BuiltQuery, DirectoryCursor } from "./types";

const columns = {
  first_name: "u.first_name",
  last_name: "u.last_name",
  age: "u.age",
  nationality: "u.nationality",
} as const;

function filters(
  query: DirectoryQuery,
  values: unknown[],
  alias = "u",
): string {
  const clauses: string[] = [];
  if (query.q) {
    values.push(
      `%${query.q.replace(/[\\%_]/g, (character) => `\\${character}`)}%`,
    );
    clauses.push(
      `(${alias}.first_name ILIKE $${values.length} ESCAPE '\\' OR ${alias}.last_name ILIKE $${values.length} ESCAPE '\\')`,
    );
  }
  if (query.nationality.length) {
    values.push(query.nationality);
    clauses.push(`${alias}.nationality = ANY($${values.length}::text[])`);
  }
  query.hobby.forEach((hobby) => {
    values.push(hobby);
    clauses.push(
      `EXISTS (SELECT 1 FROM user_hobbies filter_hobby WHERE filter_hobby.user_id = ${alias}.id AND filter_hobby.hobby_value = $${values.length})`,
    );
  });
  return clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
}

export function buildUsersQuery(
  query: DirectoryQuery,
  cursor?: DirectoryCursor,
): BuiltQuery {
  const values: unknown[] = [];
  const where = filters(query, values);
  const sort = columns[query.sortBy];
  const direction = query.sortDir === "desc" ? "DESC" : "ASC";
  if (cursor) {
    values.push(cursor.sortValue, cursor.id);
    const op = query.sortDir === "desc" ? "<" : ">";
    const cursorWhere = `(${sort} ${op} $${values.length - 1} OR (${sort} = $${values.length - 1} AND u.id ${op} $${values.length}))`;
    return {
      text: `SELECT u.id, u.avatar, u.first_name, u.last_name, u.age, u.nationality, COALESCE(array_agg(DISTINCT uh.hobby_value ORDER BY uh.hobby_value) FILTER (WHERE uh.hobby_value IS NOT NULL), '{}') AS hobbies FROM users u LEFT JOIN user_hobbies uh ON uh.user_id = u.id ${where ? `${where} AND ${cursorWhere}` : `WHERE ${cursorWhere}`} GROUP BY u.id ORDER BY ${sort} ${direction}, u.id ${direction} LIMIT $${values.length + 1}`,
      values: [...values, query.limit],
    };
  }
  values.push(query.limit + 1);
  return {
    text: `SELECT u.id, u.avatar, u.first_name, u.last_name, u.age, u.nationality, COALESCE(array_agg(DISTINCT uh.hobby_value ORDER BY uh.hobby_value) FILTER (WHERE uh.hobby_value IS NOT NULL), '{}') AS hobbies FROM users u LEFT JOIN user_hobbies uh ON uh.user_id = u.id ${where} GROUP BY u.id ORDER BY ${sort} ${direction}, u.id ${direction} LIMIT $${values.length}`,
    values,
  };
}

function facetBase(
  query: DirectoryQuery,
  values: unknown[],
  join = "",
): string {
  return `FROM users u ${join} ${filters(query, values)}`;
}

export function buildFacetsQueries(
  query: DirectoryQuery,
): [BuiltQuery, BuiltQuery] {
  const hobbyValues: unknown[] = [];
  const hobbyBase = facetBase(
    query,
    hobbyValues,
    "JOIN user_hobbies facet_hobby ON facet_hobby.user_id = u.id",
  );
  const hobbies: BuiltQuery = {
    text: `SELECT facet_hobby.hobby_value AS value, COUNT(DISTINCT u.id)::int AS count ${hobbyBase} GROUP BY facet_hobby.hobby_value ORDER BY count DESC, value ASC LIMIT 20`,
    values: hobbyValues,
  };
  const nationalityValues: unknown[] = [];
  const nationalityBase = facetBase(query, nationalityValues);
  const nationalities: BuiltQuery = {
    text: `SELECT u.nationality AS value, COUNT(DISTINCT u.id)::int AS count ${nationalityBase} GROUP BY u.nationality ORDER BY count DESC, value ASC LIMIT 20`,
    values: nationalityValues,
  };
  return [hobbies, nationalities];
}
