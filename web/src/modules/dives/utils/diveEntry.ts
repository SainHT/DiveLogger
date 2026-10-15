export function minutesBetween(start: string, end: string): number {
  const [startHours, startMinutes] = start.split(":").map(Number);
  const [endHours, endMinutes] = end.split(":").map(Number);
  let difference =
    endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
  if (difference < 0) difference += 24 * 60;
  return difference;
}

export function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  const total = (hours * 60 + mins + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
