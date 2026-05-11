export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Baku",
  }).format(d).replace(/\//g, ".");
};

export const formatTime = (date: Date | string): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Baku",
  }).format(d);
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return `${formatDate(d)} ${formatTime(d)}`;
};
