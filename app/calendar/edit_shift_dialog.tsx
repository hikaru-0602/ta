import React, { useState } from "react";
import { Shift } from "../types"; //業務データの型をインポート
import { getAuth } from "firebase/auth";
import { saveWorkDataToFirestore } from "./add_shift_dialog"; //Firestoreに保存する関数をインポート
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

//編集対象のシフトを設定し、編集ダイアログを開く関数
export const handleEditShift = (
  shift: Shift, //編集対象のシフトデータ
  setEditingShift: (shift: Shift) => void, //編集対象のシフトを設定する関数
  setIsEditDialogOpen: (isOpen: boolean) => void //編集ダイアログを開く関数
) => {
  setEditingShift(shift); //編集対象のシフトを設定
  setIsEditDialogOpen(true); //編集ダイアログを開く
};

//編集されたシフトを保存する関数
export const handleSaveEditedShift = (
  editingShift: Shift, //編集されたシフトデータ
  shiftData: Shift[], //既存のシフトデータ
  setShiftData: (shift: Shift[]) => void, //シフトデータを更新する関数
  saveShiftsToLocalStorage: (shift: Shift[]) => void, //シフトデータをlocalStorageに保存する関数（互換性のため残す）
  setIsEditDialogOpen: (isOpen: boolean) => void //編集ダイアログを閉じる関数
) => {
  console.log("handleSaveEditedShift called"); //関数が呼び出されたことを確認するためのログ
  if (!editingShift) return; //編集対象がない場合は処理を終了

  // 日付と科目名が一致するシフトデータのみ更新
  console.log("Editing Shift:", editingShift); //編集対象のシフトデータをログに出力
  const updatedShifts = shiftData.map((shift) =>
    shift.day === editingShift.day &&
    shift.id === editingShift.id &&
    shift.year === editingShift.year &&
    shift.month === editingShift.month
      ? { ...shift, ...editingShift } // 編集内容を反映
      : shift
  );

  setShiftData(updatedShifts); //状態を更新
  const uid = getAuth().currentUser?.uid; //現在のユーザーのUIDを取得
  if (uid) {
    saveWorkDataToFirestore(uid, editingShift);
  }
  console.log("Updated Shifts:", updatedShifts); //更新後のシフトデータをログに出力
  // リアルタイム監視により自動保存されるため、localStorageへの保存は不要
  setIsEditDialogOpen(false); //編集ダイアログを閉じる
};

// 時刻文字列（HH:MM）を分に変換する関数
const timeToMinutes = (time: string): number => {
  if (!time || !time.includes(':')) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return 0;
  return hours * 60 + minutes;
};

