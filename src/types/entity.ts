export type EntityId = string;

export interface BaseEntity {
  id: EntityId;
  created_at: string;
  updated_at: string;
  version: number;
}
