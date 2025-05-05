"use client";

import React, { useState, useRef } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver"; // ファイル保存用ライブラリをインポート

const ExportPage = () => {
  const [rows, setRows] = useState<Array<Array<any>>>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null); // ファイル入力の参照

  const handleFileChange = async (event?: React.ChangeEvent<HTMLInputElement>) => {
    const file = event ? event.target.files?.[0] : fileInputRef.current?.files?.[0];
    if (!file) {
      alert("ファイルが選択されていません。");
      return;
    }
  
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
  
      // シート名をデバッグ用に出力
      console.log("シート一覧:", workbook.worksheets.map(sheet => sheet.name));
      alert("シート一覧: " + workbook.worksheets.map(sheet => sheet.name).join(", "));
  
      const worksheet = workbook.getWorksheet("実施報告書"); // シート名で取得
      if (!worksheet) {
        alert("指定されたシートが見つかりません。");
        return;
      }
  
      const loadedRows: Array<Array<any>> = []; // データを格納する配列
  
      // 行ごとに処理
      worksheet.eachRow((row, rowIndex) => {
        const rowValues: Array<any> = []; // 行データを格納する配列
  
        // セルごとに値を取得
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          rowValues.push(cell.value); // セルの値をそのまま追加
        });
  
        loadedRows.push(rowValues); // 行データを追加
      });
  
      console.log("読み込んだ行データ:", loadedRows);
      setRows(loadedRows);
      alert("Excelファイルを読み込みました");
    } catch (error) {
      console.error("Excelファイルの読み込みに失敗しました:", error);
      alert("Excelファイルの読み込みに失敗しました。");
    }
  };


  const handleReplaceAndDownloadExcel = async () => {
    try {
      const file = fileInputRef.current?.files?.[0];
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
  
      // 10番目の配列を置き換える
      const replacementData = [
        0,
        "システム管理方法論",
        "システム管理方法論",
        "システム管理方法論",
        "(授業)",
        13,
        ":",
        10,
        "～",
        15,
        ":",
        20,
        { formula: 'CEILING(ROUND(((TIME(J13,L13,0)-TIME(F13,H13,0))*24-N13/60),3),0.5)', result: 2, ref: 'M13', shareType: 'shared' },
        10,
        17,
        "アルゴリズムとデータ構造",
        "アルゴリズムとデータ構造",
        "アルゴリズムとデータ構造",
        "(授業)",
        6,
        ":",
        10,
        "～",
        11,
        ":",
        5,
        { formula: 'CEILING(ROUND(((TIME(X13,Z13,0)-TIME(T13,V13,0))*24-AB13/60),3),0.5)', result: 5, ref: 'AA13', shareType: 'shared' },
        10,
      ];
  
      // 10番目の行を置き換える
      const rowToReplace = worksheet.getRow(10); // 10番目の行を取得
      rowToReplace.values = replacementData; // 行データを置き換え
      rowToReplace.commit(); // 変更を確定
  
      // 新しいExcelファイルとして保存
      const newWorkbookBuffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([newWorkbookBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, "modified_excel.xlsx");
  
      alert("10番目の行を置き換えたExcelファイルを保存しました。");
    } catch (error) {
      console.error("Excelファイルの処理に失敗しました:", error);
      alert("Excelファイルの処理に失敗しました。");
    }
  };

  // 最初のセルが '1' の行を置き換える関数
  const handleReplaceFirstRowWithOne = async () => {
    try {
      const file = fileInputRef.current?.files?.[0];
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

      let replaced = false; // 置き換えが行われたかを追跡

      worksheet.eachRow((row, rowIndex) => {
        if (replaced) return; // 最初の一回のみ処理
        const firstCellValue = row.getCell(1).value; // 行の1つ目のセルの値を取得
        if (firstCellValue === 1) {
          // 置き換えるデータ
          const replacementData = [
            1,
            "システム管理方法論",
            "システム管理方法論",
            "システム管理方法論",
            "(授業)",
            13,
            ":",
            10,
            "～",
            15,
            ":",
            20,
            { formula: 'CEILING(ROUND(((TIME(J13,L13,0)-TIME(F13,H13,0))*24-N13/60),3),0.5)', result: 2, ref: 'M13', shareType: 'shared' },
            10,
            17,
            "アルゴリズムとデータ構造",
            "アルゴリズムとデータ構造",
            "アルゴリズムとデータ構造",
            "(授業)",
            6,
            ":",
            10,
            "～",
            11,
            ":",
            5,
            { formula: 'CEILING(ROUND(((TIME(X13,Z13,0)-TIME(T13,V13,0))*24-AB13/60),3),0.5)', result: 5, ref: 'AA13', shareType: 'shared' },
            10,
          ];

          // セルのスタイルを保持しながらデータを置き換え
          replacementData.forEach((value, colIndex) => {
            const cell = row.getCell(colIndex + 1); // 列番号は1から始まる
            const originalStyle = { ...cell.style }; // 元のスタイルを保持
            cell.value = value; // セルの値を置き換え
            cell.style = originalStyle; // 元のスタイルを再適用
          });

          row.commit(); // 変更を確定
          replaced = true; // 置き換え済みフラグを設定
        }
      });

      if (!replaced) {
        alert("最初のセルが '1' の行が見つかりませんでした。");
        return;
      }

      // 新しいExcelファイルとして保存
      const newWorkbookBuffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([newWorkbookBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, "modified_excel.xlsx");

      alert("最初のセルが '1' の行を置き換えたExcelファイルを保存しました。");
    } catch (error) {
      console.error("Excelファイルの処理に失敗しました:", error);
      alert("Excelファイルの処理に失敗しました。");
    }
  };

  const handleChangeCellFill = async () => {
    try {
      const file = fileInputRef.current?.files?.[0];
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

      // 複数のセルの塗りつぶしパターンを変更
      const cellsToFill = ["A15", "A16"]; // 塗りつぶしを適用するセルのリスト
      cellsToFill.forEach((cellAddress) => {
        const cell = worksheet.getCell(cellAddress);
        cell.style.fill = {
          type: "pattern",
          pattern: "lightGray",
          fgColor: { argb: "FF808080" }, // 前景色（グレー）
          //bgColor: { argb: "FFFFFFFF" }, // 背景色（白）
          //bgColor: { argb: "FAEADB" },
        };
      });
      // 新しいExcelファイルとして保存
      const newWorkbookBuffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([newWorkbookBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, "cell_fill_changed.xlsx");

      alert("セルの塗りつぶしパターンを変更したExcelファイルを保存しました。");
    } catch (error) {
      console.error("セルの塗りつぶしパターン変更に失敗しました:", error);
      alert("セルの塗りつぶしパターン変更に失敗しました。");
    }
  };

  const handleCheckCellStyle = async () => {
    try {
      const file = fileInputRef.current?.files?.[0];
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

      // B31セルのスタイルを取得
      const cell = worksheet.getCell("B31");
      console.log("B31セルの値:", cell.value);
      console.log("B31セルのフォント:", cell.style.font);
      console.log("B31セルの塗りつぶし:", cell.style.fill);
      console.log("B31セルの境界線:", cell.style.border);
      console.log("B31セルの配置:", cell.style.alignment);
      console.log("全ての情報:", cell);

      alert("B31セルのスタイル情報をコンソールに出力しました。");
    } catch (error) {
      console.error("セルのスタイル情報の取得に失敗しました:", error);
      alert("セルのスタイル情報の取得に失敗しました。");
    }
  };

  // 指定した行を置き換え、スタイルを保持する関数
  const handleReplaceRowWithStyle = async () => {
    try {
      const file = fileInputRef.current?.files?.[0];
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

      // 置き換えるデータ
      const replacementData = [
        1,
        "システム管理方法論",
        "システム管理方法論",
        "システム管理方法論",
        "(授業)",
        13,
        ":",
        10,
        "～",
        15,
        ":",
        20,
        { formula: 'CEILING(ROUND(((TIME(J13,L13,0)-TIME(F13,H13,0))*24-N13/60),3),0.5)', result: 2, ref: 'M13', shareType: 'shared' },
        10,
        17,
        "アルゴリズムとデータ構造",
        "アルゴリズムとデータ構造",
        "アルゴリズムとデータ構造",
        "(授業)",
        6,
        ":",
        10,
        "～",
        11,
        ":",
        5,
        { formula: 'CEILING(ROUND(((TIME(X13,Z13,0)-TIME(T13,V13,0))*24-AB13/60),3),0.5)', result: 5, ref: 'AA13', shareType: 'shared' },
        10,
      ];

      const dateArray = [
        "令和7", // 1番目
        "令和7", // 2番目
        "年",
        "",
        "5", // 5番目に月を代入
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

      // 指定した行を取得
      //const rowToReplace = worksheet.getRow(rowNumber);
      const rowToReplace = worksheet.getRow(11);
      
      dateArray.forEach((value, colIndex) => {
        const cell = rowToReplace.getCell(colIndex + 1); // 列番号は1から始まる
        const originalStyle = { ...cell.style }; // 元のスタイルを保持
        cell.value = value; // セルの値を置き換え
        cell.style = originalStyle; // 元のスタイルを再適用
      });

      rowToReplace.commit(); // 変更を確定

      // 新しいExcelファイルとして保存
      const newWorkbookBuffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([newWorkbookBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, "modified_excel_with_style.xlsx");

      //alert(`${rowNumber}行目を置き換え、スタイルを保持したExcelファイルを保存しました。`);
    } catch (error) {
      //console.error("Excelファイルの処理に失敗しました:", error);
      alert("Excelファイルの処理に失敗しました。");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Excel データ表示</h1>
      <input
        type="file"
        accept=".xlsx"
        ref={fileInputRef} // ファイル入力の参照を設定
        onChange={handleFileChange}
        style={{ marginBottom: "16px" }}
      />
      <button onClick={() => handleFileChange()} style={{ marginBottom: "16px" }}>
        再処理を実行
      </button>
      <button onClick={handleReplaceFirstRowWithOne} style={{ marginBottom: "16px" }}>
        最初のセルが '1' の行を置き換えてExcelを保存
      </button>
      <button onClick={handleChangeCellFill} style={{ marginBottom: "16px" }}>
  セルの塗りつぶしパターンを変更
</button>
      <button onClick={handleCheckCellStyle} style={{ marginBottom: "16px" }}>
  B31セルのスタイルを確認
</button>

<button
  onClick={handleReplaceRowWithStyle}
  style={{ padding: "8px 16px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", marginTop: "16px" }}
>
  11行目を置き換え（スタイル保持）
</button>
    </div>
  );
};

export default ExportPage;