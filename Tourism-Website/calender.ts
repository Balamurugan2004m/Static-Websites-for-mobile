/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormData } from "../provider-calendar";

export function transformEventsForScheduler(formDataList: FormData[]) {
    return formDataList.map((item) => {
        const start = new Date(`${item.date}T${item.startTime}`);
        const end = new Date(`${item.date}T${item.endTime}`);

        let recurrenceRule = "";

        if (item.repeat && item.repeat !== "Never") {
            const freq = item.repeat.toUpperCase(); // DAILY or WEEKLY
            const interval = item.repeatEvery || 1;

            if (item.repeatEndType === "after" && item.repeatEndAfter) {
                recurrenceRule = `FREQ=${freq};INTERVAL=${interval};COUNT=${item.repeatEndAfter}`;
            } else if (item.repeatEndType === "on" && item.repeatEndDate) {
                recurrenceRule = `FREQ=${freq};INTERVAL=${interval};UNTIL=${item.repeatEndDate.replace(/-/g, '')}T235959Z`;
            } else {
                recurrenceRule = `FREQ=${freq};INTERVAL=${interval}`;
            }

            if (freq === "WEEKLY" && item.repeatOn && item.repeatOn.length > 0) {
                const byDay = item.repeatOn.join(",");
                recurrenceRule += `;BYDAY=${byDay}`;
            }
        }
        
        return {
            id: item.id,
            start,
            end,
            title: item.title || (item.type === "Available" ? "Available Slot" : "Event"),
            description: item.description,
            recurrenceRule: recurrenceRule || undefined,
            isAllDay: false,
            recurrenceId: null,
            recurrenceExceptions: [],
        } as unknown as SchedulerEvent;
    });
}

/**
 * Formats a Date object into a local 'YYYY-MM-DD' string without UTC conversion shift.
 */
export const formatLocalDateToYMD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Safely extracts 'YYYY-MM-DD' from a Date, ISO string, or MM/DD/YYYY string.
 */
export const extractDateYMD = (val: any): string => {
  if (!val) return "";
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? "" : formatLocalDateToYMD(val);
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    // If ISO or starts with YYYY-MM-DD: "2026-10-12T..." or "2026-10-12"
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }
    // If MM/DD/YYYY: "10/12/2026"
    if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(trimmed)) {
      const parts = trimmed.split(" ")[0].split("/");
      const m = parts[0].padStart(2, "0");
      const d = parts[1].padStart(2, "0");
      const y = parts[2];
      return `${y}-${m}-${d}`;
    }
    // Fallback: try Date parsing
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return formatLocalDateToYMD(d);
    }
  }
  return "";
};

/**
 * Extracts the correct local date string 'YYYY-MM-DD' from scheduler slot props.
 * For 24-hour slots (such as Month view or All-day slots), uses the midpoint (noon)
 * between slot start and end to avoid midnight boundary and timezone shift issues.
 */
export const getSlotLocalDateString = (
  slotStart?: Date | string,
  slotEnd?: Date | string
): string => {
  if (!slotStart) return "";
  const start = new Date(slotStart);
  if (isNaN(start.getTime())) return "";

  if (slotEnd) {
    const end = new Date(slotEnd);
    if (!isNaN(end.getTime()) && end.getTime() > start.getTime()) {
      const midpoint = new Date(
        start.getTime() + (end.getTime() - start.getTime()) / 2
      );
      return formatLocalDateToYMD(midpoint);
    }
  }

  return formatLocalDateToYMD(start);
};

export const customModelFields = {
    id: 'id',
    title: 'title',
    description: 'description',
    start: 'start',
    end: 'end',
    recurrenceRule: 'recurrenceRule',
    recurrenceId: 'recurrenceId',
    recurrenceExceptions: 'recurrenceExceptions'
};

