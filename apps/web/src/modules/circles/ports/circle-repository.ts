import type { Circle } from "../domain/circle";

export interface CreateCircleInput {
  id: string;
  workspaceId: string;
  name: string;
}

export interface CircleRepository {
  create(input: CreateCircleInput): Promise<Circle>;
  findById(id: string): Promise<Circle | null>;
  listForWorkspace(workspaceId: string): Promise<Circle[]>;
  rename(id: string, name: string): Promise<Circle>;
  delete(id: string): Promise<void>;
}
