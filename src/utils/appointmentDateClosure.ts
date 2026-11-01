type AppointmentDateClosureTimeRange = {
    startTime: string | null;
    endTime: string | null;
};

const timeToMinutes = (time: string): number | null => {
    const match = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(time);

    if (!match) {
        return null;
    }

    return Number(match[1]) * 60 + Number(match[2]) + Number(match[3] ?? 0) / 60;
};

export const isAppointmentTimeClosed = (
    closure: AppointmentDateClosureTimeRange,
    appointmentTime: string,
    appointmentDurationMinutes = 30
) => {
    if (closure.startTime === null && closure.endTime === null) {
        return true;
    }

    if (closure.startTime === null || closure.endTime === null) {
        return true;
    }

    const closureStart = timeToMinutes(closure.startTime);
    const closureEnd = timeToMinutes(closure.endTime);
    const appointmentStart = timeToMinutes(appointmentTime);

    if (
        closureStart === null ||
        closureEnd === null ||
        appointmentStart === null
    ) {
        return true;
    }

    const appointmentEnd = appointmentStart + appointmentDurationMinutes;

    return appointmentStart < closureEnd && appointmentEnd > closureStart;
};
