import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { organizeFormattedData } from "./excel_data";

// 条件に一致する行のデータを置き換える関数
export const handleReplaceRowsWithFormattedData = async () => {
  try {
    // public ディレクトリに配置されたExcelファイルを取得
    const response = await fetch("/R7_実施報告書.xlsx");
    if (!response.ok) {
      throw new Error("Excelファイルの取得に失敗しました。");
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.getWorksheet("実施報告書"); // シート名で取得
    if (!worksheet) {
      //alert("指定されたシートが見つかりません。");
      return;
    }

    // organizeFormattedData で取得した配列
    const shiftData = organizeFormattedData([
      // サンプルデータをここに追加するか、実際のデータを渡してください
    ]);

    // データセットのインデックスを追跡
    let dataSetIndex = 0;

    // Excelの各行を処理（55行目まで）
    worksheet.eachRow({ includeEmpty: true }, (row, rowIndex) => {
      if (rowIndex > 55) return; // 55行目まで処理

      const firstCellValue = row.getCell(1).value; // 行の1つ目のセルの値を取得
      if (typeof firstCellValue !== "number") return; // 半角数字でない場合はスキップ

      // 配列の1番目の要素と一致するデータを探す
      const matchingData = shiftData.find(
        (data) => Number(data[0]) === firstCellValue
      );

      if (matchingData) {
        // 条件に一致する場合、データを置き換える
        matchingData.forEach(
          (
            value:
              | string
              | number
              | boolean
              | Date
              | ExcelJS.CellErrorValue
              | ExcelJS.CellRichTextValue
              | ExcelJS.CellHyperlinkValue
              | ExcelJS.CellFormulaValue
              | ExcelJS.CellSharedFormulaValue
              | null
              | undefined,
            colIndex: number
          ) => {
            const cell = row.getCell(colIndex + 1); // 列番号は1から始まる
            const originalStyle = { ...cell.style }; // 元のスタイルを保持
            cell.value = value; // セルの値を置き換え
            cell.style = originalStyle; // 元のスタイルを再適用
          }
        );

        row.commit(); // 変更を確定
        dataSetIndex = (dataSetIndex + 1) % shiftData.length; // 次のデータセットに切り替え
      }
    });

    // 新しいExcelファイルとして保存
    const newWorkbookBuffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([newWorkbookBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "updated_excel_with_formatted_data.xlsx");

    //alert("条件に一致する行を置き換えたExcelファイルを保存しました。");
  } catch (error) {
    console.error("Excelファイルの処理中にエラーが発生しました:", error);
    //alert("Excelファイルの処理中にエラーが発生しました。");
  }
};

// 指定した行を配列の値で置き換える関数
const replaceRowWithArray = (
  worksheet: ExcelJS.Worksheet,
  rowIndex: number,
  values: (
    | string
    | number
    | boolean
    | Date
    | null
    | undefined
    | { formula: string }
  )[]
) => {
  // 指定した行を取得
  const rowToReplace = worksheet.getRow(rowIndex);

  // 配列の値を指定した行に書き込む（スタイルを保持）
  values.forEach((value, colIndex) => {
    const cell = rowToReplace.getCell(colIndex + 1); // 列番号は1から始まる
    const originalStyle = { ...cell.style }; // 元のスタイルを保持
    cell.value = value; // セルの値を置き換え
    cell.style = originalStyle; // 元のスタイルを再適用
  });
  rowToReplace.commit(); // 変更を確定
};

const fillHolidays = (worksheet: ExcelJS.Worksheet, holiday: number) => {
  worksheet.eachRow((row, rowIndex) => {
    if (rowIndex > 55) return;
    const firstCellValue = row.getCell(1).value; // 1つ目のセルの値を取得
    const fifteenthCellValue = row.getCell(15).value; // 15個目のセルの値を取得

    // 指定した半角数字と一致するか確認
    if (firstCellValue === holiday || fifteenthCellValue === holiday) {
      const firstCell = holiday === firstCellValue ? 1 : 15; // 1つ目のセルまたは15個目のセルを取得
      // 一致した場合、右に14セルを塗りつぶす
      for (let colIndex = 0; colIndex < 14; colIndex++) {
        const cell = row.getCell(colIndex + firstCell); // 列番号は1から始まる
        const originalStyle = { ...cell.style }; // 元のスタイルを保持
        //console.log(cell.address); // スタイルをデバッグ出力
        //console.log(cell.style); // スタイルをデバッグ出力
        const originalFill = cell.style.fill; // 元の塗りつぶしを保持
        const originalBgColor =
          cell.style.fill?.type === "pattern"
            ? cell.style.fill.fgColor
            : undefined; // 前景色を保持
        //console.log(originalBgColor); // 背景色をデバッグ出力
        //console.log(cell.style.fill); // 塗りつぶしの色をデバッグ出力
        //console.log(originalFill?.type); // 塗りつぶしの色をデバッグ出力
        worksheet.getCell(cell.address).style = {
          ...originalStyle,
        }; // 元のスタイルを再適用
        worksheet.getCell(cell.address).fill = {
          ...originalFill,
          type: "pattern",
          pattern: "lightGray",
          fgColor: { argb: "595959" }, // 塗りつぶしの色をグレーに設定
          bgColor: originalBgColor,
        };
      }
      row.commit(); // 変更を確定
    }
  });
};

export const replaceAllData = async (
  formattedData: (
    | string
    | number
    | { formula: string; ref?: string | undefined }
    | null
  )[][], // フォーマットされたデータ
  yearMonthArray: (string | number | boolean | Date | null | undefined)[], // 年月配列
  userDataArrays: {
    kanadata46: (
      | string
      | number
      | boolean
      | Date
      | null
      | undefined
      | { formula: string }
    )[]; // ユーザーデータ46行目
    namedata47: (
      | string
      | number
      | boolean
      | Date
      | null
      | undefined
      | { formula: string }
    )[]; // ユーザーデータ47行目
    iddata48: (
      | string
      | number
      | boolean
      | Date
      | null
      | undefined
      | { formula: string }
    )[]; // ユーザーデータ48行目
    gradadata49: (
      | string
      | number
      | boolean
      | Date
      | null
      | undefined
      | { formula: string }
    )[]; // ユーザーデータ49行目
  }, // ユーザーデータ配列
  teacherDataArrays: (
    | string
    | number
    | boolean
    | Date
    | null
    | undefined
    | { formula: string }
  )[], // 教員データ配列
  year: number,
  holidays: number[] // 祝日データ
) => {
  try {
    // public ディレクトリに配置されたExcelファイルを取得
    const response = await fetch("/R7_実施報告書.xlsx");
    if (!response.ok) {
      throw new Error("Excelファイルの取得に失敗しました。");
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.getWorksheet("実施報告書"); // シート名で取得
    if (!worksheet) {
      //alert("指定されたシートが見つかりません。");
      return;
    }

    // replaceRowWithArray を使用して11行目を置き換え
    replaceRowWithArray(worksheet, 11, yearMonthArray);
    replaceRowWithArray(worksheet, 65, yearMonthArray);
    replaceRowWithArray(worksheet, 46, userDataArrays.kanadata46);
    replaceRowWithArray(worksheet, 47, userDataArrays.namedata47);
    replaceRowWithArray(worksheet, 48, userDataArrays.iddata48);
    replaceRowWithArray(worksheet, 49, userDataArrays.gradadata49);
    replaceRowWithArray(worksheet, 53, teacherDataArrays);

    // 2. handleReplaceRowsWithFormattedData の処理
    const shiftData = formattedData;
    const usedShiftData: (
      | string
      | number
      | { formula: string; ref?: string }
      | null
    )[][] = [];

    worksheet.eachRow({ includeEmpty: true }, (row, rowIndex) => {
      if (rowIndex > 55) return; // 55行目まで処理

      const firstCellValue = row.getCell(1).value; // 行の1つ目のセルの値を取得
      if (typeof firstCellValue !== "number") return; // 半角数字でない場合はスキップ

      // 配列の1番目の要素と一致するデータを探す
      const matchingData = shiftData.find(
        (data) =>
          Number(data[0]) === firstCellValue &&
          !usedShiftData.some(
            (usedData) => JSON.stringify(usedData) === JSON.stringify(data)
          )
      );

      if (matchingData) {
        //if (usedShiftData.some((usedData) => JSON.stringify(usedData) === JSON.stringify(matchingData))) {
        //  return; // すでに使用済みのデータの場合はスキップ
        //}
        usedShiftData.push(matchingData); // 使用済みデータとして追加

        matchingData[12] = {
          formula: `CEILING(ROUND(((TIME(J${rowIndex},L${rowIndex},0)-TIME(F${rowIndex},H${rowIndex},0))*24-N${rowIndex}/60),3),0.5)`,
          ref: `M${rowIndex}`,
        }; // M列の数式

        matchingData[26] = {
          formula: `CEILING(ROUND(((TIME(X${rowIndex},Z${rowIndex},0)-TIME(T${rowIndex},V${rowIndex},0))*24-AB${rowIndex}/60),3),0.5)`,
          ref: `AA${rowIndex}`,
        }; // AA列の数式

        //console.log("matchingData", matchingData); // デバッグ用

        // 条件に一致する場合、データを置き換える
        matchingData.forEach(
          (
            value:
              | string
              | number
              | boolean
              | Date
              | ExcelJS.CellErrorValue
              | ExcelJS.CellRichTextValue
              | ExcelJS.CellHyperlinkValue
              | ExcelJS.CellFormulaValue
              | ExcelJS.CellSharedFormulaValue
              | null
              | undefined,
            colIndex: number
          ) => {
            const cell = row.getCell(colIndex + 1); // 列番号は1から始まる
            const originalStyle = { ...cell.style }; // 元のスタイルを保持
            cell.value = value; // セルの値を置き換え
            cell.style = originalStyle; // 元のスタイルを再適用
          }
        );

        // 使用したshiftDataを削除
        //shiftData.splice(shiftData.indexOf(matchingData));
        row.commit(); // 変更を確定
      }
    });

    for (let i = 0; i < holidays.length; i++) {
      fillHolidays(worksheet, holidays[i]); // 祝日を塗りつぶす
    }

    // 3. Excel ファイルを保存
    const newWorkbookBuffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([newWorkbookBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(
      blob,
      typeof formattedData[0][1] !== "undefined" && formattedData[0][1] !== null
        ? `R${year - 2018}_${yearMonthArray[4]}月分実施報告書_${
            formattedData[0][1]
          }.xlsx`
        : typeof formattedData[0][15] !== "undefined" &&
          formattedData[0][15] !== null
        ? `R${year - 2018}_${yearMonthArray[4]}月分実施報告書_${
            formattedData[0][15]
          }.xlsx`
        : `R${year - 2018}_${yearMonthArray[4]}月分実施報告書_.xlsx`
    );

    //alert("すべての処理が完了したExcelファイルを保存しました。");
  } catch (error) {
    console.error("Excelファイルの処理中にエラーが発生しました:", error);
    //alert("Excelファイルの処理中にエラーが発生しました。");
  }
};
