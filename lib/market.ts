export function isMarketOpenIST(date = new Date()) {
  const indiaTime = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = indiaTime.getDay();
  if (day === 0 || day === 6) {
    return false;
  }

  const minutes = indiaTime.getHours() * 60 + indiaTime.getMinutes();
  const open = 9 * 60 + 15;
  const close = 15 * 60 + 30;
  return minutes >= open && minutes <= close;
}

export function formatISTDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
  }).format(date);
}
