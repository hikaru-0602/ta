//Excel入力に必要なデータ形式に変換

"use client";
import ExcelJS from "exceljs";
import { Shift } from "../types";

//和暦と年月を取得し、配列を作成する関数
export const getYearAndMonth = (year: number, month: number) => {
  try {
    const japaneseEra = `令和${year - 2018}`; //和暦に変換
    //和暦と月を含む配列を作成
    const dateArray = [
      japaneseEra,
      japaneseEra,
      "年",
      "",
      month,
      "月分",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "プルダウン選択セル→",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "自由記述セル→",
      "",
    ];

    //console.log("更新された配列:", dateArray); //配列の内容をコンソールに出力
    return dateArray; //配列を返す
  } catch (error) {
    console.error("和暦変換中にエラーが発生しました:", error); //エラー内容をコンソールに出力
    //alert("和暦変換中にエラーが発生しました。"); //エラー発生時にアラートを表示
  }
};

export const getUserData = (userData: {
  name: string; // ユーザ名
  name_kana: string; // ユーザ名（カナ）
  id: string; // 学籍番号
  grade: string; // 学年
}) => {
  try {
    if (!userData) {
      console.error("ユーザデータが存在しません。");
      //alert("ユーザデータが正しく読み込まれていません。");
      return;
    }

    const kanadata46 = [
      "ふりがな",
      "ふりがな",
      `${userData.name_kana}`,
      `${userData.name_kana}`,
      `${userData.name_kana}`,
      `${userData.name_kana}`,
      `${userData.name_kana}`,
      `${userData.name_kana}`,
      `${userData.name_kana}`,
      `${userData.name_kana}`,
      `${userData.name_kana}`,
      `${userData.name_kana}`,
      `${userData.name_kana}`,
      `${userData.name_kana}`,
      "実働時間",
      "実働時間",
      "実働時間",
      "実働時間",
      "合計",
      { formula: "SUM(M13:M44)+SUM(AA13:AA42)" },
      { formula: "SUM(M13:M44)+SUM(AA13:AA42)" },
      { formula: "SUM(M13:M44)+SUM(AA13:AA42)" },
      { formula: "SUM(M13:M44)+SUM(AA13:AA42)" },
      { formula: "SUM(M13:M44)+SUM(AA13:AA42)" },
      { formula: "SUM(M13:M44)+SUM(AA13:AA42)" },
      { formula: "SUM(M13:M44)+SUM(AA13:AA42)" },
      "時間",
      null,
    ];

    const namedata47 = [
      "氏名",
      "氏名",
      `${userData.name}`,
      `${userData.name}`,
      `${userData.name}`,
      `${userData.name}`,
      `${userData.name}`,
      `${userData.name}`,
      `${userData.name}`,
      `${userData.name}`,
      `${userData.name}`,
      `${userData.name}`,
      `${userData.name}`,
      `${userData.name}`,
      "時給",
      { formula: 'IFERROR(VLOOKUP(C49,Sheet2!E2:F12,2,FALSE),"")' },
      { formula: 'IFERROR(VLOOKUP(C49,Sheet2!E2:F12,2,FALSE),"")' },
      "円",
      "合計金額",
      "合計金額",
      "合計金額",
      "合計金額",
      "合計金額",
      { formula: "ROUNDUP(T45*P47,0)" },
      { formula: "ROUNDUP(T45*P47,0)" },
      { formula: "ROUNDUP(T45*P47,0)" },
      { formula: "ROUNDUP(T45*P47,0)" },
      "円",
    ];

    const iddata48 = [
      "学籍番号",
      "学籍番号",
      `${userData.id}`,
      `${userData.id}`,
      `${userData.id}`,
      `${userData.id}`,
      `${userData.id}`,
      `${userData.id}`,
      `${userData.id}`,
      `${userData.id}`,
      `${userData.id}`,
      `${userData.id}`,
      `${userData.id}`,
      `${userData.id}`,
      "振込先口座情報",
      "振込先口座情報",
      "振込先口座情報",
      "振込先口座情報",
      "振込先口座情報",
      "振込先口座情報",
      "振込先口座情報",
      "振込先口座情報",
      "振込先口座情報",
      "振込先口座情報",
      "振込先口座情報",
      "振込先口座情報",
      "振込先口座情報",
      "振込先口座情報",
    ];

    const gradadata49 = [
      "学年",
      "学年",
      `${userData.grade}`,
      `${userData.grade}`,
      `${userData.grade}`,
      `${userData.grade}`,
      `${userData.grade}`,
      `${userData.grade}`,
      `${userData.grade}`,
      `${userData.grade}`,
      `${userData.grade}`,
      `${userData.grade}`,
      `${userData.grade}`,
      `${userData.grade}`,
      "銀行名",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ];

    // 4つの配列をまとめて返す
    return { kanadata46, namedata47, iddata48, gradadata49 };
  } catch (error) {
    console.error("ユーザデータのフォーマット中にエラーが発生しました:", error);
    //alert("ユーザデータのフォーマット中にエラーが発生しました。");
  }
};

