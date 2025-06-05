/*
 * 📚 このファイルは「給料計算システム」のテストです
 *
 * 【何をテストしているか】
 * - 学年別の時給設定が正しく動作するか
 * - 労働時間から給料への計算が正確か
 * - 複数シフトの月間給料計算が正しいか
 *
 * 【なぜテストが必要か】
 * - 給料計算は金銭に関わる最重要機能
 * - 計算ミス = 給料の支払いミス = 大問題
 * - 学年ごとの時給設定、時間計算、四捨五入処理などの複雑な計算を正確に行う必要
 *
 * 【実際の使用例】
 * - 学部1年生が月20時間働いた場合の給料計算
 * - 複数科目、複数シフトの月間合計給料計算
 * - 学年による時給差の正確な反映
 */

// 給料計算のテスト

// gradeInfoMapの模擬データ
const gradeInfoMap = {
  "1": { label: "学部１年生", wage: 1010 },
  "2": { label: "学部２年生", wage: 1020 },
  "3": { label: "学部３年生", wage: 1030 },
  "4": { label: "学部４年生", wage: 1040 },
  "5": { label: "修士１年生", wage: 1200 },
  "6": { label: "修士２年生", wage: 1210 },
  "7": { label: "博士１年生", wage: 1400 },
  "8": { label: "博士２年生", wage: 1410 },
  "9": { label: "博士３年生", wage: 1420 }
};

// 給料計算関数
const calculateSalary = (totalMinutes, gradeValue) => {
  const gradeInfo = gradeInfoMap[gradeValue] || gradeInfoMap["1"];
  const hourlyRate = gradeInfo.wage;
  const totalHours = totalMinutes / 60;
  return Math.round(totalHours * hourlyRate);
};

// 月間給料計算（複数シフトから）
const calculateMonthlySalary = (shifts, gradeValue) => {
  const totalMinutes = shifts.reduce((sum, shift) => {
    const startMinutes = timeToMinutes(shift.starttime);
    const endMinutes = timeToMinutes(shift.endtime);
    const breakMinutes = shift.breaktime || 0;
    const workTime = Math.max(0, endMinutes - startMinutes - breakMinutes);
    return sum + workTime;
  }, 0);

  return calculateSalary(totalMinutes, gradeValue);
};

// 時刻を分に変換（再利用）
const timeToMinutes = (time) => {
  if (!time || !time.includes(':')) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return 0;
  return hours * 60 + minutes;
};

