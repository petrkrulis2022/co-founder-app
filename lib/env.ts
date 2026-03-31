function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export function validateEnv() {
  const errors: string[] = [];

  const requiredVars = [
    "DATABASE_URL",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "ANTHROPIC_API_KEY",
  ];

  for (const key of requiredVars) {
    if (!process.env[key]) {
      errors.push(key);
    }
  }

  if (errors.length > 0) {
    console.error(
      `[env] Missing required environment variables: ${errors.join(", ")}`,
    );
  }

  return {
    DATABASE_URL: required("DATABASE_URL"),
    CLERK_PUBLISHABLE_KEY: required("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
    CLERK_SECRET_KEY: required("CLERK_SECRET_KEY"),
    ANTHROPIC_API_KEY: required("ANTHROPIC_API_KEY"),
    UPSTASH_REDIS_REST_URL: optional("UPSTASH_REDIS_REST_URL", ""),
    UPSTASH_REDIS_REST_TOKEN: optional("UPSTASH_REDIS_REST_TOKEN", ""),
    NEXT_PUBLIC_APP_URL: optional(
      "NEXT_PUBLIC_APP_URL",
      "http://localhost:3000",
    ),
  };
}
