/* ============================================================
   대기·해양 데이터 프로젝트 — 안내 웹앱 공용 스크립트
   index.html / step1~6.html 전 페이지에서 동일하게 사용
   ============================================================ */

/* ------------------------------------------------------------
   [교사 수정 구역] 반별 제출 기한
   ------------------------------------------------------------
   · 날짜는 "YYYY-MM-DD" 형식으로 적습니다. 예: "2026-09-15"
   · null 로 두면 화면에 "미정" 으로 표시됩니다.
   · default : 반을 아직 고르지 않았을 때 보여줄 "범위" (start ~ end)
   · "1"~"8" : 각 반을 골랐을 때 보여줄 "하나의 날짜"
   · plan  = 기획안 PDF / report = 결과 보고서 PDF / webapp = 웹앱 결과물

   예시)
     default: { plan:{start:"2026-09-14", end:"2026-09-18"}, ... }
     "1":     { plan:"2026-09-15", report:"2026-09-25", webapp:"2026-09-25" },
------------------------------------------------------------ */
const SUBMIT_SCHEDULE = {
  default: {
    plan:   { start: null, end: null },
    report: { start: null, end: null },
    webapp: { start: null, end: null }
  },
  "1": { plan: null, report: null, webapp: null },
  "2": { plan: null, report: null, webapp: null },
  "3": { plan: null, report: null, webapp: null },
  "4": { plan: null, report: null, webapp: null },
  "5": { plan: null, report: null, webapp: null },
  "6": { plan: null, report: null, webapp: null },
  "7": { plan: null, report: null, webapp: null },
  "8": { plan: null, report: null, webapp: null }
};
/* ---------------------- [교사 수정 구역 끝] ---------------------- */


/* "2026-09-15" → "9월 15일" (값이 없으면 null) */
function formatDate(iso) {
  if (!iso) return null;
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return `${Number(m[2])}월 ${Number(m[3])}일`;
}

/* 셀에 표시할 문자열 만들기 — 단일 날짜 또는 범위, 없으면 "미정" */
function formatDue(value) {
  if (!value) return null;
  if (typeof value === "string") return formatDate(value);
  const start = formatDate(value.start);
  const end = formatDate(value.end);
  if (start && end) return `${start} ~ ${end}`;
  return start || end || null;
}

/* 제출물 표의 기한 셀 갱신 */
function renderSubmitDates(classKey) {
  const schedule = SUBMIT_SCHEDULE[classKey] || SUBMIT_SCHEDULE.default;
  document.querySelectorAll("[data-due]").forEach(function (cell) {
    const text = formatDue(schedule[cell.dataset.due]);
    cell.textContent = text || "미정";
    cell.dataset.state = text ? "set" : "empty";
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const select = document.getElementById("class-select");
  if (!select) return;
  renderSubmitDates(select.value);
  select.addEventListener("change", function () {
    renderSubmitDates(select.value);
  });
});
