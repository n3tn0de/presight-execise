import type { DirectoryQuery, FacetValue, FacetsResponse } from "@presight/shared";
import { buildFacetsQueries } from "../database/sql-builder";
import type { FacetsRepository, Queryable } from "../types";

export function createFacetsRepository(db: Queryable): FacetsRepository {
  async function get(query: DirectoryQuery): Promise<FacetsResponse> {
    const [hobbyQuery, nationalityQuery] = buildFacetsQueries(query);
    const [hobbies, nationalities] = await Promise.all([db.query<FacetValue>(hobbyQuery.text, hobbyQuery.values), db.query<FacetValue>(nationalityQuery.text, nationalityQuery.values)]);
    const map = (rows: FacetValue[]) => rows.map((row) => ({ value: row.value, count: Number(row.count) }));
    return { hobbies: map(hobbies.rows), nationalities: map(nationalities.rows) };
  }
  return {
    get,
    async hobbies(query) { return (await get(query)).hobbies; },
    async nationalities(query) { return (await get(query)).nationalities; },
  };
}
