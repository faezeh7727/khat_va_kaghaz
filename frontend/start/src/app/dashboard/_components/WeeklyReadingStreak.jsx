const weekdayNames = ["ی", "د", "س", "چ", "پ", "ج", "ش"];
const fullWeekdayNames = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
const numberFormat = new Intl.NumberFormat("fa-IR");
const maxBarSeconds = 30 * 60;

function localDayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getWeekDays(activity) {
  const secondsByDay = new Map();
  activity.forEach(({ day, seconds }) => {
    if (typeof day === "string" && Number.isFinite(Number(seconds))) {
      secondsByDay.set(day, (secondsByDay.get(day) || 0) + Number(seconds));
    }
  });

  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (6 - index));
    return { date, seconds: secondsByDay.get(localDayKey(date)) || 0 };
  });
}

function getCurrentStreak(days) {
  let index = days.length - 1;
  if (index >= 0 && days[index].seconds === 0) index -= 1;
  let streak = 0;
  while (index >= 0 && days[index].seconds > 0) {
    streak += 1;
    index -= 1;
  }
  return streak;
}

function formatMinutes(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${numberFormat.format(minutes)} دقیقه`;
}

export default function WeeklyReadingStreak({ activity = [], mode = "reading", isLoading = false }) {
  const days = getWeekDays(activity);
  const streak = getCurrentStreak(days);
  const activeDays = days.filter(({ seconds }) => seconds > 0).length;
  const totalSeconds = days.reduce((total, { seconds }) => total + seconds, 0);

  return (
    <section className="weekly-reading" aria-labelledby="weekly-reading-title" dir="rtl">
      <header className="weekly-reading-header">
        <div className="weekly-reading-title">
          <span className="weekly-reading-dot" aria-hidden="true" />
          <h2 id="weekly-reading-title">{mode === "writing" ? "فعالیت نوشتن هفتگی" : "استمرار مطالعه هفتگی"}</h2>
        </div>
        <span className="weekly-reading-streak" aria-label={mode === "writing" ? `${numberFormat.format(activeDays)} روز فعالیت` : `${numberFormat.format(streak)} روز متوالی`}>
          <span aria-hidden="true">🔥</span> {mode === "writing" ? `${numberFormat.format(activeDays)} روز فعال` : `${numberFormat.format(streak)} روز متوالی`}
        </span>
      </header>

      <div className={`weekly-reading-chart${isLoading ? " is-loading" : ""}`} aria-label={`${numberFormat.format(activeDays)} روز ${mode === "writing" ? "نوشتن" : "مطالعه"} در ۷ روز گذشته`}>
        {days.map(({ date, seconds }) => {
          const weekday = date.getDay();
          const height = seconds > 0 ? Math.max(12, Math.min(100, Math.round((seconds / maxBarSeconds) * 100))) : 7;
          return (
            <div className="weekly-reading-day" key={localDayKey(date)}>
              <div className="weekly-reading-bar-track" title={`${fullWeekdayNames[weekday]}: ${formatMinutes(seconds)}`}>
                <span className={`weekly-reading-bar${seconds > 0 ? " has-activity" : ""}`} style={{ "--bar-height": `${height}%` }} />
              </div>
              <span className={seconds > 0 ? "is-active" : ""} aria-label={fullWeekdayNames[weekday]}>{weekdayNames[weekday]}</span>
            </div>
          );
        })}
      </div>

      <p className="weekly-reading-caption" role="status">
        {isLoading ? "در حال دریافت آمار…" : `${numberFormat.format(activeDays)} روز ${mode === "writing" ? "نوشتن" : "مطالعه"} · ${formatMinutes(totalSeconds)} در ۷ روز گذشته`}
      </p>
    </section>
  );
}
