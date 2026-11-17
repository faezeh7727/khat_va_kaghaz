export default function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 11) return "صبح بخیر 🌅";
  if (hour >= 11 && hour < 15) return "ظهر بخیر ☀️";
  if (hour >= 15 && hour < 19) return "عصر بخیر 🌤️";
  return "شب بخیر 🌙";
}
