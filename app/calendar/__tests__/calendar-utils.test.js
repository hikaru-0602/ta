// カレンダー関連のユーティリティ関数をテスト

// 日付関連のユーティリティ関数
const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month - 1, 1).getDay();
};

const isToday = (date, year, month) => {
  const today = new Date();
  return (
    date === today.getDate() &&
    month === today.getMonth() + 1 &&
    year === today.getFullYear()
  );
};

const formatDate = (year, month, date) => {
  return `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
};

// シフトデータのフィルタリング
const getShiftsForDate = (shiftData, year, month, date) => {
  return shiftData.filter(shift =>
    shift.year === year &&
    shift.month === month &&
    shift.date === date
  );
};

describe('カレンダー ユーティリティ関数', () => {
  describe('getDaysInMonth 関数', () => {
    test('各月の日数を正しく取得できる', () => {
      expect(getDaysInMonth(2024, 1)).toBe(31); // 1月
      expect(getDaysInMonth(2024, 2)).toBe(29); // 2月（うるう年）
      expect(getDaysInMonth(2023, 2)).toBe(28); // 2月（平年）
      expect(getDaysInMonth(2024, 4)).toBe(30); // 4月
      expect(getDaysInMonth(2024, 12)).toBe(31); // 12月
    });
  });

  describe('getFirstDayOfMonth 関数', () => {
    test('月の最初の日の曜日を正しく取得できる', () => {
      // 2024年1月1日は月曜日（1）
      expect(getFirstDayOfMonth(2024, 1)).toBe(1);

      // 2024年4月1日は月曜日（1）
      expect(getFirstDayOfMonth(2024, 4)).toBe(1);
    });
  });

  describe('isToday 関数', () => {
    test('今日の日付を正しく判定できる', () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const date = today.getDate();

      expect(isToday(date, year, month)).toBe(true);
      expect(isToday(date + 1, year, month)).toBe(false);
      expect(isToday(date, year, month + 1)).toBe(false);
    });
  });

  describe('formatDate 関数', () => {
    test('日付を正しい形式でフォーマットできる', () => {
      expect(formatDate(2024, 1, 5)).toBe('2024-01-05');
      expect(formatDate(2024, 12, 25)).toBe('2024-12-25');
      expect(formatDate(2024, 3, 1)).toBe('2024-03-01');
    });
  });

  describe('getShiftsForDate 関数', () => {
    const mockShiftData = [
      {
        year: 2024,
        month: 1,
        date: 15,
        classname: '数学',
        starttime: '09:00',
        endtime: '10:30'
      },
      {
        year: 2024,
        month: 1,
        date: 15,
        classname: '物理',
        starttime: '10:40',
        endtime: '12:10'
      },
      {
        year: 2024,
        month: 1,
        date: 16,
        classname: '化学',
        starttime: '13:10',
        endtime: '14:40'
      }
    ];

    test('指定した日付のシフトを正しく取得できる', () => {
      const shifts = getShiftsForDate(mockShiftData, 2024, 1, 15);

      expect(shifts).toHaveLength(2);
      expect(shifts[0].classname).toBe('数学');
      expect(shifts[1].classname).toBe('物理');
    });

    test('シフトがない日付では空配列を返す', () => {
      const shifts = getShiftsForDate(mockShiftData, 2024, 1, 20);

      expect(shifts).toHaveLength(0);
    });

    test('異なる月のシフトは取得されない', () => {
      const shifts = getShiftsForDate(mockShiftData, 2024, 2, 15);

      expect(shifts).toHaveLength(0);
    });
  });

  describe('カレンダー表示のテスト', () => {
    test('月のカレンダーグリッドを正しく生成できる', () => {
      const year = 2024;
      const month = 1; // 1月
      const daysInMonth = getDaysInMonth(year, month);
      const firstDay = getFirstDayOfMonth(year, month);

      // カレンダーグリッドの生成ロジック
      const calendarGrid = [];

      // 前月の日付で埋める
      for (let i = 0; i < firstDay; i++) {
        calendarGrid.push(null);
      }

      // 当月の日付を追加
      for (let date = 1; date <= daysInMonth; date++) {
        calendarGrid.push(date);
      }

      expect(calendarGrid[firstDay]).toBe(1); // 最初の日付
      expect(calendarGrid[firstDay + daysInMonth - 1]).toBe(daysInMonth); // 最後の日付
      expect(calendarGrid.filter(day => day !== null)).toHaveLength(daysInMonth);
    });
  });
});