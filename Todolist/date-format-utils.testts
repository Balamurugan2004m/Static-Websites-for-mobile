import { getMaxDaysInMonth, formatAndLimitDateInput, formatDisplayDate } from "./date-format-utils";

describe("getMaxDaysInMonth", () => {
  it("returns 31 for January, March, May, July, August, October, December", () => {
    expect(getMaxDaysInMonth(1)).toBe(31);
    expect(getMaxDaysInMonth(3)).toBe(31);
    expect(getMaxDaysInMonth(5)).toBe(31);
    expect(getMaxDaysInMonth(7)).toBe(31);
    expect(getMaxDaysInMonth(8)).toBe(31);
    expect(getMaxDaysInMonth(10)).toBe(31);
    expect(getMaxDaysInMonth(12)).toBe(31);
  });

  it("returns 30 for April, June, September, November", () => {
    expect(getMaxDaysInMonth(4)).toBe(30);
    expect(getMaxDaysInMonth(6)).toBe(30);
    expect(getMaxDaysInMonth(9)).toBe(30);
    expect(getMaxDaysInMonth(11)).toBe(30);
  });

  it("returns 29 for February in leap years and 28 in non-leap years", () => {
    expect(getMaxDaysInMonth(2, 2024)).toBe(29);
    expect(getMaxDaysInMonth(2, 2026)).toBe(28);
    expect(getMaxDaysInMonth(2, 2000)).toBe(29);
    expect(getMaxDaysInMonth(2, 1900)).toBe(28);
    expect(getMaxDaysInMonth(2)).toBe(29); // when year not provided yet
  });
});

describe("formatAndLimitDateInput", () => {
  it("limits month to 12 when exceeding 12", () => {
    expect(formatAndLimitDateInput("66/66/6666")).toBe("12/31/6666");
    expect(formatAndLimitDateInput("73/49/9997")).toBe("12/31/9997");
  });

  it("limits day to max days of the month", () => {
    // December has 31 days
    expect(formatAndLimitDateInput("12/34/5677")).toBe("12/31/5677");
    // April has 30 days
    expect(formatAndLimitDateInput("04/31/2026")).toBe("04/30/2026");
    // February non-leap has 28 days
    expect(formatAndLimitDateInput("02/29/2026")).toBe("02/28/2026");
    // February leap has 29 days
    expect(formatAndLimitDateInput("02/29/2024")).toBe("02/29/2024");
  });

  it("auto-prefixes single digit > 1 for month", () => {
    expect(formatAndLimitDateInput("6")).toBe("06/");
    expect(formatAndLimitDateInput("2")).toBe("02/");
    expect(formatAndLimitDateInput("0")).toBe("0");
    expect(formatAndLimitDateInput("1")).toBe("1");
    expect(formatAndLimitDateInput("12")).toBe("12/");
  });

  it("handles typing year digits sequentially without clearing", () => {
    expect(formatAndLimitDateInput("12/15/2", "12/15/")).toBe("12/15/2");
    expect(formatAndLimitDateInput("12/15/20", "12/15/2")).toBe("12/15/20");
    expect(formatAndLimitDateInput("12/15/202", "12/15/20")).toBe("12/15/202");
    expect(formatAndLimitDateInput("12/15/2026", "12/15/202")).toBe("12/15/2026");
  });

  it("handles backspacing without getting stuck on slash", () => {
    expect(formatAndLimitDateInput("12/3", "12/31/")).toBe("12/3");
    expect(formatAndLimitDateInput("12", "12/")).toBe("1");
  });
});

describe("formatDisplayDate", () => {
  it("formats ISO string and clamps invalid month/day", () => {
    expect(formatDisplayDate("2026-10-20T00:00:00.000Z")).toBe("10/20/2026");
    expect(formatDisplayDate("2026-04-31")).toBe("04/30/2026");
  });

  it("preserves partially typed year while user is typing", () => {
    expect(formatDisplayDate("10/20/2")).toBe("10/20/2");
    expect(formatDisplayDate("10/20/20")).toBe("10/20/20");
    expect(formatDisplayDate("10/20/202")).toBe("10/20/202");
    expect(formatDisplayDate("10/20/2026")).toBe("10/20/2026");
  });

  it("filters out uninitialized dates with year < 1753", () => {
    expect(formatDisplayDate("0001-01-01T00:00:00.000Z")).toBe("");
    expect(formatDisplayDate("0000-12-31T18:06:32.000Z")).toBe("");
    expect(formatDisplayDate("01/01/0001")).toBe("");
  });
});
