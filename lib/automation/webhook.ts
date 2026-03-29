import type { WebhookPayload } from '@/lib/forms/submit'

type WebhookTarget = 'gohighlevel' | 'hubspot' | 'zapier' | 'make' | 'custom'

type WebhookConfig = {
  target: WebhookTarget
  url: string
  headers?: Record<string, string>
}

export async function sendToWebhook(config: WebhookConfig, payload: WebhookPayload) {
  const { url, headers = {} } = config

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      source: 'matrix-website',
      version: '1.0',
      sentAt: new Date().toISOString(),
      data: payload,
    }),
  })

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
  }

  return { success: true, status: response.status }
}

export function buildWebhookConfigs(): WebhookConfig[] {
  const configs: WebhookConfig[] = []

  if (process.env.GOHIGHLEVEL_WEBHOOK_URL) {
    configs.push({
      target: 'gohighlevel',
      url: process.env.GOHIGHLEVEL_WEBHOOK_URL,
    })
  }

  if (process.env.HUBSPOT_WEBHOOK_URL) {
    configs.push({
      target: 'hubspot',
      url: process.env.HUBSPOT_WEBHOOK_URL,
    })
  }

  if (process.env.ZAPIER_WEBHOOK_URL) {
    configs.push({
      target: 'zapier',
      url: process.env.ZAPIER_WEBHOOK_URL,
    })
  }

  if (process.env.MAKE_WEBHOOK_URL) {
    configs.push({
      target: 'make',
      url: process.env.MAKE_WEBHOOK_URL,
    })
  }

  return configs
}
