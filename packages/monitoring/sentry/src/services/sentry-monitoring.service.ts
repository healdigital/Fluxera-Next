import type { Event as SentryEvent, User as SentryUser } from '@sentry/nextjs';

import { MonitoringService } from '@kit/monitoring-core';

/**
 * @class
 * @implements {MonitoringService}
 * ServerSentryMonitoringService is responsible for capturing exceptions and identifying users using the Sentry monitoring service.
 */
export class SentryMonitoringService implements MonitoringService {
  private readonly readyPromise: Promise<unknown>;
  private readyResolver?: (value?: unknown) => void;

  constructor() {
    this.readyPromise = new Promise(
      (resolve) => (this.readyResolver = resolve),
    );

    void this.initialize();
  }

  async ready() {
    return this.readyPromise;
  }

  async captureException(error: Error | null) {
    const Sentry = await this.getSentry();

    return Sentry.captureException(error);
  }

  async captureEvent<Extra extends SentryEvent>(event: string, extra?: Extra) {
    const Sentry = await this.getSentry();

    return Sentry.captureEvent({
      message: event,
      ...(extra ?? {}),
    });
  }

  async identifyUser(user: SentryUser) {
    const Sentry = await this.getSentry();

    Sentry.setUser(user);
  }

  private async initialize() {
    if (typeof document !== 'undefined') {
      const { initializeSentryBrowserClient } = await import(
        '../sentry.client.config'
      );

      initializeSentryBrowserClient();
    } else {
      const { initializeSentryServerClient } = await import(
        '../sentry.server.config'
      );

      initializeSentryServerClient();
    }

    this.readyResolver?.();
  }

  private async getSentry() {
    const { default: Sentry } = await import('@sentry/nextjs');

    return Sentry;
  }
}
