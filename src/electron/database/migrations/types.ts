export interface MigrationContext {
  lastBootVersion?: string;
}

export interface Migration {
  id: string;
  run: () => Promise<void> | void;
  shouldRun?: (context: MigrationContext) => boolean;
  failurePolicy?: 'abort' | 'continue';
}

export interface MigrationState {
  completed: Record<string, boolean>;
  lastBootVersion?: string;
}
