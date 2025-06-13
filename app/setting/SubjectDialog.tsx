"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAlert } from "../components/AlertProvider";
import { useAuth } from "../firebase/context/auth";
import { doc, setDoc, collection, onSnapshot, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

interface SortGroupedItem {
  LessonId: number;
  授業名: string;
  担当教員名: string;
}

interface SubjectData {
  id: string;
  lessonId: number;
  subjectName: string;
  teacherName: string;
}

interface SubjectDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
}

export default function SubjectDialog({
  isDialogOpen,
  setIsDialogOpen,
}: SubjectDialogProps) {
  const [subjects, setSubjects] = useState<SortGroupedItem[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<SortGroupedItem[]>([]);
  const [userSubjects, setUserSubjects] = useState<SubjectData[]>([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<SortGroupedItem | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [availableTeachers, setAvailableTeachers] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();
  const user = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  // 科目データを取得
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/sort-grouped');
        if (!response.ok) {
          throw new Error('科目データの取得に失敗しました');
        }
        const result = await response.json();
        setSubjects(result);
      } catch (error) {
        console.error('科目データ取得エラー:', error);
        showAlert('エラー', '科目データの取得に失敗しました');
      }
    };

    if (isDialogOpen) {
      fetchSubjects();
    }
  }, [isDialogOpen, showAlert]);

  // オートコンプリートのフィルタリング
  useEffect(() => {
    if (subjectInput.trim() === "" || selectedSubject) {
      setFilteredSubjects([]);
      setShowDropdown(false);
      return;
    }

    const filtered = subjects.filter(subject =>
      subject.授業名.toLowerCase().includes(subjectInput.toLowerCase())
    );
    setFilteredSubjects(filtered.slice(0, 10)); // 最大10件まで表示
    setShowDropdown(filtered.length > 0);
  }, [subjectInput, subjects, selectedSubject]);

  // ユーザーの担当科目データをリアルタイムで取得
  useEffect(() => {
    const auth = getAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const unsubscribeSnapshot = onSnapshot(
          collection(db, `users/${user.uid}/subjects`),
          (snapshot) => {
            const subjects = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as SubjectData[];
            setUserSubjects(subjects);
          },
          (error) => {
            console.error("担当科目データの監視エラー:", error);
          }
        );

        return unsubscribeSnapshot;
      } else {
        setUserSubjects([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 科目選択処理
  const handleSubjectSelect = (subject: SortGroupedItem) => {
    setSelectedSubject(subject);
    setSubjectInput(subject.授業名);
    setShowDropdown(false);
    setFilteredSubjects([]); // フィルタリング結果もクリア

    // 担当教員リストを設定
    const teachers = parseTeacherNames(subject.担当教員名);
    setAvailableTeachers(teachers);
    setSelectedTeacher(""); // 教員選択をリセット
  };

  // 担当教員名をカンマ区切りから配列に変換
  const parseTeacherNames = (teacherString: string): string[] => {
    return teacherString.split(',').map(name => name.trim()).filter(name => name.length > 0);
  };

    // 科目追加処理
  const handleAddSubject = async () => {
    if (!selectedSubject) {
      showAlert('入力エラー', '科目を選択してください');
      return;
    }

    if (!selectedTeacher) {
      showAlert('入力エラー', '担当教員を選択してください');
      return;
    }

    if (!user.user) {
      showAlert('認証エラー', 'ログインしてください');
      return;
    }

    // 重複チェック（科目と教員の組み合わせ）
    const isDuplicate = userSubjects.some(
      (subject) => subject.lessonId === selectedSubject.LessonId && subject.teacherName === selectedTeacher
    );

    if (isDuplicate) {
      showAlert('重複エラー', 'この科目と教員の組み合わせは既に登録されています');
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth();
      const uid = auth.currentUser?.uid;

      if (!uid) {
        throw new Error('ユーザーIDが取得できません');
      }

      const subjectData = {
        lessonId: selectedSubject.LessonId,
        subjectName: selectedSubject.授業名,
        teacherName: selectedTeacher,
      };

      await setDoc(doc(db, `users/${uid}/subjects/${subjectData.lessonId}`), subjectData);
      setSubjectInput("");
      setSelectedSubject(null);
      setSelectedTeacher("");
      setAvailableTeachers([]);
    } catch (error) {
      console.error('科目追加エラー:', error);
      showAlert('エラー', '科目の追加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

    // 科目削除処理
  const handleDeleteSubject = async (lessonId: number) => {
    if (!user.user) {
      showAlert('認証エラー', 'ログインしてください');
      return;
    }

    try {
      const auth = getAuth();
      const uid = auth.currentUser?.uid;

      if (!uid) {
        throw new Error('ユーザーIDが取得できません');
      }

      await deleteDoc(doc(db, `users/${uid}/subjects/${lessonId}`));
    } catch (error) {
      console.error('科目削除エラー:', error);
      showAlert('エラー', '科目の削除に失敗しました');
    }
  };

  const backDialog = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseDialog();
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    // 選択状態をリセット
    setSubjectInput("");
    setSelectedSubject(null);
    setSelectedTeacher("");
    setAvailableTeachers([]);
    setShowDropdown(false);
    setFilteredSubjects([]);
  };

  if (!isDialogOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={backDialog}
    >
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg w-full max-w-2xl border border-border max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-foreground">担当科目管理</h2>

        {/* 科目追加フォーム */}
        <div className="mb-6 p-4 bg-background rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4 text-foreground">新しい担当科目を追加</h3>

          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-foreground mb-2">
                科目名
              </label>
                              <input
                  ref={inputRef}
                  type="text"
                  value={subjectInput}
                  onChange={(e) => {
                    setSubjectInput(e.target.value);
                    setSelectedSubject(null); // 入力が変更されたら選択をクリア
                  }}
                  onFocus={() => {
                    if (subjectInput && !selectedSubject) {
                      setShowDropdown(filteredSubjects.length > 0);
                    }
                  }}
                  placeholder="科目名を入力してください"
                  className="w-full p-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                />

              {/* オートコンプリートドロップダウン */}
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredSubjects.map((subject) => (
                    <div
                      key={subject.LessonId}
                      onClick={() => handleSubjectSelect(subject)}
                      className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                    >
                      <div className="font-medium text-foreground">{subject.授業名}</div>
                      <div className="text-sm text-muted-foreground">
                        担当教員: {subject.担当教員名}
                      </div>
                    </div>
                  ))}
                </div>
                             )}
             </div>

             {/* 担当教員選択 */}
             <div>
               <label className="block text-sm font-medium text-foreground mb-2">
                 担当教員
               </label>
               <select
                 value={selectedTeacher}
                 onChange={(e) => setSelectedTeacher(e.target.value)}
                 disabled={!selectedSubject || availableTeachers.length === 0}
                 className="w-full p-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <option value="">
                   {!selectedSubject
                     ? "まず科目を選択してください"
                     : availableTeachers.length === 0
                     ? "担当教員データがありません"
                     : "担当教員を選択してください"
                   }
                 </option>
                 {availableTeachers.map((teacher, index) => (
                   <option key={index} value={teacher}>
                     {teacher}
                   </option>
                 ))}
               </select>
             </div>



                         <div className="flex justify-end space-x-2">
               <Button
                 onClick={handleAddSubject}
                 disabled={loading || !selectedSubject || !selectedTeacher}
               >
                 {loading ? '追加中...' : '追加'}
               </Button>
             </div>
          </div>
        </div>

        {/* 登録済み科目一覧 */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-4 text-foreground">登録済み担当科目</h3>
          {userSubjects.length === 0 ? (
            <p className="text-muted-foreground">登録された担当科目はありません</p>
          ) : (
            <div className="space-y-2">
              {userSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex justify-between items-start p-3 bg-background rounded-lg border border-border"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{subject.subjectName}</p>
                    <p className="text-sm text-muted-foreground">
                      LessonID: {subject.lessonId}
                    </p>
                                         <p className="text-sm text-muted-foreground">
                       担当教員: {subject.teacherName}
                     </p>
                  </div>
                  <Button
                    onClick={() => handleDeleteSubject(subject.lessonId)}
                    variant="destructive"
                    size="sm"
                  >
                    削除
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleCloseDialog}
            variant="secondary"
          >
            閉じる
          </Button>
        </div>
      </div>
    </div>
  );
}