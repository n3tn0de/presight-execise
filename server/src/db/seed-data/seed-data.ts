import type { SeedData, SeedUser } from "./types";

export type { SeedData, SeedUser } from "./types";

const firstNames = [
  "Ada",
  "Grace",
  "Linus",
  "Margaret",
  "Alan",
  "Katherine",
  "James",
  "Sofia",
];
const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Miller",
  "Davis",
  "Wilson",
];
const nationalities = [
  "Canadian",
  "French",
  "German",
  "Japanese",
  "Nigerian",
  "Brazilian",
  "Indian",
  "Australian",
];
const nationalityWeights = [18, 16, 14, 13, 12, 11, 9, 7];
const hobbyPool = [
  "Chess",
  "Cycling",
  "Hiking",
  "Photography",
  "Reading",
  "Running",
  "Skiing",
  "Swimming",
  "Cooking",
  "Music",
];

export function generateSeedData(count = 10_000): SeedData {
  const users: SeedUser[] = [];
  const random = createRandom(0x5eed1234);

  for (let index = 0; index < count; index += 1) {
    const hobbyCount = Math.floor(random() * (hobbyPool.length + 1));
    const hobbies = shuffle(hobbyPool, random).slice(0, hobbyCount).sort();
    users.push({
      avatar: `https://i.pravatar.cc/150?img=${(index % 70) + 1}`,
      firstName: firstNames[Math.floor(random() * firstNames.length)],
      lastName: lastNames[Math.floor(random() * lastNames.length)],
      age: 18 + Math.floor(random() * 83),
      nationality: weightedNationality(random()),
      hobbies,
    });
  }

  return { users, hobbies: hobbyPool };
}

function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

function weightedNationality(value: number): string {
  const total = nationalityWeights.reduce((sum, weight) => sum + weight, 0);
  let target = value * total;
  for (let index = 0; index < nationalities.length; index += 1) {
    target -= nationalityWeights[index];
    if (target < 0) return nationalities[index];
  }
  return nationalities[nationalities.length - 1];
}

function shuffle<T>(values: T[], random: () => number): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}
