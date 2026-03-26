// تبدیل تاریخ میلادی به شمسی (الگوریتم ساده)
export function toJalali(date: Date): { year: number; month: number; day: number } {
  const gYear = date.getFullYear()
  const gMonth = date.getMonth() + 1
  const gDay = date.getDate()

  let jYear, jMonth, jDay

  const gDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const jDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]

  let gy = gYear - 1600
  let gm = gMonth - 1
  let gd = gDay - 1

  let gDayNo = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400)

  for (let i = 0; i < gm; ++i) {
    gDayNo += gDaysInMonth[i]
  }

  if (gm > 1 && ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0)) {
    ++gDayNo
  }

  gDayNo += gd

  let jDayNo = gDayNo - 79

  const jNp = Math.floor(jDayNo / 12053)
  jDayNo %= 12053

  jYear = 979 + 33 * jNp + 4 * Math.floor(jDayNo / 1461)
  jDayNo %= 1461

  if (jDayNo >= 366) {
    jYear += Math.floor((jDayNo - 1) / 365)
    jDayNo = (jDayNo - 1) % 365
  }

  let i = 0
  while (i < 11 && jDayNo >= jDaysInMonth[i]) {
    jDayNo -= jDaysInMonth[i]
    ++i
  }

  jMonth = i + 1
  jDay = jDayNo + 1

  return { year: jYear, month: jMonth, day: jDay }
}

// فرمت کردن تاریخ شمسی
export function formatJalaliDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const { year, month, day } = toJalali(d)
  
  const monthNames = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ]
  
  return `${day} ${monthNames[month - 1]} ${year}`
}

// محاسبه روزهای باقیمانده تا سررسید
export function daysRemaining(dueDate: Date | string): number {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  const now = new Date()
  
  // حذف ساعت برای محاسبه دقیق روز
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const diffTime = dueDay.getTime() - nowDay.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

// چک کردن اینکه تاریخ در ماه جاری است یا نه
export function isInCurrentMonth(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  
  return (
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  )
}

// گرفتن محدوده ماه جاری (اول و آخر ماه)
export function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  
  return { start, end }
}

// فرمت کردن تاریخ به صورت کوتاه (1404/12/17)
export function formatJalaliShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const { year, month, day } = toJalali(d)
  
  return `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`
}

// تبدیل اعداد انگلیسی به فارسی
export function toPersianDigits(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return num.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)])
}
