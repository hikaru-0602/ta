'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface SubjectItem {
  LessonId: number;
  授業名: string;
  担当教員名: string;
}

export default function SearchPage() {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<SubjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // デバウンス用のタイマー
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  const searchSubjects = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search-subjects?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('検索エラー:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // デバウンス処理：入力が止まってから300ms後に検索実行
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (inputValue.trim().length > 0) {
        searchSubjects(inputValue);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [inputValue, searchSubjects]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setSelectedSubject(null);
  };

  const handleSuggestionClick = (subject: SubjectItem) => {
    setInputValue(subject.授業名);
    setSelectedSubject(subject);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // 少し遅延させてクリックイベントを処理できるようにする
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">科目名検索システム</h1>

      <div className="relative mb-6">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="科目名を入力してください..."
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {/* 予測候補のドロップダウン */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((subject, index) => (
              <div
                key={`${subject.LessonId}-${index}`}
                onClick={() => handleSuggestionClick(subject)}
                className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                  index === selectedIndex
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900">{subject.授業名}</div>
                <div className="text-sm text-gray-600">
                  ID: {subject.LessonId} | 担当: {subject.担当教員名}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 選択された科目の詳細表示 */}
      {selectedSubject && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-800 mb-3">選択された科目</h2>
          <div className="space-y-2">
            <div>
              <span className="font-medium text-gray-700">科目名:</span>
              <span className="ml-2 text-gray-900">{selectedSubject.授業名}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Lesson ID:</span>
              <span className="ml-2 text-gray-900">{selectedSubject.LessonId}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">担当教員:</span>
              <span className="ml-2 text-gray-900">{selectedSubject.担当教員名}</span>
            </div>
          </div>
        </div>
      )}

      {/* 使用方法の説明 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-800 mb-2">使用方法</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• テキストフィールドに科目名の一部を入力してください</li>
          <li>• リアルタイムで一致する科目の候補が表示されます</li>
          <li>• ↑↓キーで候補を選択し、Enterで確定できます</li>
          <li>• マウスクリックでも候補を選択できます</li>
          <li>• Escキーで候補リストを閉じることができます</li>
        </ul>
      </div>
    </div>
  );
}