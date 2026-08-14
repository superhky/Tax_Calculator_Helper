/**
 * localStorage 관리 모듈
 * 사용자 입력값 자동 저장/복원 및 테마 설정
 */
const Storage = (() => {
  const STORAGE_KEY = 'tax_calculator_2026';
  const THEME_KEY = 'tax_calculator_theme';

  function saveInputs(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // localStorage가 사용 불가능한 환경(시크릿 모드 등)
    }
  }

  function loadInputs() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function clearInputs() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // 무시
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      // 무시
    }
  }

  function loadTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || 'dark';
    } catch (e) {
      return 'dark';
    }
  }

  return { saveInputs, loadInputs, clearInputs, saveTheme, loadTheme };
})();
