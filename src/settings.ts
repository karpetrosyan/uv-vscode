export type UvVscodeSettings = {
  path?: string[];
  ignoreProjectConfigs?: boolean;
};

export const DEFAULT_SETTINGS: UvVscodeSettings = {
  ignoreProjectConfigs: true,
};
