/*
임시저장, 저장, 취소 버튼
사용법
- import { saveToLocalStorage, loadfromLocalStorage, clearLocalStorage, DRAFT_KEY } from '@/utils/button';
*/

export const DRAFT_KEY = 'majorCreateDraft';

export const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data))
  alert('임시저장 되었습니다.')
}

export const loadfromLocalStorage = (key) => {
  const draft = localStorage.getItem(key)
  return draft ? JSON.parse(draft) : null
}

export const clearLocalStorage = (key) => {
  localStorage.removeItem(key)
}
