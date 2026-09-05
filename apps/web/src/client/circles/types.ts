export interface CircleDto {
  id: string;
  workspaceId: string;
  name: string;
  createdAt: string;
}

export interface CircleMemberDto {
  id: string;
  circleId: string;
  userId: string;
  createdAt: string;
}
