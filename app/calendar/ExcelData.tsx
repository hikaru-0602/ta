"use client";
import React from "react";

export const getYearAndMonth = () => {
  try {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 月は0から始まるため+1
    const japaneseEra = `令和${year - 2018}`; // 和暦に変換

    const dateArray = [
      japaneseEra, // 1番目
      japaneseEra, // 2番目
      "年",
      "",
      month, // 5番目に月を代入
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

    console.log("更新された配列:", dateArray);

    // 必要に応じてこの配列をExcelに書き込む処理を追加
    alert("和暦変換と配列の更新が完了しました。");
  } catch (error) {
    console.error("和暦変換中にエラーが発生しました:", error);
    alert("和暦変換中にエラーが発生しました。");
  }
};