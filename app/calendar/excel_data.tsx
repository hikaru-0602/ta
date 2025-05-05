"use client";
import React from "react";

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
    alert("和暦変換と配列の更新が完了しました。");
  } catch (error) {
    console.error("和暦変換中にエラーが発生しました:", error); //エラー内容をコンソールに出力
    alert("和暦変換中にエラーが発生しました。"); //エラー発生時にアラートを表示
  }
};