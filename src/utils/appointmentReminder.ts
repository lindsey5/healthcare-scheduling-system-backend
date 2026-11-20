export const manilaDate = (instant: Date) =>
    new Date(instant.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);

export const appointmentStartAt = (date: Date | string, time: string) => {
    const day = date instanceof Date ? date.toISOString().slice(0, 10) : date;
    return new Date(`${day}T${time}+08:00`);
};

export const isReminderDue = (start: Date, now: Date) =>
    start > now && start.getTime() <= now.getTime() + 60 * 60 * 1000;
