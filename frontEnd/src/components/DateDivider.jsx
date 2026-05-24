import { toJalaali } from "jalaali-js";

function formatDateLabel(dateString) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const msgDate = new Date(dateString);

  // چک کردن امروز
  if (
    msgDate.getDate() === today.getDate() &&
    msgDate.getMonth() === today.getMonth() &&
    msgDate.getFullYear() === today.getFullYear()
  ) {
    return "امروز";
  }

  // چک کردن دیروز
  if (
    msgDate.getDate() === yesterday.getDate() &&
    msgDate.getMonth() === yesterday.getMonth() &&
    msgDate.getFullYear() === yesterday.getFullYear()
  ) {
    return "دیروز";
  }

  // بقیه تاریخ‌ها → شمسی
  const jDate = toJalaali(msgDate);
  const monthNames = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];
  return `${jDate.jd} ${monthNames[jDate.jm - 1]} ${jDate.jy}`;
}

function DateDivider({ date }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-gray-500" />
      <span className="text-xs text-gray-500 font-medium whitespace-nowrap px-3 py-1 bg-gray-800/50 rounded-full border border-gray-700/50">
        {formatDateLabel(date)}
      </span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-600 to-gray-500" />
    </div>
  );
}

export default DateDivider;
