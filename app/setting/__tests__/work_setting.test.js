// テスト対象の関数を直接テスト（カスタムフックから抽出）
const calculateWorkingTime = (startTime, endTime, breakTime) => {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;
  const workingMinutes = Math.max(
    0,
    endTotalMinutes - startTotalMinutes - breakTime
  );

  return {
    hours: Math.floor(workingMinutes / 60),
    minutes: workingMinutes % 60,
  };
};

const calculateStartEndTimes = (periods) => {
  const periodTimes = {
    "1限": { start: "09:00", end: "10:30" },
    "2限": { start: "10:40", end: "12:10" },
    "3限": { start: "13:10", end: "14:40" },
    "4限": { start: "14:50", end: "16:20" },
    "5限": { start: "16:30", end: "18:00" },
    "6限": { start: "18:10", end: "19:40" },
  };

  if (periods.length === 0) {
    return {
      startTime: "09:00",
      endTime: "10:00",
      breakTime: 0,
    };
  }

  const startTime = periodTimes[periods[0]].start;
  const endTime = periodTimes[periods[periods.length - 1]].end;

  let totalBreakTime = 0;

  for (let i = 0; i < periods.length - 1; i++) {
    const currentEnd = periodTimes[periods[i]].end;
    const nextStart = periodTimes[periods[i + 1]].start;

    const [currentEndHour, currentEndMinute] = currentEnd.split(":").map(Number);
    const [nextStartHour, nextStartMinute] = nextStart.split(":").map(Number);
    const breakTime = (nextStartHour * 60 + nextStartMinute) - (currentEndHour * 60 + currentEndMinute);

    totalBreakTime += breakTime;
  }

  return { startTime, endTime, breakTime: totalBreakTime };
};

describe('work_setting の計算ロジック', () => {
  describe('calculateWorkingTime 関数', () => {
    test('正常な勤務時間を計算できる', () => {
      const result = calculateWorkingTime('09:00', '12:00', 60);

      expect(result.hours).toBe(2);
      expect(result.minutes).toBe(0);
    });

    test('休憩時間が0の場合も正しく計算できる', () => {
      const result = calculateWorkingTime('09:00', '10:30', 0);

      expect(result.hours).toBe(1);
      expect(result.minutes).toBe(30);
    });

    test('開始時刻が終了時刻より遅い場合は0時間0分を返す', () => {
      const result = calculateWorkingTime('12:00', '09:00', 0);

      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
    });

    test('休憩時間が勤務時間より長い場合は0時間0分を返す', () => {
      const result = calculateWorkingTime('09:00', '10:00', 120);

      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
    });
  });

  describe('calculateStartEndTimes 関数', () => {
    test('1限の開始終了時間を正しく計算できる', () => {
      const times = calculateStartEndTimes(['1限']);

      expect(times.startTime).toBe('09:00');
      expect(times.endTime).toBe('10:30');
      expect(times.breakTime).toBe(0);
    });

    test('連続する時限の休憩時間を正しく計算できる', () => {
      const times = calculateStartEndTimes(['1限', '2限']);

      expect(times.startTime).toBe('09:00');
      expect(times.endTime).toBe('12:10');
      expect(times.breakTime).toBe(10); // 1限終了(10:30)と2限開始(10:40)の間は10分
    });

    test('空の配列の場合はデフォルト値を返す', () => {
      const times = calculateStartEndTimes([]);

      expect(times.startTime).toBe('09:00');
      expect(times.endTime).toBe('10:00');
      expect(times.breakTime).toBe(0);
    });

    test('非連続の時限の休憩時間を正しく計算できる', () => {
      const times = calculateStartEndTimes(['1限', '3限']);

      expect(times.startTime).toBe('09:00');
      expect(times.endTime).toBe('14:40');
      expect(times.breakTime).toBe(160); // 1限終了(10:30)と3限開始(13:10)の間は160分
    });

    test('3限から5限までの計算', () => {
      const times = calculateStartEndTimes(['3限', '4限', '5限']);

      expect(times.startTime).toBe('13:10');
      expect(times.endTime).toBe('18:00');
      expect(times.breakTime).toBe(20); // 3-4限間10分 + 4-5限間10分 = 20分
    });
  });
});