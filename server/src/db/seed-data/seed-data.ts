import type { SeedData, SeedUser } from "./types";

export type { SeedData, SeedUser } from "./types";

const firstNames = ["Ada", "Grace", "Linus", "Margaret", "Alan", "Katherine", "James", "Sofia"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson"];
const nationalities = ["Canadian", "French", "German", "Japanese", "Nigerian", "Brazilian", "Indian", "Australian"];
const hobbyPool = ["Chess", "Cycling", "Hiking", "Photography", "Reading", "Running", "Skiing", "Swimming", "Cooking", "Music"];

export function generateSeedData(count = 10_000): SeedData {
  const users: SeedUser[] = [];

  for (let index = 0; index < count; index += 1) {
    const hobbyCount = index % (hobbyPool.length + 1);
    users.push({
      avatar: `https://i.pravatar.cc/150?img=${(index % 70) + 1}`,
      firstName: firstNames[index % firstNames.length],
      lastName: lastNames[Math.floor(index / firstNames.length) % lastNames.length],
      age: 18 + (index % 83),
      nationality: nationalities[index % nationalities.length],
      hobbies: hobbyPool.slice(0, hobbyCount),
    });
  }

  return { users, hobbies: hobbyPool };
}