export const getteacherData = (teacherData: {
  name: string; // ユーザ名
}) => {
  try {
    if (!teacherData) {
      console.error("教員名が存在しません。");
      //alert("ユーザデータが正しく読み込まれていません。");
      return;
    }

    // ユーザデータをExcel用のフォーマットに変換
    const formattedUserData = [
      "　上記のとおり相違ないことを確認します。",
      "　上記のとおり相違ないことを確認します。",
      "　上記のとおり相違ないことを確認します。",
      "　上記のとおり相違ないことを確認します。",
      "　上記のとおり相違ないことを確認します。",
      "　上記のとおり相違ないことを確認します。",
      "　上記のとおり相違ないことを確認します。",
      "　上記のとおり相違ないことを確認します。",
      "　上記のとおり相違ないことを確認します。",
      "　上記のとおり相違ないことを確認します。",
      "　上記のとおり相違ないことを確認します。",
      "　上記のとおり相違ないことを確認します。",
      "　上記のとおり相違ないことを確認します。",
      "授業担当教員氏名",
      null,
      null,
      null,
      teacherData.name,
      teacherData.name,
      teacherData.name,
      teacherData.name,
      teacherData.name,
      teacherData.name,
      teacherData.name,
      teacherData.name,
      teacherData.name,
      teacherData.name,
      null,
    ];
    //console.log("フォーマットされたユーザデータ:", formattedUserData);
    //alert("ユーザデータのフォーマットが完了しました。");
    return formattedUserData; // フォーマットされたデータを返す
  } catch (error) {
    console.error("ユーザデータのフォーマット中にエラーが発生しました:", error);
    //alert("ユーザデータのフォーマット中にエラーが発生しました。");
  }
};

//シフトデータを指定された形式の配列に変換する関数
export const formatShiftDataForExcel = (shiftData: Shift[]) => {
  try {
    if (!shiftData || !Array.isArray(shiftData)) {
      console.error("shiftData is not defined or not an array.");
      //alert("シフトデータが正しく読み込まれていません。");
      return;
    }
    // シフトデータを指定された形式に変換
    const formattedShifts = shiftData.map((shift) => {
      const startTime = shift.starttime.split(":"); // "HH:mm" を [HH, mm] に分割
      const endTime = shift.endtime.split(":"); // "HH:mm" を [HH, mm] に分割

      return [
        shift.day, // 日付
        shift.classname, // 科目名
        shift.classname,
        shift.classname,
        shift.category, // 業務内容
        parseInt(startTime[0], 10), // 開始時刻の時
        ":",
        parseInt(startTime[1], 10), // 開始時刻の分
        "～",
        parseInt(endTime[0], 10), // 終了時刻の時
        ":",
        parseInt(endTime[1], 10), // 終了時刻の分
        {
          formula:
            "CEILING(ROUND(((TIME(J13,L13,0)-TIME(F13,H13,0))*24-N13/60),3),0.5)",
          result: 2,
          ref: "M13",
        },
        shift.breaktime, // 休憩時間
      ];
    });

    //console.log("フォーマットされたシフトデータ:", formattedShifts); // フォーマットされたデータをコンソールに出力

    // 必要に応じてこの配列をExcelに書き込む処理を追加
    //alert("シフトデータのフォーマットが完了しました。");
    return organizeFormattedData(formattedShifts); // 整理されたデータを返す
  } catch (error) {
    console.error("シフトデータのフォーマット中にエラーが発生しました:", error);
    //alert("シフトデータのフォーマット中にエラーが発生しました。");
  }
};

