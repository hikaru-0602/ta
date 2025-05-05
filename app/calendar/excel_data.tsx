"use client";
import React from "react";
import ExcelJS from "exceljs";

//和暦と年月を取得し、配列を更新する関数
export const getYearAndMonth = () => {
  try {
    const currentDate = new Date(); //現在の日付を取得
    const year = currentDate.getFullYear(); //西暦の年を取得
    const month = currentDate.getMonth() + 1; //月を取得（0始まりのため+1）
    const japaneseEra = `令和${year - 2018}`; //和暦に変換

    //和暦と月を含む配列を作成
    const dateArray = [
      japaneseEra, //1番目
      japaneseEra, //2番目
      "年",
      "",
      month, //5番目に月を代入
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

    console.log("更新された配列:", dateArray); //配列の内容をコンソールに出力

    //必要に応じてこの配列をExcelに書き込む処理を追加
    //alert("和暦変換と配列の更新が完了しました。");
  } catch (error) {
    console.error("和暦変換中にエラーが発生しました:", error); //エラー内容をコンソールに出力
    alert("和暦変換中にエラーが発生しました。"); //エラー発生時にアラートを表示
  }
};

// シフトデータを指定された形式の配列に変換する関数
export const formatShiftDataForExcel = (shiftData: any[]) => {
  try {
    if (!shiftData || !Array.isArray(shiftData)) {
      console.error("shiftData is not defined or not an array.");
      alert("シフトデータが正しく読み込まれていません。");
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
          formula: 'CEILING(ROUND(((TIME(J13,L13,0)-TIME(F13,H13,0))*24-N13/60),3),0.5)',
          result: 2,
          ref: 'M13',
          shareType: 'shared',
        },
        shift.breaktime, // 休憩時間
      ];
    });

    console.log("フォーマットされたシフトデータ:", formattedShifts); // フォーマットされたデータをコンソールに出力

    // 必要に応じてこの配列をExcelに書き込む処理を追加
    alert("シフトデータのフォーマットが完了しました。");
    console.log(organizeFormattedData(formattedShifts)); // フォーマットされたデータを整理
    return formattedShifts;
  } catch (error) {
    console.error("シフトデータのフォーマット中にエラーが発生しました:", error);
    alert("シフトデータのフォーマット中にエラーが発生しました。");
  }
};

// Excelファイルを読み込み、条件に一致する行のデータを出力する関数
export const handleCheckRowsAndOutput = async (file: File) => {
  try {
    if (!file) {
      alert("ファイルが選択されていません。");
      return;
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.getWorksheet("実施報告書"); // シート名で取得
    if (!worksheet) {
      alert("指定されたシートが見つかりません。");
      return;
    }

    const outputData: Array<{ firstCell: any; fifteenthCell: any }> = []; // 出力データを格納する配列

    worksheet.eachRow((row, rowIndex) => {
      if (rowIndex > 50) return; // 50行目まで処理

      const firstCellValue = row.getCell(1).value; // 1つ目のセルの値を取得
      const fifteenthCellValue = row.getCell(15).value; // 15個目のセルの値を取得

      // 1つ目のセルが「1」または半角数字の場合に処理
      if (firstCellValue === 1 || (typeof firstCellValue === "string" && /^[0-9]+$/.test(firstCellValue))) {
        // 条件に一致する場合、データを出力用配列に追加
        outputData.push({
          firstCell: firstCellValue,
          fifteenthCell: fifteenthCellValue,
        });
      }
    });

    console.log("条件に一致した行のデータ:", outputData); // 出力データをコンソールに表示
    alert("条件に一致した行のデータをコンソールに出力しました。");
  } catch (error) {
    console.error("Excelファイルの処理中にエラーが発生しました:", error);
    alert("Excelファイルの処理中にエラーが発生しました。");
  }
};

export const organizeFormattedData = (formattedData: any[]) => {
  // 数字の対応表
  const mapping = {
    1: 17, 2: 18, 3: 19, 4: 20, 5: 21, 6: 22, 7: 23, 8: 24,
    9: 25, 10: 26, 11: 27, 12: 28, 13: 29, 14: 30, 15: 31, 16: null,
  } as const;

  // 処理済みの配列を追跡するためのセット
  const processedIndexes = new Set<number>();

  // サンプル配列
  const sample = [
    null, null, null, null, null, null, ":", null, "～", null, ":", null,
    { formula: 'CEILING(ROUND(((TIME(X13,Z13,0)-TIME(T13,V13,0))*24-AB13/60),3),0.5)', result: 5, ref: 'AA13', shareType: 'shared' },
    null,
  ];

  // 結果を格納する配列
  const result: any[] = [];

  // フォーマットされた配列を順に処理
  formattedData.forEach((currentArray, currentIndex) => {
    if (processedIndexes.has(currentIndex)) return; // すでに処理済みの場合はスキップ

    const firstElement = Number(currentArray[0]); // 1つ目の要素を半角数字に変換
    const correspondingNumber = mapping[firstElement as keyof typeof mapping]; // 対応する数字を取得

    if (correspondingNumber === null) {
      // 16の場合は無条件で後ろにサンプルを追加
      result.push([...currentArray, ...sample.map((v, i) => (i === 0 ? firstElement : v))]);
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
      const sampleToAdd = sample.map((v, i) => (i === 0 ? correspondingNumber : v));
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