// 임시저장 버튼

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
