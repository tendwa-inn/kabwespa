const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatShort(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

export function weekKey(iso: string): string {
  return startOfWeek(new Date(iso)).toISOString().slice(0, 10);
}

export function weekLabel(key: string): string {
  const start = new Date(key);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `Week of ${formatShort(start)} – ${formatShort(end)}, ${end.getFullYear()}`;
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function groupByKey<T>(items: T[], getKey: (item: T) => string): { key: string; items: T[] }[] {
  const order: string[] = [];
  const buckets = new Map<string, T[]>();
  for (const item of items) {
    const key = getKey(item);
    if (!buckets.has(key)) {
      buckets.set(key, []);
      order.push(key);
    }
    buckets.get(key)!.push(item);
  }
  return order.map((key) => ({ key, items: buckets.get(key)! }));
}
