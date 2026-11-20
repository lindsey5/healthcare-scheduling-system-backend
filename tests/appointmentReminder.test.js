const assert = require("node:assert/strict");
const test = require("node:test");
const { appointmentStartAt, isReminderDue, manilaDate } = require("../dist/utils/appointmentReminder");

test("reminder is due exactly one hour before the Manila appointment", () => {
    const start = appointmentStartAt("2026-11-23", "09:30:00");
    assert.equal(start.toISOString(), "2026-11-23T01:30:00.000Z");
    assert.equal(isReminderDue(start, new Date("2026-11-23T00:29:59Z")), false);
    assert.equal(isReminderDue(start, new Date("2026-11-23T00:30:00Z")), true);
    assert.equal(isReminderDue(start, new Date("2026-11-23T01:29:59Z")), true);
    assert.equal(isReminderDue(start, start), false);
});

test("Manila date rolls over at local midnight", () => {
    assert.equal(manilaDate(new Date("2026-11-22T15:59:59Z")), "2026-11-22");
    assert.equal(manilaDate(new Date("2026-11-22T16:00:00Z")), "2026-11-23");
});

test("scan queues due appointments and tolerates an existing reminder key", async () => {
    const { UniqueConstraintError } = require("sequelize");
    const { Appointment } = require("../dist/models");
    const EmailJob = require("../dist/models/EmailJob").default;
    const { queueAppointmentReminders } = require("../dist/services/appointmentReminderService");
    const originalFindAll = Appointment.findAll;
    const originalCreate = EmailJob.create;
    const created = [];
    const now = new Date("2026-11-23T00:30:00Z");
    try {
        Appointment.findAll = async ({ where }) => {
            assert.deepEqual(where.status[Object.getOwnPropertySymbols(where.status)[0]], ["Approved", "Rescheduled"]);
            return [
                { id: "due", appointmentDate: "2026-11-23", appointmentTime: "09:30:00", patient: { email: "patient@example.com" } },
                { id: "later", appointmentDate: "2026-11-23", appointmentTime: "09:31:00", patient: { email: "patient@example.com" } },
            ];
        };
        EmailJob.create = async (job) => {
            created.push(job);
            if (created.length === 2) throw new UniqueConstraintError();
        };
        await queueAppointmentReminders(now);
        await queueAppointmentReminders(now);
        assert.equal(created.length, 2);
        assert.equal(created[0].dedupeKey, "appointment-reminder:due:2026-11-23T01:30:00.000Z");
        assert.equal(created[0].payload.to, "patient@example.com");
    } finally {
        Appointment.findAll = originalFindAll;
        EmailJob.create = originalCreate;
    }
});
