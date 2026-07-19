export type SeedUser = {
  avatar: string;
  firstName: string;
  lastName: string;
  age: number;
  nationality: string;
  hobbies: string[];
};

export type SeedData = { users: SeedUser[]; hobbies: string[] };
