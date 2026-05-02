import type { WsEvent } from '@/types'

type Handler<T extends WsEvent = WsEvent> = (event: T) => void

export class WsClient {
  private ws: WebSocket | null = null
  private handlers: Map<string, Set<Handler>> = new Map()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectDelay = 1000
  private maxReconnectDelay = 30_000
  private shouldConnect = false
  private url: string

  constructor(url: string) {
    this.url = url
  }

  connect() {
    this.shouldConnect = true
    this._connect()
  }

  disconnect() {
    this.shouldConnect = false
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
    this.ws = null
  }

  subscribe<T extends WsEvent>(type: T['type'], handler: Handler<T>) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler as Handler)
    return () => this.handlers.get(type)?.delete(handler as Handler)
  }

  private _connect() {
    if (!this.shouldConnect) return
    this.ws = new WebSocket(this.url)

    this.ws.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as WsEvent
        this.handlers.get(event.type)?.forEach((h) => h(event))
      } catch {
        // ignore malformed frames
      }
    }

    this.ws.onclose = () => {
      if (!this.shouldConnect) return
      this.reconnectTimer = setTimeout(() => {
        this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay)
        this._connect()
      }, this.reconnectDelay)
    }

    this.ws.onopen = () => {
      this.reconnectDelay = 1000
    }
  }
}

// Singleton — one WS per app session
let client: WsClient | null = null

export function getWsClient(): WsClient {
  if (!client) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    client = new WsClient(`${proto}//${window.location.host}/ws`)
  }
  return client
}
