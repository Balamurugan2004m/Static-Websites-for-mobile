import {
  transformEventsForScheduler,
  removeDuplicateFacilities,
  removeDuplicateExaminers,
  transformFormDataToPayload,
  transformApiSlotsToFormData,
  transformApiToSchedulerEvents,
} from "../components/calendar";
import { FormData } from "../provider-calendar";

describe("transformEventsForScheduler", () => {
  it("should transform basic event without recurrence", () => {
    const input: FormData[] = [
      {
        id: 1,
        type: "Available",
        title: "",
        description: "",
        date: "2025-07-14",
        startTime: "10:00",
        endTime: "11:00",
        repeat: "Never",
        repeatEvery: null,
        repeatEndType: null,
        repeatEndAfter: null,
        repeatEndDate: null,
        repeatOn: [],
        recurrenceExceptions: [],
        recurrenceId: null,
        titleDesc: "",
      },
    ];

    const output = transformEventsForScheduler(input);
    expect(output).toHaveLength(1);
    expect(output[0].title).toBe("Available Slot");
    expect(output[0].recurrenceRule).toBeUndefined();
  });

  it("should generate recurrence rule with COUNT", () => {
    const input: FormData[] = [
      {
        id: 2,
        type: "Event",
        title: "Meeting",
        description: "Team meeting",
        date: "2025-07-14",
        startTime: "09:00",
        endTime: "10:00",
        repeat: "Daily",
        repeatEvery: 2,
        repeatEndType: "after",
        repeatEndAfter: 5,
        repeatEndDate: null,
        repeatOn: [],
        recurrenceExceptions: [],
        recurrenceId: null,
        titleDesc: "",
      },
    ];

    const output = transformEventsForScheduler(input);
    expect(output[0].recurrenceRule).toBe("FREQ=DAILY;INTERVAL=2;COUNT=5");
  });

  it("should include BYDAY for weekly recurrence", () => {
    const input: FormData[] = [
      {
        id: 3,
        type: "Event",
        title: "Yoga",
        description: "Morning Yoga",
        date: "2025-07-14",
        startTime: "07:00",
        endTime: "08:00",
        repeat: "Weekly",
        repeatEvery: 1,
        repeatEndType: "on",
        repeatEndAfter: null,
        repeatEndDate: "2025-08-14",
        repeatOn: ["MO", "WE", "FR"],
        recurrenceExceptions: [],
        recurrenceId: null,
        titleDesc: "",
      },
    ];

    const output = transformEventsForScheduler(input);
    expect(output[0].recurrenceRule).toContain("BYDAY=MO,WE,FR");
  });
});

describe("removeDuplicateFacilities", () => {
  it("removes duplicate facilities based on Id", () => {
    const input = [
      { Id: 1, Name: "A" },
      { Id: 2, Name: "B" },
      { Id: 1, Name: "A (Duplicate)" },
    ];
    const output = removeDuplicateFacilities(input);
    expect(output).toHaveLength(2);
  });
});

describe("removeDuplicateExaminers", () => {
  it("removes duplicate examiners based on trimmed ExaminerId", () => {
    const input = [
      { ExaminerId: "1 " },
      { ExaminerId: "2" },
      { ExaminerId: "1" },
    ];
    const output = removeDuplicateExaminers(input);
    expect(output).toHaveLength(2);
  });
});

