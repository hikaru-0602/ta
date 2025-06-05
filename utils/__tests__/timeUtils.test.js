/*
 * 📚 このファイルは「時間計算」のテストです
 *
 * 【何をテストしているか】
 * - 時間の計算が正しく動作するかを確認
 * - 例：「9:00から12:00まで、休憩60分」→「実働2時間」の計算
 *
 * 【なぜテストが必要か】
 * - 時間の計算ミス = 給料の計算ミス に直結するため
 * - 様々なパターン（正常・異常）で動作確認が必要
 *
 * 【テストの流れ】
 * 1. 関数に値を入力
 * 2. 期待する結果と実際の結果を比較
 * 3. 一致すれば ✅ 成功、違えば ❌ 失敗
 */

// 時間計算のユーティリティ関数
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

// テストコード
describe('時間計算のテスト', () => {
  test('基本的な勤務時間計算', () => {
    /*
     * 🧪 このテストでは：
     * 入力：9:00〜12:00、休憩60分
     * 期待する結果：2時間0分
     *
     * 💡 なぜこのテストが重要？
     * - 最も一般的な勤務パターンだから
     * - この計算が間違っていると基本的な給料計算が全て狂う
     */
    const result = calculateWorkingTime('09:00', '12:00', 60);

    // 期待する結果：2時間0分
    expect(result.hours).toBe(2);
    expect(result.minutes).toBe(0);
  });

  test('休憩時間なしの場合', () => {
    /*
     * 🧪 このテストでは：
     * 入力：9:00〜10:30、休憩0分
     * 期待する結果：1時間30分
     *
     * 💡 なぜこのテストが重要？
     * - 短時間の仕事や準備時間の計算で使われる
     * - 休憩がない場合の処理が正しいか確認
     */
    const result = calculateWorkingTime('09:00', '10:30', 0);

    // 期待する結果：1時間30分
    expect(result.hours).toBe(1);
    expect(result.minutes).toBe(30);
  });

  test('時間が逆転している場合は0時間', () => {
    /*
     * 🧪 このテストでは：
     * 入力：12:00〜09:00（終了時刻が開始時刻より早い）
     * 期待する結果：0時間0分
     *
     * 💡 なぜこのテストが重要？
     * - ユーザーが間違って入力した場合の対処
     * - システムがクラッシュしないように異常値を処理
     */
    const result = calculateWorkingTime('12:00', '09:00', 0);

    // 期待する結果：0時間0分（異常値だから）
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
  });

  test('休憩時間が勤務時間より長い場合は0時間', () => {
    /*
     * 🧪 このテストでは：
     * 入力：9:00〜10:00（1時間）、休憩120分（2時間）
     * 期待する結果：0時間0分
     *
     * 💡 なぜこのテストが重要？
     * - 休憩時間の入力ミスを防ぐ
     * - マイナス時間にならないように保護
     */
    const result = calculateWorkingTime('09:00', '10:00', 120);

    // 期待する結果：0時間0分（休憩が長すぎるから）
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
  });
});