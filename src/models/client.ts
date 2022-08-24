export interface Client {
  mac_address: string
  alias: string
  event_id: string
  last_heartbeat: number
  status: boolean
}

export interface Heartbeat {
  mac_address: string
}