export interface SchedulerEvent {
  id: number;
  SlotId?: number;
  TaskId?: number;
  Repeat?: string;
  start: Date;
  end: Date;
  title: string;
  titleDesc?: string; // optional if not always present
  description: string;
  type?: string; // optional if only used in some places
  isAllDay: boolean;
  recurrenceRule?: string;
  recurrenceId: number | string | null;
  recurrenceExceptions: (Date | string)[];
  taskGroupLength?: number;
  RepeatEndAfterInterval?: number | null;
}

export const displayDate: Date = new Date();

export function removeDuplicateFacilities(facilities: any[]) {
  const seen = new Set();
  return (facilities || [])?.filter(facility => {
    if (seen.has(facility.Id)) return false;
    seen.add(facility.Id);
    return true;
  });
}

export function removeDuplicateExaminers(examiners: any[]) {
  const seen = new Set();
  return examiners.filter(examiner => {
    const id = examiner.ExaminerId?.toString().trim();
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export interface SlotPayload {
  FacilityId: number;
  ExaminerId: number;
  ExaminerName: string;
  IsCalInfoAvailable: boolean;
  UserId?: number | unknown;
  TaskType: any;
  Title: any;
  TitleDesc: any;
  Description: any;
  CalDate: any;
  StartTime: any;
  CalEndDate: any;
  EndTime: any;
  Repeat: any;
  RepeatInterval: number | null;
  RepeatEndAfterInterval: number | null;
  RepeatEndDate: any;
  RepeatOnWeekDays: any;
  RepeatOnMonthlyDate: any;
  RepeatOnMonthlyDay: any;
  RepeatOnMonthlyWeekDay: any;
  SlotId: number;
  TaskId: number;
  ContinueOnException: boolean;
  EditOption?: 'C' | 'CF'; // Add this key
}

export const transformFormDataToPayload = (
  formData: FormData,
  selectedFacility: number,
  selectedExaminer: number,
  examiner: string,
  userId: unknown,
  originalSlot: any = {},
  isCurrentAndFuture: boolean
): SlotPayload => {
  const isRecurring = Boolean(formData.repeat && formData.repeat.toUpperCase() !== "NEVER");
  const isEndAfter = isRecurring && formData.repeatEndType === "after";
  const isEndDate = isRecurring && formData.repeatEndType === "on";

  const repeatInterval = isRecurring
    ? (formData.repeatEvery ? Number(formData.repeatEvery) : 1)
    : null;

  const repeatEndAfterInterval = isEndAfter
    ? (formData.repeatEndAfter ? Number(formData.repeatEndAfter) : null)
    : null;

  const repeatEndDate = isEndDate
    ? (formData.repeatEndDate ? String(formData.repeatEndDate) : null)
    : null;

  let repeatOnWeekDays = "";
  if (isRecurring && formData.repeat.toUpperCase() === "WEEKLY") {
    repeatOnWeekDays = Array.isArray(formData.repeatOn)
      ? formData.repeatOn.join(",")
      : (formData.repeatOn || "");
  }

  // Calculate individual slot CalEndDate (same date, or next day if PM to AM overnight shift)
  let calEndDate = formData.date;
  const startUpper = (formData.startTime || "").toUpperCase();
  const endUpper = (formData.endTime || "").toUpperCase();
  if (startUpper.includes("PM") && endUpper.includes("AM") && formData.date) {
    const [y, m, d] = formData.date.split("-").map(Number);
    if (y && m && d) {
      const nextDay = new Date(y, m - 1, d + 1);
      calEndDate = formatLocalDateToYMD(nextDay);
    }
  }

  const parsedUserId = Number(userId);
  const isValidNumericUserId =
    typeof userId === "number" ||
    (typeof userId === "string" && !isNaN(parsedUserId) && /^\d+$/.test(userId.trim()));

  const obj: SlotPayload = {
    FacilityId: selectedFacility,
    ExaminerId: selectedExaminer,
    ExaminerName: examiner,
    IsCalInfoAvailable: true,
    ...(isValidNumericUserId ? { UserId: parsedUserId } : {}),
    TaskType: formData.type,
    Title: formData.title,
    TitleDesc: formData?.titleDesc,
    Description: formData.description,
    CalDate: formData.date,
    StartTime: formData.startTime,
    CalEndDate: calEndDate,
    EndTime: formData.endTime,
    Repeat: formData.repeat,
    RepeatInterval: repeatInterval,
    RepeatEndAfterInterval: repeatEndAfterInterval,
    RepeatEndDate: repeatEndDate,
    RepeatOnWeekDays: repeatOnWeekDays,
    RepeatOnMonthlyDate: originalSlot?.RepeatOnMonthlyDate || null,
    RepeatOnMonthlyDay: originalSlot?.RepeatOnMonthlyDay || null,
    RepeatOnMonthlyWeekDay: originalSlot?.RepeatOnMonthlyWeekDay || null,
    SlotId: originalSlot?.SlotId ?? 0,
    TaskId: originalSlot?.TaskId ?? 0,
    ContinueOnException: false,
  };

  if (originalSlot?.SlotId) {
    obj.EditOption = isCurrentAndFuture ? 'CF' : 'C';
  }

  return obj;
};

export function transformApiSlotsToFormData(apiSlots: any[]): FormData[] {
  return apiSlots.map((slot) => {
    const start = new Date(slot.Start);
    const end = new Date(slot.End);
    return {
      id: slot.SlotId,
      type: slot.TaskType === "Available" ? "Available" : "Event",
      title: slot.Title || "",
      titleDesc: slot.TitleDesc || "",
      description: slot.Description || "",
      date: start.toISOString().substring(0, 10),
      startTime: start.toISOString().substring(11, 16),
      endTime: end.toISOString().substring(11, 16),
      repeat: slot.Repeat || "Never",
      repeatEvery: slot.RepeatInterval || null,
      repeatEndType: slot.RepeatEndAfterInterval > 0 ? "after" : (slot.RepeatEndDate ? "on" : null),
      repeatEndAfter: slot.RepeatEndAfterInterval || null,
      repeatEndDate: slot.RepeatEndDate ? slot.RepeatEndDate.substring(0, 10) : null,
      repeatOn: slot.RepeatOnWeekDays ? slot.RepeatOnWeekDays.split(",") : [],
      recurrenceExceptions: [],
      recurrenceId: slot.RecurrenceId || null,
    };
  });
}

export enum ModalType {
  CREATE = "CREATE",
  EDIT = "EDIT",
}

interface ApiEvent {
  SlotId: number;
  TaskId: number;
  Start: string;
  End: string;
  Repeat: string;
  RepeatInterval: number | null;
  RepeatEndAfterInterval: number | null;
  RepeatEndDate: string | null;
  RepeatOnWeekDays: string;
  Title: string;
  TitleDesc: string;
  Description: string;
  TaskType: string;
  isDelete?: boolean;
}

function groupByStartEndSignature(events: ApiEvent[]): Record<string, ApiEvent[]> {
  const map: Record<string, ApiEvent[]> = {};
  for (const ev of events) {
    const rawStart = ev.Start ?? (ev as any).start;
    const rawEnd = ev.End ?? (ev as any).end;
    const sig = `${rawStart}-${rawEnd}`;
    if (!map[sig]) map[sig] = [];
    map[sig].push(ev);
  }
  return map;
}

function createRecurrenceRule(
  base: any,
  count: number,
  maxSlotDate?: Date
): string | undefined {
  const repeat = base.Repeat ?? base.repeat;
  if (!repeat || String(repeat).toUpperCase() === "NEVER") return undefined;

  const repeatInterval = base.RepeatInterval ?? base.repeatInterval ?? 1;
  const parts = [`FREQ=${String(repeat).toUpperCase()}`, `INTERVAL=${repeatInterval}`];

  const repeatEndAfterInterval = base.RepeatEndAfterInterval ?? base.repeatEndAfterInterval;
  const repeatEndDate = base.RepeatEndDate ?? base.repeatEndDate;
  const repeatOnWeekDays = base.RepeatOnWeekDays ?? base.repeatOnWeekDays;

  if (repeatEndAfterInterval) {
    parts.push(`COUNT=${count}`);
  } else {
    let untilDateStr = repeatEndDate ? (String(repeatEndDate).includes("T") ? String(repeatEndDate).split("T")[0] : String(repeatEndDate)) : "";
    if (maxSlotDate) {
      const maxDateStr = formatLocalDateToYMD(maxSlotDate);
      if (!untilDateStr || maxDateStr < untilDateStr) {
        untilDateStr = maxDateStr;
      }
    }
    if (untilDateStr) {
      const until = untilDateStr.replace(/-/g, "") + "T235959Z";
      parts.push(`UNTIL=${until}`);
    }
  }

  if (String(repeat).toUpperCase() === "WEEKLY" && repeatOnWeekDays) {
    const dayMap: Record<string, string> = {
      "0": "SU",
      "1": "MO",
      "2": "TU",
      "3": "WE",
      "4": "TH",
      "5": "FR",
      "6": "SA",
    };

    const byDay = String(repeatOnWeekDays).split(",")
      .map((d) => dayMap[d.trim()] || (["SU", "MO", "TU", "WE", "TH", "FR", "SA"].includes(d.trim().toUpperCase()) ? d.trim().toUpperCase() : ""))
      .filter(Boolean)
      .join(",");

    if (byDay) {
      parts.push(`BYDAY=${byDay}`);
    }
  }

  return parts.join(";");
}

function transformGroup(
  events: ApiEvent[],
  parentRecurrenceId: number | null = null
): SchedulerEvent[] {
  if (events.length === 0) return [];

  const groupedBySignature = groupByStartEndSignature(events);
  const signatures = Object.entries(groupedBySignature);

  // Find the most common Start-End pair
  signatures.sort((a, b) => b[1].length - a[1].length);
  const [, commonGroup] = signatures[0];

  const baseEvent = commonGroup[0];
  const rawStart = baseEvent.Start ?? (baseEvent as any).start;
  const rawEnd = baseEvent.End ?? (baseEvent as any).end;
  const start = new Date(typeof rawStart === 'string' ? rawStart.replace('Z', '') : rawStart);
  const end = new Date(typeof rawEnd === 'string' ? rawEnd.replace('Z', '') : rawEnd);
  const recurrenceExceptions: Date[] = [];
  const restEvents: ApiEvent[] = [];

  for (let i = 1; i < signatures.length; i++) {
    const others = signatures[i][1];
    for (const ev of others) {
      const evStart = ev.Start ?? (ev as any).start;
      const exceptionDate = new Date(typeof evStart === 'string' ? evStart.replace('Z', '') : evStart);
      recurrenceExceptions.push(exceptionDate);

      if (!ev.isDelete) {
        restEvents.push(ev);
      }
    }
  }

  // Find latest slot date among all active slots in events
  let maxSlotDate: Date = start;
  for (const ev of events) {
    const evStart = ev.Start ?? (ev as any).start;
    const evDate = new Date(typeof evStart === 'string' ? evStart.replace('Z', '') : evStart);
    if (!isNaN(evDate.getTime()) && evDate > maxSlotDate) {
      maxSlotDate = evDate;
    }
  }

  // Identify any intermediate dates missing from active slots (e.g. single deleted occurrences)
  const existingDateSet = new Set(
    events.map((ev) => extractDateYMD(ev.Start ?? (ev as any).start))
  );

  const repeatType = String(baseEvent.Repeat ?? (baseEvent as any).repeat ?? "").toUpperCase();
  if (repeatType === "DAILY") {
    const stepDays = Number(baseEvent.RepeatInterval ?? (baseEvent as any).repeatInterval) || 1;
    const cur = new Date(start);
    cur.setDate(cur.getDate() + stepDays);
    while (cur < maxSlotDate) {
      const curDateStr = formatLocalDateToYMD(cur);
      if (!existingDateSet.has(curDateStr)) {
        recurrenceExceptions.push(
          new Date(cur.getFullYear(), cur.getMonth(), cur.getDate(), start.getHours(), start.getMinutes(), start.getSeconds(), start.getMilliseconds())
        );
      }
      cur.setDate(cur.getDate() + stepDays);
    }
  } else if (repeatType === "WEEKLY") {
    const weekDaysStr = String(baseEvent.RepeatOnWeekDays ?? (baseEvent as any).repeatOnWeekDays ?? "");
    const targetDays = new Set<number>();
    if (weekDaysStr) {
      weekDaysStr.split(",").forEach((d: string) => {
        const trimmed = d.trim().toUpperCase();
        if (/^\d+$/.test(trimmed)) {
          targetDays.add(Number(trimmed));
        } else {
          const map: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
          if (map[trimmed] !== undefined) targetDays.add(map[trimmed]);
        }
      });
    } else {
      targetDays.add(start.getDay());
    }

    const cur = new Date(start);
    cur.setDate(cur.getDate() + 1);
    while (cur < maxSlotDate) {
      if (targetDays.has(cur.getDay())) {
        const curDateStr = formatLocalDateToYMD(cur);
        if (!existingDateSet.has(curDateStr)) {
          recurrenceExceptions.push(
            new Date(cur.getFullYear(), cur.getMonth(), cur.getDate(), start.getHours(), start.getMinutes(), start.getSeconds(), start.getMilliseconds())
          );
        }
      }
      cur.setDate(cur.getDate() + 1);
    }
  }

  const slotId = baseEvent.SlotId ?? (baseEvent as any).slotId ?? (baseEvent as any).id;
  const taskId = baseEvent.TaskId ?? (baseEvent as any).taskId;
  const taskType = baseEvent.TaskType ?? (baseEvent as any).taskType ?? (baseEvent as any).type;
  const title = baseEvent.Title ?? (baseEvent as any).title;
  const titleDesc = baseEvent.TitleDesc ?? (baseEvent as any).titleDesc;
  const description = baseEvent.Description ?? (baseEvent as any).description;
  const repeat = baseEvent.Repeat ?? (baseEvent as any).repeat;
  const repeatEndAfterInterval = baseEvent.RepeatEndAfterInterval ?? (baseEvent as any).repeatEndAfterInterval ?? null;

  const schedulerEvents: SchedulerEvent[] = [
    {
      id: slotId,
      SlotId: slotId,
      TaskId: taskId,
      title: title || (taskType === "Available" ? "Available Slot" : "Event"),
      titleDesc: titleDesc,
      description: description,
      type: taskType,
      start,
      end,
      isAllDay: false,
      recurrenceRule: createRecurrenceRule(baseEvent, commonGroup.length, maxSlotDate),
      recurrenceExceptions,
      recurrenceId: parentRecurrenceId,
      RepeatEndAfterInterval: repeatEndAfterInterval,
      Repeat: repeat,
    },
  ];

  // Recursively transform the rest
  const childEvents = transformGroup(restEvents, slotId);
  schedulerEvents.push(...childEvents);

  return schedulerEvents;
}

export function transformApiToSchedulerEvents(apiEvents: ApiEvent[]): SchedulerEvent[] {
  const grouped = apiEvents.reduce<Record<number, ApiEvent[]>>((acc, ev) => {
    const taskId = (ev.TaskId ?? (ev as any).taskId) || 0;
    if (!acc[taskId]) acc[taskId] = [];
    acc[taskId].push(ev);
    return acc;
  }, {});

  const allEvents: SchedulerEvent[] = [];

  for (const taskId in grouped) {
    const group = grouped[taskId];
    const transformed = transformGroup(group, null);
    allEvents.push(...transformed);
  }

  return allEvents;
}
