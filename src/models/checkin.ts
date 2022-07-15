export interface Event {
    id: string,
    alias: string,
    created: Date
}

export interface CheckIn {
    id: string,
    event: string,
    student_id: string,
    created: Date
}