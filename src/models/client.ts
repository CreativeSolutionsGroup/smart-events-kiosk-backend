export interface Client {
  mac_address?: string
  alias: string
  event_id: string
  last_heartbeat: number
  status: boolean|string
}

export interface Heartbeat {
  mac_address: string
}