// Excelファイルを読み込み、条件に一致する行のデータを出力する関数
export const checkRowsAndOutput = async (file: File) => {
  try {
    if (!file) {
      //alert("ファイルが選択されていません。");
      return;
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.getWorksheet("実施報告書"); // シート名で取得
    if (!worksheet) {
      //alert("指定されたシートが見つかりません。");
      return;
    }

    const outputData: Array<{ firstCell: unknown; fifteenthCell: unknown }> =
      []; // 出力データを格納する配列

    worksheet.eachRow((row, rowIndex) => {
      if (rowIndex > 50) return; // 50行目まで処理

      const firstCellValue = row.getCell(1).value; // 1つ目のセルの値を取得
      const fifteenthCellValue = row.getCell(15).value; // 15個目のセルの値を取得

      // 1つ目のセルが「1」または半角数字の場合に処理
      if (
        firstCellValue === 1 ||
        (typeof firstCellValue === "string" && /^[0-9]+$/.test(firstCellValue))
      ) {
        // 条件に一致する場合、データを出力用配列に追加
        outputData.push({
          firstCell: firstCellValue,
          fifteenthCell: fifteenthCellValue,
        });
      }
    });

    //console.log("条件に一致した行のデータ:", outputData); // 出力データをコンソールに表示
    //alert("条件に一致した行のデータをコンソールに出力しました。");
  } catch (error) {
    console.error("Excelファイルの処理中にエラーが発生しました:", error);
    //alert("Excelファイルの処理中にエラーが発生しました。");
  }
};

//1つ目の要素を基準に配列を整理する関数
export const organizeFormattedData = (
  formattedData: (
    | string
    | number
    | null
    | { formula: string; ref?: string }
  )[][]
) => {
  // 数字の対応表
  const mapping = {
    1: 17,
    2: 18,
    3: 19,
    4: 20,
    5: 21,
    6: 22,
    7: 23,
    8: 24,
    9: 25,
    10: 26,
    11: 27,
    12: 28,
    13: 29,
    14: 30,
    15: 31,
    16: null,
    17: 1,
    18: 2,
    19: 3,
    20: 4,
    21: 5,
    22: 6,
    23: 7,
    24: 8,
    25: 9,
    26: 10,
    27: 11,
    28: 12,
    29: 13,
    30: 14,
    31: 15,
  } as const;

  // 処理済みの配列を追跡するためのセット
  const processedIndexes = new Set<number>();

  // サンプル配列
  const sample = [
    null,
    null,
    null,
    null,
    null,
    null,
    ":",
    null,
    "～",
    null,
    ":",
    null,
    {
      formula:
        "CEILING(ROUND(((TIME(X13,Z13,0)-TIME(T13,V13,0))*24-AB13/60),3),0.5)",
      ref: "AA13",
    },
    null,
  ];

  const nullArray = Array(14).fill(null); // nullで埋めた配列

  // 結果を格納する配列
  const result: (
    | string
    | number
    | null
    | { formula: string; ref?: string }
  )[][] = [];

  // フォーマットされた配列を順に処理
  formattedData.forEach((currentArray, currentIndex) => {
    if (processedIndexes.has(currentIndex)) return; // すでに処理済みの場合はスキップ

    const firstElement = Number(currentArray[0]); // 1つ目の要素を半角数字に変換
    const correspondingNumber = mapping[firstElement as keyof typeof mapping]; // 対応する数字を取得

    if (correspondingNumber === null) {
      // 16の場合は無条件で後ろにnullArrayを追加
      result.push([...currentArray, ...nullArray]);
      processedIndexes.add(currentIndex); // 処理済みに追加
      return;
    }

    // 対応する数字を持つ配列を探す
    const matchingIndex = formattedData.findIndex(
      (array, index) =>
        index !== currentIndex && // 自分自身ではない
        !processedIndexes.has(index) && // まだ処理されていない
        Number(array[0]) === correspondingNumber // 対応する数字を持つ
    );

    if (matchingIndex !== -1) {
      // 対応する配列が見つかった場合
      const matchingArray = formattedData[matchingIndex];
      const combinedArray =
        firstElement < correspondingNumber
          ? [...currentArray, ...matchingArray]
          : [...matchingArray, ...currentArray];

      result.push(combinedArray); // 結合した配列を結果に追加
      processedIndexes.add(currentIndex); // 処理済みに追加
      processedIndexes.add(matchingIndex); // 対応する配列も処理済みに追加
    } else {
      // 対応する配列が見つからない場合
      const sampleToAdd = sample.map((v, i) =>
        i === 0 ? correspondingNumber : v
      );
      if (firstElement < correspondingNumber) {
        // 対応する数字が大きい場合は後ろに追加
        result.push([...currentArray, ...sampleToAdd]);
      } else {
        // 対応する数字が小さい場合は前に追加
        result.push([...sampleToAdd, ...currentArray]);
      }
      processedIndexes.add(currentIndex); // 処理済みに追加
    }
  });

  return result;
};

// ユーザデータをExcel用にフォーマットして出力する関数
export const formatUserDataForExcel = (userData: {
  name: string; //ユーザ名
  name_kana: string; //ユーザ名（カナ）
  id: string; //学籍番号
  grade: string; //学年
}) => {
  try {
    if (!userData) {
      console.error("ユーザデータが存在しません。");
      //alert("ユーザデータが正しく読み込まれていません。");
      return;
    }

    // ユーザデータをExcel用のフォーマットに変換
    const formattedUserData = [
      userData.name,
      userData.name_kana,
      userData.id,
      userData.grade,
    ];

    //console.log("フォーマットされたユーザデータ:", formattedUserData);
    //alert("ユーザデータのフォーマットが完了しました。");

    return formattedUserData; // フォーマットされたデータを返す
  } catch (error) {
    console.error("ユーザデータのフォーマット中にエラーが発生しました:", error);
    //alert("ユーザデータのフォーマット中にエラーが発生しました。");
  }
};
