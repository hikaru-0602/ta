"use client";

import React, { useState } from "react";
import { Shift, gradeInfoMap } from "../types";
import { useUserInfo } from "../setting/user_setting";
import { useAuth } from "../firebase/context/auth";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/lib/firebase";
import { useAlert } from "./AlertProvider";
import ExportDialog, {
  handleCloseExportDialog,
  handleExportSubject,
} from "../calendar/export_dialog";

interface MonthlyStatsProps {
  currentDate: Date;
  shiftData: Shift[];
}

// 時刻文字列（HH:MM）を分に変換する関数
const timeToMinutes = (time: string): number => {
  if (!time || !time.includes(':')) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return 0;
  return hours * 60 + minutes;
};

// 分を時間:分の形式に変換する関数
const minutesToTimeFormat = (totalMinutes: number): { hours: number; minutes: number } => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
};

// シフト1件の実働時間を計算する関数
const calculateShiftWorkTime = (shift: Shift): number => {
  const startMinutes = timeToMinutes(shift.starttime);
  const endMinutes = timeToMinutes(shift.endtime);
  const breakMinutes = shift.breaktime || 0;

  // 実働時間 = 終了時刻 - 開始時刻 - 休憩時間
  const workTimeMinutes = endMinutes - startMinutes - breakMinutes;

  return Math.max(0, workTimeMinutes); // 負の値を防ぐ
};

// 科目ごとの色を生成する関数
const getSubjectColor = (index: number): string => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500"
  ];
  return colors[index % colors.length];
};

const MonthlyStats: React.FC<MonthlyStatsProps> = ({ currentDate, shiftData }) => {
  const { userInfo } = useUserInfo();
  const user = useAuth();
  const { showAlert } = useAlert();

  // Excel出力用の状態
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [subjectNames, setSubjectNames] = useState<string[]>([]);

  // 現在表示している月のシフトデータをフィルタリング
  const currentMonthShifts = shiftData.filter(
    (shift) =>
      shift.year === currentDate.getFullYear() &&
      shift.month === currentDate.getMonth() + 1
  );

  // シフト出力ボタンのクリックハンドラー
  const handleOpenExportDialog = async () => {
    if (!user) {
      showAlert("認証エラー", "ユーザ情報を登録してください");
      return;
    }

    // Firestoreからユーザー情報を取得
    const uid = getAuth().currentUser?.uid;
    if (!uid) {
      showAlert("認証エラー", "ログインしてください");
      return;
    }

    try {
      const userRef = doc(db, `users/${uid}`);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        showAlert("設定エラー", "ユーザ情報を登録してください");
        return;
      }

      const userData = userSnap.data();

      if (
        !userData ||
        !userData.id ||
        !userData.name ||
        !userData.value ||
        !userData.name_kana
      ) {
        showAlert("設定エラー", "ユーザ情報を登録してください");
        return;
      }

      //科目名のリストを取得（重複を排除）
      const uniqueSubjectNames = Array.from(
        new Set(currentMonthShifts.map((shift) => shift.classname))
      );

      setSubjectNames(uniqueSubjectNames); //科目名リストを状態に保存
      setIsExportDialogOpen(true); //ダイアログを開く
    } catch (error) {
      console.error("エラーが発生しました:", error);
      showAlert("システムエラー", "エラーが発生しました。後でもう一度お試しください。");
    }
  };

  // 科目ごとに集計
  const subjectStats = currentMonthShifts.reduce((acc, shift) => {
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
  }, {} as Record<string, { totalMinutes: number; shiftCount: number; category: string }>);

  // 全体統計
  const totalMinutes = Object.values(subjectStats).reduce((sum, stat) => sum + stat.totalMinutes, 0);
  const totalHours = minutesToTimeFormat(totalMinutes);

  // gradeInfoMapから時給を取得
  const gradeInfo = gradeInfoMap[userInfo.value] || gradeInfoMap["1"]; // デフォルトは学部1年生
  const hourlyRate = gradeInfo.wage;
  const totalSalary = Math.round((totalMinutes / 60) * hourlyRate);

  // 科目一覧（統計がある科目のみ）
  const subjects = Object.entries(subjectStats);

  if (currentMonthShifts.length === 0) {
    return (
      <div className="w-full max-w-[1200px] mt-8">
        <div className="bg-card text-card-foreground p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月の統計
            </h3>
            <button
              onClick={handleOpenExportDialog}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              disabled={currentMonthShifts.length === 0}
            >
              Excel出力
            </button>
          </div>
          <p className="text-muted-foreground text-center py-8">
            この月にはシフトデータがありません
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mt-8">
      <div className="bg-card text-card-foreground p-6 rounded-lg border border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月の統計
          </h3>
          <button
            onClick={handleOpenExportDialog}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Excel出力
          </button>
        </div>

        {/* 全体統計 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="text-sm font-medium text-primary mb-1">総実働時間</div>
            <div className="text-2xl font-bold text-foreground">
              {totalHours.hours}時間{totalHours.minutes}分
            </div>
          </div>

          <div className="bg-secondary/20 border border-secondary/30 rounded-lg p-4">
            <div className="text-sm font-medium text-secondary-foreground mb-1">総シフト回数</div>
            <div className="text-2xl font-bold text-foreground">
              {currentMonthShifts.length}回
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">推定給料</div>
            <div className="text-2xl font-bold text-foreground">
              ¥{totalSalary.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 科目別統計 */}
        {subjects.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-foreground mb-4">科目別詳細</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(([subject, stats], index) => {
                const subjectHours = minutesToTimeFormat(stats.totalMinutes);
                const subjectSalary = Math.round((stats.totalMinutes / 60) * hourlyRate);
                const percentage = totalMinutes > 0 ? Math.round((stats.totalMinutes / totalMinutes) * 100) : 0;

                return (
                  <div
                    key={subject}
                    className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${getSubjectColor(index)}`}
                        />
                        <span className="font-medium text-foreground text-sm">{subject}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{percentage}%</span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">{stats.category}</div>
                      <div className="font-semibold text-foreground">
                        {subjectHours.hours}h {subjectHours.minutes}m
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stats.shiftCount}回 • ¥{subjectSalary.toLocaleString()}
                      </div>
                    </div>

                    {/* プログレスバー */}
                    <div className="mt-3">
                      <div className="w-full bg-secondary/20 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getSubjectColor(index)} opacity-80`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Excel出力ダイアログ */}
      <ExportDialog
        isExportDialogOpen={isExportDialogOpen}
        subjectNames={subjectNames}
        handleExportSubject={handleExportSubject}
        handleCloseExportDialog={handleCloseExportDialog}
        shiftData={shiftData}
        currentDate={currentDate}
        setIsExportDialogOpen={setIsExportDialogOpen}
      />
    </div>
  );
};

export default MonthlyStats;