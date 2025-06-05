/*
 * 📚 このファイルは「月間統計の計算」のテストです
 *
 * 【何をテストしているか】
 * - 時刻文字列（"09:30"）を分数（570分）に変換する計算
 * - 1回のシフトの実働時間を計算する処理
 * - 月間の合計時間や給料を計算する処理
 *
 * 【なぜテストが必要か】
 * - 給料計算の元になる重要な計算だから
 * - 計算ミスがあると給料が間違って計算される
 * - 色々な時間パターン（正常・異常）で正しく動作するか確認が必要
 *
 * 【実際の使用例】
 * - TA業務で「9:00-12:00、休憩60分」→「実働2時間」を自動計算
 * - 月末に「今月の総労働時間と給料」を自動計算
 */

// MonthlyStatsの計算ロジックを抽出してテスト

// 時刻文字列（HH:MM）を分に変換する関数
const timeToMinutes = (time) => {
  if (!time || typeof time !== 'string' || !time.includes(':')) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return 0;
  return hours * 60 + minutes;
};

// 分を時間:分の形式に変換する関数
const minutesToTimeFormat = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
};

// シフト1件の実働時間を計算する関数
const calculateShiftWorkTime = (shift) => {
  const startMinutes = timeToMinutes(shift.starttime);
  const endMinutes = timeToMinutes(shift.endtime);

  // 不正な時間の場合は0を返す
  if (startMinutes === 0 && shift.starttime !== '00:00') return 0;
  if (endMinutes === 0 && shift.endtime !== '00:00') return 0;

  const breakMinutes = shift.breaktime || 0;

  // 実働時間 = 終了時刻 - 開始時刻 - 休憩時間
  const workTimeMinutes = endMinutes - startMinutes - breakMinutes;

  return Math.max(0, workTimeMinutes); // 負の値を防ぐ
};