describe("transformFormDataToPayload", () => {
  it("transforms FormData into SlotPayload", () => {
    const input: FormData = {
      id: 1,
      type: "Event",
      title: "Session",
      titleDesc: "Morning",
      description: "Therapy",
      date: "2025-07-14",
      startTime: "10:00",
      endTime: "11:00",
      repeat: "Daily",
      repeatEvery: 1,
      repeatEndType: "after",
      repeatEndAfter: 3,
      repeatEndDate: null,
      repeatOn: [],
      recurrenceExceptions: [],
      recurrenceId: null,
    };

    const payload = transformFormDataToPayload(
      input,
      101,
      202,
      "Dr. Who",
      999,
      { SlotId: 111, TaskId: 222 },
      true
    );

    expect(payload.FacilityId).toBe(101);
    expect(payload.ExaminerId).toBe(202);
    expect(payload.ExaminerName).toBe("Dr. Who");
    expect(payload.Repeat).toBe("Daily");
    expect(payload.RepeatEndAfterInterval).toBe(3);
    expect(payload.RepeatEndDate).toBeNull();
    expect(payload.CalEndDate).toBe("2025-07-14");
    expect(payload.EditOption).toBe("CF");
  });

  it("handles Ends: On [Date] correctly by setting RepeatEndAfterInterval to null and RepeatEndDate to the target date", () => {
    const input: FormData = {
      id: 0,
      type: "Available",
      title: "Available",
      titleDesc: "",
      description: "",
      date: "2026-10-09",
      startTime: "10:00 AM",
      endTime: "11:00 AM",
      repeat: "Daily",
      repeatEvery: 1,
      repeatEndType: "on",
      repeatEndAfter: 1, // Stale value in form state
      repeatEndDate: "2026-11-01",
      repeatOn: [],
      recurrenceExceptions: [],
      recurrenceId: null,
    };

    const payload = transformFormDataToPayload(
      input,
      10,
      20,
      "Dr. Smith",
      555,
      {},
      false
    );

    expect(payload.RepeatEndAfterInterval).toBeNull();
    expect(payload.RepeatEndDate).toBe("2026-11-01");
    expect(payload.CalEndDate).toBe("2026-10-09"); // Slot end date, not series end date
    expect(payload.RepeatInterval).toBe(1);
    expect(payload.UserId).toBe(555);
  });

  it("handles Repeat: Never by setting RepeatInterval, RepeatEndAfterInterval, and RepeatEndDate to null", () => {
    const input: FormData = {
      id: 0,
      type: "Available",
      title: "Available",
      titleDesc: "",
      description: "",
      date: "2026-10-09",
      startTime: "09:00 AM",
      endTime: "10:00 AM",
      repeat: "Never",
      repeatEvery: 1,
      repeatEndType: null,
      repeatEndAfter: null,
      repeatEndDate: null,
      repeatOn: [],
      recurrenceExceptions: [],
      recurrenceId: null,
    };

    const payload = transformFormDataToPayload(
      input,
      10,
      20,
      "Dr. Smith",
      555,
      {},
      false
    );

    expect(payload.RepeatInterval).toBeNull();
    expect(payload.RepeatEndAfterInterval).toBeNull();
    expect(payload.RepeatEndDate).toBeNull();
    expect(payload.CalEndDate).toBe("2026-10-09");
  });

  it("calculates next day for CalEndDate when slot spans across midnight (PM to AM)", () => {
    const input: FormData = {
      id: 0,
      type: "Available",
      title: "Available",
      titleDesc: "",
      description: "",
      date: "2026-10-09",
      startTime: "11:00 PM",
      endTime: "01:00 AM",
      repeat: "Never",
      repeatEvery: 1,
      repeatEndType: null,
      repeatEndAfter: null,
      repeatEndDate: null,
      repeatOn: [],
      recurrenceExceptions: [],
      recurrenceId: null,
    };

    const payload = transformFormDataToPayload(
      input,
      10,
      20,
      "Dr. Smith",
      555,
      {},
      false
    );

    expect(payload.CalDate).toBe("2026-10-09");
    expect(payload.CalEndDate).toBe("2026-10-10");
  });

  it("omits UserId when userId is non-numeric string (e.g. 'Admin1') to prevent C# deserialization error", () => {
    const input: FormData = {
      id: 0,
      type: "Available",
      title: "Available",
      titleDesc: "",
      description: "",
      date: "2026-10-12",
      startTime: "12:00 AM",
      endTime: "01:00 AM",
      repeat: "Daily",
      repeatEvery: 1,
      repeatEndType: "after",
      repeatEndAfter: 10,
      repeatEndDate: null,
      repeatOn: [],
      recurrenceExceptions: [],
      recurrenceId: null,
    };

    const payload = transformFormDataToPayload(
      input,
      29,
      1331,
      "Karolina Simonyan",
      "Admin1",
      {},
      false
    );

    expect(payload.UserId).toBeUndefined();
    expect(payload.ExaminerId).toBe(1331);
    expect(payload.FacilityId).toBe(29);
  });
});

describe("transformApiSlotsToFormData", () => {
  it("converts API slots to FormData", () => {
    const apiSlot = [
      {
        SlotId: 1,
        Start: "2025-07-14T08:00:00Z",
        End: "2025-07-14T09:00:00Z",
        Title: "Consultation",
        TitleDesc: "Initial",
        Description: "First session",
        TaskType: "Event",
        Repeat: "Weekly",
        RepeatInterval: 1,
        RepeatEndAfterInterval: 4,
        RepeatEndDate: null,
        RepeatOnWeekDays: "MO,WE",
        RecurrenceId: null,
      },
    ];

    const output = transformApiSlotsToFormData(apiSlot);
    expect(output[0].type).toBe("Event");
    expect(output[0].repeatOn).toEqual(["MO", "WE"]);
  });
});

describe("transformApiToSchedulerEvents", () => {
  it("groups and transforms recurring events with exception structure", () => {
    const apiEvents = [
      {
        SlotId: 1,
        TaskId: 100,
        Start: "2025-07-14T08:00:00Z",
        End: "2025-07-14T09:00:00Z",
        Repeat: "Weekly",
        RepeatInterval: 1,
        RepeatEndAfterInterval: 3,
        RepeatEndDate: null,
        RepeatOnWeekDays: "MO",
        Title: "Class",
        TitleDesc: "Math",
        Description: "Algebra",
        TaskType: "Event",
      },
      {
        SlotId: 2,
        TaskId: 100,
        Start: "2025-07-21T08:00:00Z",
        End: "2025-07-21T09:00:00Z",
        Repeat: "Weekly",
        RepeatInterval: 1,
        RepeatEndAfterInterval: 3,
        RepeatEndDate: null,
        RepeatOnWeekDays: "MO",
        Title: "Class",
        TitleDesc: "Math",
        Description: "Algebra",
        TaskType: "Event",
      },
    ];

    const output = transformApiToSchedulerEvents(apiEvents);
    expect(output).toHaveLength(2);

    const mainEvent = output.find((e) => e.id === 1);
    const exceptionEvent = output.find((e) => e.id === 2);

expect(mainEvent?.recurrenceRule).toContain("FREQ=WEEKLY");


expect(Array.isArray(mainEvent?.recurrenceExceptions)).toBe(true);


expect(mainEvent?.recurrenceExceptions?.length).toBeGreaterThanOrEqual(0);


expect(exceptionEvent?.recurrenceId).toBe(1);
  });
});
