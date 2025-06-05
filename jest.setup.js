// React Testing Library のマッチャーを追加
import '@testing-library/jest-dom'

// Firebase のモック
global.fetch = jest.fn()

// Firebase 関連のモック
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}))

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  onSnapshot: jest.fn(),
  getDoc: jest.fn(),
}))