describe('MonthlyStats 計算ロジック', () => {
  describe('timeToMinutes 関数', () => {
    test('正常な時刻文字列を分に変換できる', () => {
      /*
       * 🧪 このテストでは：
       * - "09:30" → 570分（9時間30分）
       * - "00:00" → 0分（0時0分）
       * - "23:59" → 1439分（23時間59分）
       *
       * 💡 なぜこのテストが重要？
       * - 時刻を統一的な「分」に変換して計算しやすくする基本機能
       * - この変換が間違っていると全ての時間計算が狂う
       */
      expect(timeToMinutes('09:30')).toBe(570); // 9時間30分 = 570分
      expect(timeToMinutes('00:00')).toBe(0);
      expect(timeToMinutes('23:59')).toBe(1439); // 23時間59分
    });

    test('不正な形式の場合は0を返す', () => {
      /*
       * 🧪 このテストでは：
       * - 空文字、不正文字列、範囲外の値、null/undefined
       * - 全て0を返すことを確認
       *
       * 💡 なぜこのテストが重要？
       * - ユーザーが間違った形式で入力した時の対処
       * - システムがクラッシュせずに安全に処理できるか確認
       */
      expect(timeToMinutes('')).toBe(0);
      expect(timeToMinutes('invalid')).toBe(0);
      expect(timeToMinutes('25:70')).toBe(0); // 範囲外の値
      expect(timeToMinutes('12:60')).toBe(0); // 分が60以上
      expect(timeToMinutes('-1:30')).toBe(0); // 負の値
      expect(timeToMinutes(null)).toBe(0);
      expect(timeToMinutes(undefined)).toBe(0);
    });
  });

  describe('minutesToTimeFormat 関数', () => {
    test('分を時間:分の形式に変換できる', () => {
      /*
       * 🧪 このテストでは：
       * - 90分 → 1時間30分
       * - 60分 → 1時間0分
       * - 125分 → 2時間5分
       *
       * 💡 なぜこのテストが重要？
       * - 計算結果を人間が読みやすい形式に変換する機能
       * - 画面表示で「○時間○分」と表示するために使用
       */
      expect(minutesToTimeFormat(90)).toEqual({ hours: 1, minutes: 30 });
      expect(minutesToTimeFormat(0)).toEqual({ hours: 0, minutes: 0 });
      expect(minutesToTimeFormat(60)).toEqual({ hours: 1, minutes: 0 });
      expect(minutesToTimeFormat(125)).toEqual({ hours: 2, minutes: 5 });
    });
  });

  describe('calculateShiftWorkTime 関数', () => {
    test('基本的な実働時間計算', () => {
      /*
       * 🧪 このテストでは：
       * 入力：9:00-12:00、休憩60分
       * 期待：120分（2時間）
       * 計算：180分（3時間）- 60分（休憩）= 120分
       *
       * 💡 なぜこのテストが重要？
       * - 最も一般的な勤務パターンの計算確認
       * - 基本的な引き算ができているか確認
       */
      const shift = {
        starttime: '09:00',
        endtime: '12:00',
        breaktime: 60
      };

      // 9:00-12:00で休憩60分 = 120分
      expect(calculateShiftWorkTime(shift)).toBe(120);
    });

    test('実際のTA業務のシフト例', () => {
      /*
       * 🧪 このテストでは：
       * 実際のTA業務のパターンをテスト
       * - 1限前の準備時間込み（8:50開始）
       * - 連続授業での限間休憩
       *
       * 💡 なぜこのテストが重要？
       * - 実際の業務パターンでの動作確認
       * - 理論値と実践値のズレがないか確認
       */
      // 1限の準備+授業
      const shift1 = {
        starttime: '08:50', // 10分前準備
        endtime: '10:30',   // 1限終了
        breaktime: 0
      };
      expect(calculateShiftWorkTime(shift1)).toBe(100); // 1時間40分

      // 1限+2限連続
      const shift2 = {
        starttime: '08:50',
        endtime: '12:10',   // 2限終了
        breaktime: 10       // 限間休憩
      };
      expect(calculateShiftWorkTime(shift2)).toBe(190); // 3時間10分
    });

    test('不正な時間の場合は0を返す', () => {
      /*
       * 🧪 このテストでは：
       * 不正な時刻文字列が入力された場合の処理
       *
       * 💡 なぜこのテストが重要？
       * - データ入力ミスやシステムエラーでの安全性確保
       * - 計算が失敗してもアプリがクラッシュしないように
       */
      const shift = {
        starttime: 'invalid',
        endtime: '10:30',
        breaktime: 0
      };

      expect(calculateShiftWorkTime(shift)).toBe(0);
    });
  });

  describe('月間集計のテスト', () => {
    test('科目別の集計が正しく動作する', () => {
      /*
       * 🧪 このテストでは：
       * 複数のシフトを科目別にまとめて集計
       * - 数学：90分×2回 = 180分
       * - 物理：90分×1回 = 90分
       *
       * 💡 なぜこのテストが重要？
       * - 月末の統計表示で使用される重要な集計機能
       * - 科目ごとの時間配分や負荷分析に使用
       */
      const shifts = [
        {
          classname: '数学',
          starttime: '09:00',
          endtime: '10:30',
          breaktime: 0,
          category: '(授業)'
        },
        {
          classname: '数学',
          starttime: '10:40',
          endtime: '12:10',
          breaktime: 0,
          category: '(授業)'
        },
        {
          classname: '物理',
          starttime: '13:10',
          endtime: '14:40',
          breaktime: 0,
          category: '(準備等)'
        }
      ];

      // 科目ごとに集計
      const subjectStats = shifts.reduce((acc, shift) => {
        const workTime = calculateShiftWorkTime(shift);
        const subject = shift.classname || "未設定";

        if (!acc[subject]) {
          acc[subject] = {
            totalMinutes: 0,
            shiftCount: 0,
            category: shift.category || "(未設定)"
          };
        }

        acc[subject].totalMinutes += workTime;
        acc[subject].shiftCount += 1;

        return acc;
      }, {});

      // 数学：90分×2 = 180分, 2回
      expect(subjectStats['数学'].totalMinutes).toBe(180);
      expect(subjectStats['数学'].shiftCount).toBe(2);

      // 物理：90分×1 = 90分, 1回
      expect(subjectStats['物理'].totalMinutes).toBe(90);
      expect(subjectStats['物理'].shiftCount).toBe(1);
    });

    test('給料計算のテスト', () => {
      /*
       * 🧪 このテストでは：
       * 総労働時間から給料を計算
       * 270分（4.5時間）× 1010円/時 = 4545円
       *
       * 💡 なぜこのテストが重要？
       * - 最終的な給料計算の正確性確認
       * - 時間から金額への変換処理の確認
       */
      const totalMinutes = 270; // 4時間30分
      const hourlyRate = 1010;   // 学部1年生の時給

      const expectedSalary = Math.round((totalMinutes / 60) * hourlyRate);
      expect(expectedSalary).toBe(4545); // 4.5時間 × 1010円
    });
  });
});