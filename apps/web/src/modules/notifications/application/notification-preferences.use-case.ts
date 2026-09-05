import type { NotificationPreference } from "../domain/notification-preference";
import type {
  NotificationPreferenceRepository,
  UpdateNotificationPreferenceInput,
} from "../ports/notification-preference-repository";

export class GetNotificationPreferencesUseCase {
  constructor(private readonly repository: NotificationPreferenceRepository) {}

  async execute(userId: string): Promise<NotificationPreference> {
    return this.repository.get(userId);
  }
}

export class UpdateNotificationPreferencesUseCase {
  constructor(private readonly repository: NotificationPreferenceRepository) {}

  async execute(userId: string, patch: UpdateNotificationPreferenceInput): Promise<NotificationPreference> {
    return this.repository.update(userId, patch);
  }
}
