export const value = (item: number | string | undefined, suffix = "") =>
  item == null || item === "" ? "—" : `${item}${suffix}`;

export const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
