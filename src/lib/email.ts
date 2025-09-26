export type PortfolioNotificationPayload = {
  to: string
  subject: string
  message: string
  metadata?: Record<string, unknown>
}

export async function sendPortfolioNotification(payload: PortfolioNotificationPayload) {
  // Mock email service – in production integrate with SMTP/service provider
  console.info('📬 [mock-email] portfolio notification sent', {
    to: payload.to,
    subject: payload.subject,
    metadata: payload.metadata
  })
}
