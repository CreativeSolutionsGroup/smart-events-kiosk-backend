export interface Event {
  id: string,
  alias: string,
  created: Date
}

export interface EventInput {
  alias: string
}

export interface EventUpdate {
  old_alias: string,
  new_alias: string
}

export interface CheckIn {
  id: string,
  event: string,
  student_id: string,
  created: Date
}

export interface CheckInInput {
  mac_address: string
  student_id: string
}