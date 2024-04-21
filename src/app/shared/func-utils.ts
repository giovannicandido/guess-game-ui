import { environment } from "../../environments/environment";

export const ENVIRONMENT_KEY = "ENVIRONMENT"

export interface EnvironmentSettings {
  BACKEND_URL: string,
  BACKEND_WS: string
}

export function getEnvironment() {
  const env_value = localStorage.getItem(ENVIRONMENT_KEY)
  return env_value === null ? "PROD" : env_value
}

export function getEnvironmentConfig(): EnvironmentSettings {
  const env = getEnvironment()
  return environment[env];
}

export function nullOrUndefined(value: any) {
  return value === null || value === undefined
}
