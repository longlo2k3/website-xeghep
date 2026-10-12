export async function register(): Promise<void> {
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    process.env.NEXT_PHASE !== 'phase-production-build'
  ) {
    try {
      const { getPayload } = await import('payload');
      const { default: config } = await import('./payload.config');
      const payload = await getPayload({ config });
      const { startNotifyWorker } = await import('./lib/notify/worker');
      startNotifyWorker(payload);
    } catch (err) {
      console.error(
        '[instrumentation] không khởi động được notify worker:',
        err instanceof Error ? err.message : err,
      );
    }
  }
}
