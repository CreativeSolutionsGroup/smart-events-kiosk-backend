const START_CHARACTER = ';'
const ENDING_CHARACTER = '?'

export const parse_mag_stripe = (id: string): string => {
  const start_character = id.charAt(0);
  id = id.substring(1);

  if (start_character !== START_CHARACTER) {
    throw new Error("Parsing error. Start character incorrect.");
  }

  const student_id_string = id.split("?");

  if (student_id_string[0].length !== 13) {
    throw new Error("Parsing error. Student ID length was not correct.");
  }

  return student_id_string[0];
}