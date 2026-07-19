export interface ServerEnv {
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME?: string;
  DATABASE_URL: string;
  SERVER_HOST: string;
  SERVER_PORT: number;
  SEED_COUNT: number;
}
