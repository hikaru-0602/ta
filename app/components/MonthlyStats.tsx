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
import { Button } from "@/components/ui/button";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// ドーナツグラフの中央にテキストを表示するプラグイン
const centerTextPlugin = {
  id: 'centerText',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeDraw: function(chart: any) {
    if (chart.config.options.plugins.centerText && chart.config.options.plugins.centerText.display) {
      const { ctx, chartArea: { top, left, width, height } } = chart;
      const centerX = left + width / 2;
      const centerY = top + height / 2;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // ダークモード対応の色取得
      const isDarkMode = document.documentElement.classList.contains('dark');

      // メインテキスト
      ctx.fillStyle = isDarkMode ? '#ffffff' : '#000000';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(chart.config.options.plugins.centerText.text, centerX, centerY - 10);

      // サブテキスト
      if (chart.config.options.plugins.centerText.subText) {
        ctx.fillStyle = isDarkMode ? '#9ca3af' : '#666666';
        ctx.font = '12px Arial';
        ctx.fillText(chart.config.options.plugins.centerText.subText, centerX, centerY + 15);
      }

      ctx.restore();
    }
  }
};

ChartJS.register(centerTextPlugin);

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
    "#3b82f6", // blue-500
    "#22c55e", // green-500
    "#a855f7", // purple-500
    "#eab308", // yellow-500
    "#ec4899", // pink-500
    "#6366f1", // indigo-500
    "#ef4444", // red-500
    "#14b8a6", // teal-500
    "#f97316", // orange-500
    "#06b6d4", // cyan-500
  ];
  return colors[index % colors.length];
};

// 科目ごとの色を生成する関数（Tailwind用）
const getSubjectTailwindColor = (index: number): string => {
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
  const auth = useAuth();
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
    if (!auth.user) {
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
            <Button
              onClick={handleOpenExportDialog}
              disabled={currentMonthShifts.length === 0}
            >
              Excel出力
            </Button>
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
          <Button
            onClick={handleOpenExportDialog}
          >
            Excel出力
          </Button>
        </div>

        {/* 科目別統計（新しいグラフ表示） */}
        {subjects.length > 0 && (
          <div>
            {/* ドーナツグラフ：実働時間 */}
            <div className="flex flex-col items-center mb-8">
              <div className="p-6 w-full max-w-md">
                <h5 className="text-sm font-medium text-foreground mb-4 text-center">実働時間</h5>
                <div className="h-64">
                  <Doughnut
                    key={`${currentDate.getFullYear()}-${currentDate.getMonth()}`}
                    data={{
                      labels: subjects.map(([subject]) => subject),
                      datasets: [
                        {
                          data: subjects.map(([, stats]) => stats.totalMinutes),
                          backgroundColor: subjects.map((_, index) => getSubjectColor(index)),
                          borderColor: subjects.map((_, index) => getSubjectColor(index)),
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '80%',
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            label: function(context: any) {
                              const minutes = context.parsed;
                              const hours = Math.floor(minutes / 60);
                              const remainingMinutes = minutes % 60;
                              return `${context.label}: ${hours}時間${remainingMinutes}分`;
                            }
                          }
                        },
                        centerText: {
                          display: true,
                          text: `${totalHours.hours}h ${totalHours.minutes}m `,
                          subText: '合計実働時間'
                        }
                      },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any}
                  />
                </div>
              </div>
            </div>

            {/* 科目別サマリーテーブル */}
            <div className="bg-background border border-border rounded-lg p-6">
              {/* 推定給料表示 */}
              <div className="mb-6 pb-4 border-b border-border">
                <div className="text-center">
                  <div className="text-sm font-medium text-muted-foreground mb-1">推定給料</div>
                  <div className="text-2xl font-semibold text-foreground">
                    ¥{totalSalary.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* 科目別詳細表 */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-foreground">科目</th>
                      <th className="text-right py-3 px-4 font-medium text-foreground">勤務時間</th>
                      <th className="text-right py-3 px-4 font-medium text-foreground">勤務回数</th>
                      <th className="text-right py-3 px-4 font-medium text-foreground">給料</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(([subject, stats], index) => {
                      const subjectHours = minutesToTimeFormat(stats.totalMinutes);
                      const subjectSalary = Math.round((stats.totalMinutes / 60) * hourlyRate);

                      return (
                        <tr key={subject} className="border-b border-border hover:bg-secondary/5">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-4 h-4 rounded-full ${getSubjectTailwindColor(index)}`}
                              />
                              <div>
                                <div className="font-medium text-foreground">{subject}</div>
                                <div className="text-xs text-muted-foreground">{stats.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-foreground">
                            {subjectHours.hours}h {subjectHours.minutes}m
                          </td>
                          <td className="py-3 px-4 text-right text-foreground">
                            {stats.shiftCount}回
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-foreground">
                            ¥{subjectSalary.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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