// 分を時間:分の形式に変換する関数
const minutesToTimeFormat = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}時間${minutes}分`;
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

// 週の開始日（月曜日）を取得する関数
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 月曜日を週の開始とする
  return new Date(d.setDate(diff));
};

// 週の終了日（日曜日）を取得する関数
const getWeekEnd = (date: Date): Date => {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
};

// 週の合計勤務時間を計算する関数（編集対象のシフトを除外して新しいシフト内容で計算）
const calculateWeeklyWorkTimeWithEditedShift = (
  editedShift: Shift,
  shiftData: Shift[]
): { totalMinutes: number; formattedTime: string } => {
  const selectedDate = new Date(editedShift.year, editedShift.month - 1, editedShift.day);
  const weekStart = getWeekStart(selectedDate);
  const weekEnd = getWeekEnd(selectedDate);

  // 週の範囲内のシフトデータを取得（編集対象のシフトは除外）
  const weeklyShifts = shiftData.filter((shift) => {
    const shiftDate = new Date(shift.year, shift.month - 1, shift.day);
    const isInWeek = shiftDate >= weekStart && shiftDate <= weekEnd;
    const isNotEditingTarget = !(
      shift.id === editedShift.id &&
      shift.year === editedShift.year &&
      shift.month === editedShift.month &&
      shift.day === editedShift.day
    );
    return isInWeek && isNotEditingTarget;
  });

  // 既存シフトの合計時間を計算
  let totalMinutes = 0;
  weeklyShifts.forEach((shift) => {
    totalMinutes += calculateShiftWorkTime(shift);
  });

  // 編集後のシフトの実働時間を計算
  const editedShiftWorkTime = calculateShiftWorkTime(editedShift);

  // 編集後のシフトを含めた合計時間
  totalMinutes += editedShiftWorkTime;

  return {
    totalMinutes,
    formattedTime: minutesToTimeFormat(totalMinutes)
  };
};

interface EditShiftDialogProps {
  isEditDialogOpen: boolean; // 編集ダイアログが開いているかどうかの状態
  editingShift: Shift | null; // 編集対象のシフトデータ
  setEditingShift: (shift: Shift) => void; // 編集対象のシフトを設定する関数
  handleSaveEditedShift: (
    editingShift: Shift,
    shiftData: Shift[],
    setShiftData: (shifts: Shift[]) => void,
    saveShiftsToLocalStorage: (shifts: Shift[]) => void,
    setIsEditDialogOpen: (isOpen: boolean) => void
  ) => void; // 編集されたシフトを保存する関数
  setIsEditDialogOpen: (isOpen: boolean) => void; // 編集ダイアログを閉じる関数
  shiftData: Shift[]; // 既存のシフトデータ
  setShiftData: (shifts: Shift[]) => void; // シフトデータを更新する関数
  saveShiftsToLocalStorage: (shifts: Shift[]) => void; // シフトデータをlocalStorageに保存する関数
}

export default function EditShiftDialog({
  isEditDialogOpen,
  editingShift,
  setEditingShift,
  handleSaveEditedShift,
  setIsEditDialogOpen,
  shiftData,
  setShiftData,
  saveShiftsToLocalStorage,
}: EditShiftDialogProps) {
  // アラートダイアログの状態管理
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // 週の実働時間チェック付きの保存処理
  const handleSaveWithValidation = () => {
    if (!editingShift) return;

    // 週の勤務時間チェック（8時間制限）
    const { totalMinutes, formattedTime } = calculateWeeklyWorkTimeWithEditedShift(
      editingShift,
      shiftData
    );

    if (totalMinutes > 8 * 60) { // 8時間 = 480分
      setAlertTitle("週の勤務時間超過");
      setAlertMessage(`週の勤務時間が8時間を超えます。\n現在の週の合計予定時間: ${formattedTime}\nシフトを保存できません。`);
      setAlertDialogOpen(true);
      return;
    }

    // エラーがない場合は元のhandleSaveEditedShift関数を呼び出し
    handleSaveEditedShift(
      editingShift,
      shiftData,
      setShiftData,
      saveShiftsToLocalStorage,
      setIsEditDialogOpen
    );
  };

  const backDialog = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsEditDialogOpen(false); //ダイアログを閉じる
    }
  };

  return (
    <>
      {/* アラートダイアログ */}
      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setAlertDialogOpen(false)}>
            OK
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* メイン編集ダイアログ */}
      {isEditDialogOpen &&
        editingShift && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={backDialog} //ダイアログの外側をクリックしたら閉じる
          >
            <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg max-w-md w-full border border-border">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-foreground">
                {editingShift.label || "（ラベルなし）"}シフトを編集
              </h2>
              <form>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-foreground">科目名</label>
                  <input
                    type="text"
                    value={editingShift.classname} //現在の科目名を表示
                    onChange={(e) =>
                      setEditingShift({
                        ...editingShift,
                        classname: e.target.value, //科目名を更新
                      })
                    }
                    className="w-full p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                  />
                </div>
                <div className="flex space-x-4 items-end">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-foreground">
                      業務内容
                    </label>
                    <select
                      value={editingShift.category}
                      onChange={(e) =>
                        setEditingShift({
                          ...editingShift,
                          category: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors h-[40px]"
                    >
                      <option value="(授業)">(授業)</option>
                      <option value="(準備等)">(準備等)</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-foreground">
                      担当教員
                    </label>
                    <input
                      type="text"
                      value={editingShift.teacher}
                      onChange={(e) =>
                        setEditingShift({
                          ...editingShift,
                          teacher: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors h-[40px]"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-foreground">開始時間</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      maxLength={2}
                      value={editingShift.starttime.split(":")[0]} // 時
                      onChange={(e) => {
                        const newHour = e.target.value
                          .replace(/[^\d０-９]/g, "") // 数字以外を除去
                          .replace(/[０-９]/g, (s) =>
                            String.fromCharCode(s.charCodeAt(0) - 65248)
                          ) // 全角を半角に変換
                          .slice(0, 2); // 最大2桁に制限
                        const newTime = `${newHour}:${
                          editingShift.starttime.split(":")[1]
                        }`;
                        setEditingShift({ ...editingShift, starttime: newTime });
                      }}
                      onBlur={(e) => {
                        const formattedHour = e.target.value.padStart(2, "0");
                        const newTime = `${formattedHour}:${
                          editingShift.starttime.split(":")[1]
                        }`;
                        setEditingShift({ ...editingShift, starttime: newTime });
                      }}
                      className="w-12 p-1 border border-input rounded-md text-center bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                    />
                    <span className="text-foreground">:</span>
                    <input
                      type="text"
                      maxLength={2}
                      value={editingShift.starttime.split(":")[1]} // 分
                      onChange={(e) => {
                        const newMinute = e.target.value
                          .replace(/[^\d０-９]/g, "") // 数字以外を除去
                          .replace(/[０-９]/g, (s) =>
                            String.fromCharCode(s.charCodeAt(0) - 65248)
                          ) // 全角を半角に変換
                          .slice(0, 2); // 最大2桁に制限
                        const newTime = `${
                          editingShift.starttime.split(":")[0]
                        }:${newMinute}`;
                        setEditingShift({ ...editingShift, starttime: newTime });
                      }}
                      onBlur={(e) => {
                        const formattedMinute = e.target.value.padStart(2, "0");
                        const newTime = `${
                          editingShift.starttime.split(":")[0]
                        }:${formattedMinute}`;
                        setEditingShift({ ...editingShift, starttime: newTime });
                      }}
                      className="w-12 p-1 border border-input rounded-md text-center bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-foreground">終了時間</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      maxLength={2}
                      value={editingShift.endtime.split(":")[0]} // 時
                      onChange={(e) => {
                        const newHour = e.target.value
                          .replace(/[^\d０-９]/g, "")
                          .replace(/[０-９]/g, (s) =>
                            String.fromCharCode(s.charCodeAt(0) - 65248)
                          )
                          .slice(0, 2);
                        const newTime = `${newHour}:${
                          editingShift.endtime.split(":")[1]
                        }`;
                        setEditingShift({ ...editingShift, endtime: newTime });
                      }}
                      onBlur={(e) => {
                        const formattedHour = e.target.value.padStart(2, "0");
                        const newTime = `${formattedHour}:${
                          editingShift.endtime.split(":")[1]
                        }`;
                        setEditingShift({ ...editingShift, endtime: newTime });
                      }}
                      className="w-12 p-1 border border-input rounded-md text-center bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                    />
                    <span className="text-foreground">:</span>
                    <input
                      type="text"
                      maxLength={2}
                      value={editingShift.endtime.split(":")[1]} // 分
                      onChange={(e) => {
                        const newMinute = e.target.value
                          .replace(/[^\d０-９]/g, "")
                          .replace(/[０-９]/g, (s) =>
                            String.fromCharCode(s.charCodeAt(0) - 65248)
                          )
                          .slice(0, 2);
                        const newTime = `${
                          editingShift.endtime.split(":")[0]
                        }:${newMinute}`;
                        setEditingShift({ ...editingShift, endtime: newTime });
                      }}
                      onBlur={(e) => {
                        const formattedMinute = e.target.value.padStart(2, "0");
                        const newTime = `${
                          editingShift.endtime.split(":")[0]
                        }:${formattedMinute}`;
                        setEditingShift({ ...editingShift, endtime: newTime });
                      }}
                      className="w-12 p-1 border border-input rounded-md text-center bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    休憩時間(分)
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingShift({
                          ...editingShift,
                          breaktime: Math.max(
                            0,
                            Number(editingShift.breaktime || 0) - 10
                          ),
                        })
                      }
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                    >
                      -10分
                    </button>
                    <input
                      type="text"
                      value={editingShift.breaktime || "0"}
                      onChange={(e) => {
                        const newBreakTime = e.target.value
                          .replace(/[^\d０-９]/g, "")
                          .replace(/[０-９]/g, (s) =>
                            String.fromCharCode(s.charCodeAt(0) - 65248)
                          )
                          .slice(0, 3);
                        setEditingShift({
                          ...editingShift,
                          breaktime: Number(newBreakTime),
                        });
                      }}
                      onBlur={(e) => {
                        const formattedBreakTime = e.target.value || "0";
                        setEditingShift({
                          ...editingShift,
                          breaktime: Number(formattedBreakTime),
                        });
                      }}
                      className="w-12 p-1 border border-input rounded-md text-center bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditingShift({
                          ...editingShift,
                          breaktime: Number(editingShift.breaktime || 0) + 10,
                        })
                      }
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                    >
                      +10分
                    </button>
                  </div>
                </div>
              </form>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditDialogOpen(false)} //編集ダイアログを閉じる
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveWithValidation} //週の実働時間チェック付きの保存処理
                  className="px-4 py-2 text-sm sm:text-base bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