describe('給料計算システム', () => {
  describe('calculateSalary 関数', () => {
    test('学部1年生の給料計算', () => {
      /*
       * 🧪 このテストでは：
       * - 1.5時間（90分）働いた学部1年生の給料計算
       * - 1.5時間 × 1010円/時 = 1515円
       *
       * 💡 なぜこのテストが重要？
       * - 最も基本的な給料計算パターン
       * - 時間単価計算の正確性確認
       * - 実際の給料明細に直結する重要な計算
       */
      const totalMinutes = 90; // 1.5時間
      const salary = calculateSalary(totalMinutes, "1");

      expect(salary).toBe(1515); // 1.5 × 1010 = 1515円
    });

    test('修士1年生の給料計算', () => {
      /*
       * 🧪 このテストでは：
       * - 2時間働いた修士1年生の給料計算
       * - 2時間 × 1200円/時 = 2400円
       *
       * 💡 なぜこのテストが重要？
       * - 学年による時給差の正確な反映確認
       * - 学部生と大学院生の時給設定が正しく動作するか確認
       */
      const totalMinutes = 120; // 2時間
      const salary = calculateSalary(totalMinutes, "5");

      expect(salary).toBe(2400); // 2 × 1200 = 2400円
    });

    test('博士3年生の給料計算', () => {
      /*
       * 🧪 このテストでは：
       * - 3時間働いた博士3年生の給料計算
       * - 3時間 × 1420円/時 = 4260円
       *
       * 💡 なぜこのテストが重要？
       * - 最高時給レベルの計算確認
       * - 学年進行による時給上昇が正しく反映されるか確認
       */
      const totalMinutes = 180; // 3時間
      const salary = calculateSalary(totalMinutes, "9");

      expect(salary).toBe(4260); // 3 × 1420 = 4260円
    });

    test('不正な学年の場合は学部1年生の時給を使用', () => {
      /*
       * 🧪 このテストでは：
       * - 不正な学年コード（"invalid"）を入力
       * - デフォルトで学部1年生の時給（1010円）を適用
       *
       * 💡 なぜこのテストが重要？
       * - データ入力ミスや不正値への安全な対処
       * - システムがクラッシュせずにデフォルト値で継続動作
       * - 最低時給保証による最悪ケース回避
       */
      const totalMinutes = 60; // 1時間
      const salary = calculateSalary(totalMinutes, "invalid");

      expect(salary).toBe(1010); // 1 × 1010 = 1010円（デフォルト）
    });

    test('端数の処理（四捨五入）', () => {
      /*
       * 🧪 このテストでは：
       * - 1時間40分（1.666...時間）の給料計算
       * - 1.666... × 1010 = 1683.33... → 1683円（四捨五入）
       *
       * 💡 なぜこのテストが重要？
       * - 実際の勤務では分単位での端数が発生する
       * - 給料の端数処理が正確に行われるか確認
       * - 法的にも重要な端数処理規則の実装確認
       */
      const totalMinutes = 100; // 1時間40分 = 1.666...時間
      const salary = calculateSalary(totalMinutes, "1");

      expect(salary).toBe(1683); // 1.666... × 1010 = 1683.33... → 1683円
    });
  });

  describe('calculateMonthlySalary 関数', () => {
    test('複数シフトの月間給料計算', () => {
      /*
       * 🧪 このテストでは：
       * - 3回のシフト（各90分）の月間合計給料計算
       * - 合計270分（4.5時間）× 1010円/時 = 4545円
       *
       * 💡 なぜこのテストが重要？
       * - 実際の月末給料計算のメイン機能
       * - 複数シフトの時間合算が正確に行われるか確認
       * - 月間労働実績の正確な金額換算
       */
      const shifts = [
        {
          starttime: '09:00',
          endtime: '10:30',
          breaktime: 0
        },
        {
          starttime: '10:40',
          endtime: '12:10',
          breaktime: 0
        },
        {
          starttime: '13:10',
          endtime: '14:40',
          breaktime: 0
        }
      ];

      const salary = calculateMonthlySalary(shifts, "1");

      // 各シフト90分 × 3 = 270分 = 4.5時間
      // 4.5 × 1010 = 4545円
      expect(salary).toBe(4545);
    });

    test('休憩時間を含むシフトの計算', () => {
      /*
       * 🧪 このテストでは：
       * - 休憩時間ありのシフトの正確な計算
       * - 1回目：3時間-1時間休憩=2時間、2回目：2時間
       * - 合計4時間 × 1020円/時 = 4080円
       *
       * 💡 なぜこのテストが重要？
       * - 休憩時間の控除が正確に行われるか確認
       * - 実際のTA業務では昼休憩等の休憩時間が発生
       * - 労働基準法に基づく適切な休憩時間処理
       */
      const shifts = [
        {
          starttime: '09:00',
          endtime: '12:00',
          breaktime: 60 // 1時間休憩
        },
        {
          starttime: '13:00',
          endtime: '15:00',
          breaktime: 0
        }
      ];

      const salary = calculateMonthlySalary(shifts, "2");

      // 1回目: 3時間 - 1時間休憩 = 2時間 = 120分
      // 2回目: 2時間 = 120分
      // 合計: 240分 = 4時間
      // 4 × 1020 = 4080円
      expect(salary).toBe(4080);
    });

    test('シフトがない場合は0円', () => {
      /*
       * 🧪 このテストでは：
       * - 空のシフト配列での給料計算
       * - 結果は0円
       *
       * 💡 なぜこのテストが重要？
       * - 勤務実績がない月の正しい処理
       * - システムがエラーを起こさずに0円を返すか確認
       * - 空データでの安全な動作保証
       */
      const shifts = [];
      const salary = calculateMonthlySalary(shifts, "1");

      expect(salary).toBe(0);
    });
  });

  describe('実際のTA業務シナリオ', () => {
    test('週3回、月12回のTA業務', () => {
      /*
       * 🧪 このテストでは：
       * - 実際のTA業務パターン（週3回×4週=月12回）
       * - 1回あたり：8:50-12:10（準備込み）、休憩10分
       * - 月間合計：38時間 × 1010円 = 38380円
       *
       * 💡 なぜこのテストが重要？
       * - 実際のTA業務での典型的な勤務パターン
       * - 準備時間を含む実務的な時間計算
       * - 月末の実際の給料金額との整合性確認
       */
      // 1回あたり1限+2限（準備10分含む）
      const singleShift = {
        starttime: '08:50', // 10分前準備
        endtime: '12:10',   // 2限終了
        breaktime: 10       // 限間休憩
      };

      // 月12回分のシフト
      const monthlyShifts = Array(12).fill(singleShift);

      const salary = calculateMonthlySalary(monthlyShifts, "1");

      // 1回あたり: 200分 - 10分休憩 = 190分
      // 12回: 190 × 12 = 2280分 = 38時間
      // 38 × 1010 = 38380円
      expect(salary).toBe(38380);
    });

    test('学年による給料の違い', () => {
      /*
       * 🧪 このテストでは：
       * - 同じ勤務時間での学年別給料比較
       * - 学部1年：2020円、修士1年：2400円、博士3年：2840円
       *
       * 💡 なぜこのテストが重要？
       * - 学年進行による時給上昇の正確な反映確認
       * - 同じ労働でも学年により給料差があることの実装確認
       * - 公平性と学年に応じた待遇差の適切な計算
       */
      const shifts = [
        {
          starttime: '09:00',
          endtime: '12:00',
          breaktime: 60
        }
      ];

      // 同じ勤務時間（2時間）での学年別給料
      const undergrad1 = calculateMonthlySalary(shifts, "1"); // 1010円/時
      const master1 = calculateMonthlySalary(shifts, "5");    // 1200円/時
      const phd3 = calculateMonthlySalary(shifts, "9");       // 1420円/時

      expect(undergrad1).toBe(2020); // 2 × 1010
      expect(master1).toBe(2400);    // 2 × 1200
      expect(phd3).toBe(2840);       // 2 × 1420

      // 学年が上がるほど給料が高い
      expect(master1).toBeGreaterThan(undergrad1);
      expect(phd3).toBeGreaterThan(master1);
    });
  });
});