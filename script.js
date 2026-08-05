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

function initClassSelect() {
  const select = document.getElementById("class-select");
  if (!select) return;
  renderSubmitDates(select.value);
  select.addEventListener("change", function () {
    renderSubmitDates(select.value);
  });
}


/* ============================================================
   step2 — 데이터 분석 방법
   ============================================================ */

/* ------------------------------------------------------------
   [교사 수정 구역] step2 데이터 주소
   주소가 바뀌면 아래 두 줄만 고치면 됩니다.
------------------------------------------------------------ */
const STEP2_URL = {
  temp: "https://raw.githubusercontent.com/datasets/global-temp/main/data/annual.csv",
  co2:  "https://raw.githubusercontent.com/datasets/co2-ppm/main/data/co2-annmean-mlo.csv"
};
/* ---------------------- [교사 수정 구역 끝] ---------------------- */

/* 네트워크가 막혔을 때 쓰는 저장본 (2025년 자료까지 미리 받아둔 값) */
const STEP2_FALLBACK = {
  tempHead: "Source,Year,Mean\nGCAG,1850,-0.4265\nGCAG,1851,-0.2635\nGCAG,1852,-0.2241\nGCAG,1853,-0.2623",
  co2Head: "Year,Mean,Uncertainty\n1959,315.98,0.12\n1960,316.91,0.12\n1961,317.64,0.12\n1962,318.45,0.12",
  temp: [[1880,-0.1792],[1881,-0.0917],[1882,-0.115],[1883,-0.1767],[1884,-0.285],[1885,-0.3358],[1886,-0.3167],[1887,-0.365],[1888,-0.1775],[1889,-0.1092],[1890,-0.355],[1891,-0.2258],[1892,-0.2742],[1893,-0.3142],[1894,-0.3067],[1895,-0.2275],[1896,-0.1158],[1897,-0.1125],[1898,-0.2783],[1899,-0.1767],[1900,-0.0858],[1901,-0.155],[1902,-0.2825],[1903,-0.3717],[1904,-0.4767],[1905,-0.2642],[1906,-0.2258],[1907,-0.3883],[1908,-0.43],[1909,-0.4892],[1910,-0.4417],[1911,-0.4483],[1912,-0.3717],[1913,-0.3525],[1914,-0.1633],[1915,-0.1475],[1916,-0.3642],[1917,-0.4625],[1918,-0.3033],[1919,-0.28],[1920,-0.2792],[1921,-0.1917],[1922,-0.285],[1923,-0.2692],[1924,-0.2717],[1925,-0.2233],[1926,-0.1108],[1927,-0.2208],[1928,-0.2033],[1929,-0.3642],[1930,-0.16],[1931,-0.0967],[1932,-0.1625],[1933,-0.2883],[1934,-0.1283],[1935,-0.2017],[1936,-0.1508],[1937,-0.0325],[1938,-0.0033],[1939,-0.0208],[1940,0.1175],[1941,0.1783],[1942,0.0625],[1943,0.0867],[1944,0.2008],[1945,0.095],[1946,-0.0717],[1947,-0.0267],[1948,-0.1058],[1949,-0.1083],[1950,-0.175],[1951,-0.0683],[1952,0.0108],[1953,0.0825],[1954,-0.1317],[1955,-0.14],[1956,-0.1883],[1957,0.0475],[1958,0.0592],[1959,0.0308],[1960,-0.025],[1961,0.0583],[1962,0.0308],[1963,0.0533],[1964,-0.1983],[1965,-0.1067],[1966,-0.055],[1967,-0.0242],[1968,-0.0833],[1969,0.0517],[1970,0.0275],[1971,-0.08],[1972,0.0075],[1973,0.1608],[1974,-0.0717],[1975,-0.0133],[1976,-0.0983],[1977,0.1783],[1978,0.0658],[1979,0.1617],[1980,0.2533],[1981,0.3208],[1982,0.1375],[1983,0.3108],[1984,0.1542],[1985,0.1175],[1986,0.1792],[1987,0.32],[1988,0.3875],[1989,0.2725],[1990,0.4467],[1991,0.405],[1992,0.2217],[1993,0.2308],[1994,0.3125],[1995,0.4433],[1996,0.33],[1997,0.465],[1998,0.6075],[1999,0.3808],[2000,0.3933],[2001,0.5317],[2002,0.6275],[2003,0.615],[2004,0.5325],[2005,0.6783],[2006,0.6392],[2007,0.6642],[2008,0.5425],[2009,0.6567],[2010,0.7225],[2011,0.6067],[2012,0.6458],[2013,0.6758],[2014,0.7483],[2015,0.8958],[2016,1.0117],[2017,0.9142],[2018,0.8483],[2019,0.9775],[2020,1.0067],[2021,0.8467],[2022,0.8908],[2023,1.1675],[2024,1.2842],[2025,1.1917]],
  co2: [[1959,315.98],[1960,316.91],[1961,317.64],[1962,318.45],[1963,318.99],[1964,319.62],[1965,320.04],[1966,321.37],[1967,322.18],[1968,323.05],[1969,324.62],[1970,325.68],[1971,326.32],[1972,327.46],[1973,329.68],[1974,330.19],[1975,331.13],[1976,332.03],[1977,333.84],[1978,335.41],[1979,336.84],[1980,338.76],[1981,340.12],[1982,341.48],[1983,343.15],[1984,344.87],[1985,346.35],[1986,347.61],[1987,349.31],[1988,351.69],[1989,353.2],[1990,354.45],[1991,355.7],[1992,356.54],[1993,357.21],[1994,358.96],[1995,360.97],[1996,362.74],[1997,363.88],[1998,366.84],[1999,368.54],[2000,369.71],[2001,371.32],[2002,373.45],[2003,375.98],[2004,377.7],[2005,379.98],[2006,382.09],[2007,384.02],[2008,385.83],[2009,387.64],[2010,390.1],[2011,391.85],[2012,394.06],[2013,396.74],[2014,398.81],[2015,401.01],[2016,404.41],[2017,406.76],[2018,408.72],[2019,411.65],[2020,414.21],[2021,416.41],[2022,418.53],[2023,421.08],[2024,424.61],[2025,427.35]]
};

/* 현재 페이지가 쓰고 있는 자료 */
let STEP2_DATA = null;


/* ---------- 통계 helper ---------- */
function s2mean(a) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i];
  return s / a.length;
}

/* 피어슨 상관계수 */
function s2corr(x, y) {
  const mx = s2mean(x), my = s2mean(y);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < x.length; i++) {
    const a = x[i] - mx, b = y[i] - my;
    num += a * b; dx += a * a; dy += b * b;
  }
  return num / Math.sqrt(dx * dy);
}

/* 가우스 소거법 — 정규방정식 풀이용 */
function s2solve(A, b) {
  const n = b.length;
  for (let i = 0; i < n; i++) {
    let p = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
    const tA = A[i]; A[i] = A[p]; A[p] = tA;
    const tb = b[i]; b[i] = b[p]; b[p] = tb;
    for (let r = i + 1; r < n; r++) {
      const f = A[r][i] / A[i][i];
      for (let c = i; c < n; c++) A[r][c] -= f * A[i][c];
      b[r] -= f * b[i];
    }
  }
  const out = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i];
    for (let c = i + 1; c < n; c++) s -= A[i][c] * out[c];
    out[i] = s / A[i][i];
  }
  return out;
}

/* 최소제곱 다항회귀.
   수치 안정성을 위해 x를 평균만큼 옮겨서(중심화) 계산한다. */
function s2polyfit(x, y, deg) {
  const n = deg + 1;
  const x0 = s2mean(x);
  const xs = x.map(function (v) { return v - x0; });
  const A = [], b = [];
  for (let i = 0; i < n; i++) {
    A.push(new Array(n).fill(0));
    b.push(0);
    for (let k = 0; k < xs.length; k++) {
      b[i] += Math.pow(xs[k], i) * y[k];
      for (let j = 0; j < n; j++) A[i][j] += Math.pow(xs[k], i + j);
    }
  }
  return { coef: s2solve(A, b), x0: x0, deg: deg };
}

function s2polyval(fit, x) {
  const u = x - fit.x0;
  let s = 0;
  for (let i = 0; i < fit.coef.length; i++) s += fit.coef[i] * Math.pow(u, i);
  return s;
}

/* 중심화 계수를 원래 좌표계 계수로 되돌린다 (화면 표시용) */
function s2expand(fit) {
  const c = fit.coef, x0 = fit.x0;
  if (fit.deg === 1) return { a: c[1], b: c[0] - c[1] * x0 };
  return {
    a: c[2],
    b: c[1] - 2 * c[2] * x0,
    c: c[0] - c[1] * x0 + c[2] * x0 * x0
  };
}

/* 결정계수 R² */
function s2r2(x, y, fit) {
  const my = s2mean(y);
  let ssRes = 0, ssTot = 0;
  for (let i = 0; i < x.length; i++) {
    const d = y[i] - s2polyval(fit, x[i]);
    ssRes += d * d;
    ssTot += (y[i] - my) * (y[i] - my);
  }
  return 1 - ssRes / ssTot;
}

function s2fmt(v, d) {
  const s = Number(v).toFixed(d);
  return /^-0\.?0*$/.test(s) ? s.slice(1) : s;
}


/* ---------- CSV 파싱 ---------- */
function s2parseCSV(text) {
  const rows = text.trim().split(/\r?\n/).map(function (l) { return l.split(","); });
  const head = rows.shift().map(function (h) { return h.trim(); });
  return rows.map(function (r) {
    const o = {};
    head.forEach(function (h, i) { o[h] = (r[i] || "").trim(); });
    return o;
  });
}

/* 기온: 여러 출처가 섞인 파일에서 GISTEMP 행만 골라 [연도, 편차] */
function s2cleanTemp(text) {
  return s2parseCSV(text)
    .filter(function (r) { return r.Source === "GISTEMP" && r.Year && r.Mean; })
    .map(function (r) { return [Number(r.Year), Number(r.Mean)]; })
    .filter(function (r) { return isFinite(r[0]) && isFinite(r[1]); })
    .sort(function (a, b) { return a[0] - b[0]; });
}

/* CO₂: [연도, 농도] */
function s2cleanCO2(text) {
  return s2parseCSV(text)
    .filter(function (r) { return r.Year && r.Mean; })
    .map(function (r) { return [Number(r.Year), Number(r.Mean)]; })
    .filter(function (r) { return isFinite(r[0]) && isFinite(r[1]); })
    .sort(function (a, b) { return a[0] - b[0]; });
}

/* 두 자료를 연도 기준으로 합치기 */
function s2merge(temp, co2) {
  const map = new Map(co2);
  const out = [];
  temp.forEach(function (r) {
    if (map.has(r[0])) out.push([r[0], r[1], map.get(r[0])]);
  });
  return out;
}


/* ---------- SVG 차트 helper ----------
   색·굵기를 CSS 클래스가 아니라 SVG 속성으로 직접 지정한다.
   styles.css가 어긋나 있어도 그래프가 정상적으로 그려지게 하기 위함이다.
   (클래스도 함께 남겨두므로 CSS 쪽에서 덮어쓰는 것도 가능하다) */
const S2C = {
  grid:   "#D8D3C8",
  axis:   "#9AA5AD",
  lbl:    "#9AA5AD",
  axtitle:"#5A6570",
  head:   "#2C363F",
  temp:   "#B25A50",
  co2:    "#4E86A6",
  fit:    "#2C363F",
  fit2:   "#B25A50",
  faint:  "#B6BFC6",
  dot:    "#4E86A6",
  plain:  "#7C8791",
  band:   "#DCEAF0",
  mono:   "'JetBrains Mono', ui-monospace, Menlo, monospace"
};

function s2ticks(min, max, count) {
  const span = max - min;
  if (span <= 0) return [min];
  const raw = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const out = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-6; v += step) {
    out.push(Number(v.toFixed(10)));
  }
  return out;
}

/* 축 눈금 글자 */
function s2text(x, y, s, anchor, color, size, weight) {
  return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || "start") +
    '" fill="' + (color || S2C.lbl) + '" font-size="' + (size || 10.5) +
    '" font-weight="' + (weight || 400) + '" font-family="' + S2C.mono + '">' + s + '</text>';
}

/* 좌표계(패널) 하나 만들기 */
function s2panel(o) {
  const sx = function (v) { return o.x + (v - o.xmin) / (o.xmax - o.xmin) * o.w; };
  const sy = function (v) { return o.y + o.h - (v - o.ymin) / (o.ymax - o.ymin) * o.h; };
  let g = "";
  const xt = o.xticks || s2ticks(o.xmin, o.xmax, 5);
  const yt = o.yticks || s2ticks(o.ymin, o.ymax, 4);

  yt.forEach(function (v) {
    const py = sy(v);
    if (py < o.y - 1 || py > o.y + o.h + 1) return;
    g += '<line x1="' + o.x + '" y1="' + py.toFixed(1) + '" x2="' + (o.x + o.w) +
      '" y2="' + py.toFixed(1) + '" stroke="' + S2C.grid + '" stroke-width="1"/>';
    g += s2text(o.x - 8, (py + 3.5).toFixed(1), (o.yfmt ? o.yfmt(v) : v), "end");
  });
  xt.forEach(function (v) {
    const px = sx(v);
    if (px < o.x - 1 || px > o.x + o.w + 1) return;
    g += s2text(px.toFixed(1), o.y + o.h + 17, (o.xfmt ? o.xfmt(v) : v), "middle");
  });
  g += '<line x1="' + o.x + '" y1="' + (o.y + o.h) + '" x2="' + (o.x + o.w) +
    '" y2="' + (o.y + o.h) + '" stroke="' + S2C.axis + '" stroke-width="1"/>';
  if (o.title) {
    g += '<text x="' + (o.x + o.w / 2).toFixed(1) + '" y="' + (o.y - 12) +
      '" text-anchor="middle" fill="' + S2C.head + '" font-size="12.5" font-weight="700">' + o.title + '</text>';
  }
  return { sx: sx, sy: sy, g: g };
}

/* 선 하나 */
function s2line(pts, p, color, width, dashed) {
  const d = pts.map(function (v, i) {
    return (i ? "L" : "M") + p.sx(v[0]).toFixed(1) + " " + p.sy(v[1]).toFixed(1);
  }).join(" ");
  return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + (width || 2) +
    '" stroke-linejoin="round" stroke-linecap="round"' +
    (dashed ? ' stroke-dasharray="5 4"' : '') + '/>';
}

function s2dots(pts, p, color, r) {
  return pts.map(function (v) {
    return '<circle cx="' + p.sx(v[0]).toFixed(1) + '" cy="' + p.sy(v[1]).toFixed(1) +
      '" r="' + (r || 3) + '" fill="' + color + '" fill-opacity="0.55"/>';
  }).join("");
}

/* 막대 */
function s2bars(pts, p, baseY, color, bw) {
  return pts.map(function (v) {
    const x = p.sx(v[0]) - bw / 2;
    const y = p.sy(v[1]);
    const h = Math.max(0, baseY - y);
    return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw +
      '" height="' + h.toFixed(1) + '" fill="' + color + '" fill-opacity="0.85"/>';
  }).join("");
}

function s2svg(w, h, inner) {
  return '<svg class="chart-svg" viewBox="0 0 ' + w + ' ' + h +
    '" role="img" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
}

/* 회귀식을 촘촘한 점 목록으로 */
function s2curve(fit, xmin, xmax, steps) {
  const n = steps || 80, out = [];
  for (let i = 0; i <= n; i++) {
    const x = xmin + (xmax - xmin) * i / n;
    out.push([x, s2polyval(fit, x)]);
  }
  return out;
}


/* ---------- 섹션 04 차트 ---------- */
function s2chartCorrTime(el) {
  const m = STEP2_DATA.merged;
  const W = 720, H = 300, PX = 54, PY = 34, PW = W - PX - 58, PH = H - PY - 44;
  const years = m.map(function (d) { return d[0]; });
  const ts = m.map(function (d) { return d[1]; });
  const cs = m.map(function (d) { return d[2]; });

  const tmin = Math.min.apply(null, ts), tmax = Math.max.apply(null, ts);
  const cmin = Math.min.apply(null, cs), cmax = Math.max.apply(null, cs);
  const tpad = (tmax - tmin) * .12, cpad = (cmax - cmin) * .12;

  const pT = s2panel({
    x: PX, y: PY, w: PW, h: PH,
    xmin: years[0], xmax: years[years.length - 1],
    ymin: tmin - tpad, ymax: tmax + tpad,
    yfmt: function (v) { return v.toFixed(1); },
    xfmt: function (v) { return String(Math.round(v)); }
  });
  const pC = s2panel({
    x: PX, y: PY, w: PW, h: PH,
    xmin: years[0], xmax: years[years.length - 1],
    ymin: cmin - cpad, ymax: cmax + cpad
  });

  let g = pT.g;
  s2ticks(cmin - cpad, cmax + cpad, 4).forEach(function (v) {
    const py = pC.sy(v);
    if (py < PY - 1 || py > PY + PH + 1) return;
    g += s2text(PX + PW + 8, (py + 3.5).toFixed(1), Math.round(v), "start");
  });
  g += s2text(2, PY - 12, "기온 편차 (℃)", "start", S2C.axtitle);
  g += s2text(PX + PW, PY - 12, "CO₂ (ppm)", "end", S2C.axtitle);
  g += s2line(m.map(function (d) { return [d[0], d[2]]; }), pC, S2C.co2, 2);
  g += s2line(m.map(function (d) { return [d[0], d[1]]; }), pT, S2C.temp, 2);

  el.innerHTML = s2svg(W, H, g);
}

function s2chartCorrScatter(el) {
  const m = STEP2_DATA.merged;
  const W = 720, H = 300, PX = 54, PY = 34, PW = W - PX - 26, PH = H - PY - 50;
  const cs = m.map(function (d) { return d[2]; });
  const ts = m.map(function (d) { return d[1]; });
  const cmin = Math.min.apply(null, cs), cmax = Math.max.apply(null, cs);
  const tmin = Math.min.apply(null, ts), tmax = Math.max.apply(null, ts);
  const cpad = (cmax - cmin) * .06, tpad = (tmax - tmin) * .1;

  const p = s2panel({
    x: PX, y: PY, w: PW, h: PH,
    xmin: cmin - cpad, xmax: cmax + cpad,
    ymin: tmin - tpad, ymax: tmax + tpad,
    yfmt: function (v) { return v.toFixed(1); },
    xfmt: function (v) { return String(Math.round(v)); }
  });
  let g = p.g;
  g += s2text(2, PY - 12, "기온 편차 (℃)", "start", S2C.axtitle);
  g += s2text((PX + PW / 2).toFixed(1), H - 6, "CO₂ 농도 (ppm)", "middle", S2C.axtitle);
  g += s2dots(m.map(function (d) { return [d[2], d[1]]; }), p, S2C.co2, 3.6);
  el.innerHTML = s2svg(W, H, g);
}


/* ---------- 섹션 05 차트 ---------- */
function s2chartRegression(el) {
  const t = STEP2_DATA.temp;
  const W = 720, H = 320, PX = 54, PY = 34, PW = W - PX - 26, PH = H - PY - 50;
  const xs = t.map(function (d) { return d[0]; });
  const ys = t.map(function (d) { return d[1]; });
  const f1 = s2polyfit(xs, ys, 1);
  const f2 = s2polyfit(xs, ys, 2);
  const xlast = xs[xs.length - 1];
  const XEND = 2050;

  const cand = ys.concat([
    s2polyval(f1, XEND), s2polyval(f2, XEND),
    s2polyval(f1, xs[0]), s2polyval(f2, xs[0])
  ]);
  const ymin = Math.min.apply(null, cand), ymax = Math.max.apply(null, cand);
  const pad = (ymax - ymin) * .1;

  const p = s2panel({
    x: PX, y: PY, w: PW, h: PH,
    xmin: xs[0], xmax: XEND,
    ymin: ymin - pad, ymax: ymax + pad,
    yfmt: function (v) { return v.toFixed(1); },
    xfmt: function (v) { return String(Math.round(v)); }
  });
  /* 예측 구간 음영은 격자보다 먼저 깔아야 선이 가려지지 않는다 */
  let g = '<rect x="' + p.sx(xlast).toFixed(1) + '" y="' + PY + '" width="' +
    (p.sx(XEND) - p.sx(xlast)).toFixed(1) + '" height="' + PH +
    '" fill="' + S2C.band + '" fill-opacity="0.55"/>';
  g += p.g;
  g += s2text(2, PY - 12, "기온 편차 (℃)", "start", S2C.axtitle);
  g += s2text((PX + PW / 2).toFixed(1), H - 6, "연도", "middle", S2C.axtitle);
  g += s2dots(t, p, S2C.plain, 2.6);
  g += s2line(s2curve(f1, xs[0], xlast), p, S2C.fit, 2);
  g += s2line(s2curve(f2, xs[0], xlast), p, S2C.fit2, 2);
  g += s2line(s2curve(f1, xlast, XEND, 20), p, S2C.fit, 2, true);
  g += s2line(s2curve(f2, xlast, XEND, 20), p, S2C.fit2, 2, true);
  g += s2text(((p.sx(xlast) + p.sx(XEND)) / 2).toFixed(1), PY + 14, "예측 구간", "middle", S2C.axtitle);
  el.innerHTML = s2svg(W, H, g);
}


/* ---------- 섹션 07 차트 — 전부 설명용 임의 데이터 ---------- */
/* 매번 같은 그림이 나오도록 결정적 의사난수를 쓴다 */
function s2demoLine(n, a, b, amp, seed) {
  let s = seed || 1;
  const rnd = function () { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648 - .5; };
  const out = [];
  for (let i = 0; i < n; i++) out.push([i, a * i + b + rnd() * amp]);
  return out;
}

function s2mistakeOutlier(el) {
  const base = s2demoLine(14, .45, 2, .9, 7);
  const withOut = base.concat([[1, 12.5]]);
  const fitA = s2polyfit(base.map(function (d) { return d[0]; }), base.map(function (d) { return d[1]; }), 1);
  const fitB = s2polyfit(withOut.map(function (d) { return d[0]; }), withOut.map(function (d) { return d[1]; }), 1);

  const W = 720, H = 300, PX = 48, PY = 24, PW = W - PX - 26, PH = H - PY - 44;
  const p = s2panel({
    x: PX, y: PY, w: PW, h: PH,
    xmin: -.6, xmax: 13.6, ymin: 0, ymax: 15,
    xfmt: function (v) { return String(Math.round(v)); }
  });
  let g = p.g;
  g += s2dots(base, p, S2C.plain, 4);
  g += '<circle cx="' + p.sx(1).toFixed(1) + '" cy="' + p.sy(12.5).toFixed(1) +
    '" r="5.5" fill="' + S2C.temp + '"/>';
  g += s2line(s2curve(fitA, 0, 13, 2), p, S2C.fit, 2);
  g += s2line(s2curve(fitB, 0, 13, 2), p, S2C.temp, 2);
  g += s2text((p.sx(1) + 12).toFixed(1), (p.sy(12.5) + 4).toFixed(1), "이상치", "start", S2C.temp);
  g += s2text(p.sx(3.4).toFixed(1), (p.sy(s2polyval(fitA, 3.4)) + 18).toFixed(1), "이상치 제외", "end", S2C.fit);
  g += s2text(p.sx(3.4).toFixed(1), (p.sy(s2polyval(fitB, 3.4)) - 10).toFixed(1), "이상치 포함", "end", S2C.temp);
  el.innerHTML = s2svg(W, H, g);
}

/* 축 왜곡 — 막대그래프 두 개를 나란히 */
function s2mistakeAxis(el) {
  const d = [];
  for (let i = 0; i < 10; i++) d.push([i, 20 + i * 0.06]);
  const W = 720, H = 300, PY = 40, PH = H - PY - 44, PW = 280;
  const A = s2panel({ x: 54, y: PY, w: PW, h: PH, xmin: -.8, xmax: 9.8, ymin: 0, ymax: 25, xfmt: function (v) { return String(Math.round(v)); }, title: "y축을 0부터" });
  const B = s2panel({ x: 54 + PW + 66, y: PY, w: PW, h: PH, xmin: -.8, xmax: 9.8, ymin: 19.9, ymax: 20.6, yfmt: function (v) { return v.toFixed(1); }, xfmt: function (v) { return String(Math.round(v)); }, title: "y축을 좁게 확대" });
  const baseY = PY + PH;
  let g = A.g + B.g;
  g += s2bars(d, A, baseY, S2C.co2, 20);
  g += s2bars(d, B, baseY, S2C.co2, 20);
  el.innerHTML = s2svg(W, H, g);
}

function s2mistakeSlice(el) {
  const d = [];
  for (let i = 0; i < 40; i++) {
    const plateau = i < 16 ? 0 : -Math.min(i - 16, 10) * 0.11;
    d.push([i, i * 0.12 + plateau + Math.sin(i * 1.7) * 0.09]);
  }
  const slice = d.slice(16, 27);
  const W = 720, H = 300, PY = 40, PH = H - PY - 44, PW = 280;
  const A = s2panel({ x: 54, y: PY, w: PW, h: PH, xmin: 0, xmax: 39, ymin: -.3, ymax: 3.6, yfmt: function (v) { return v.toFixed(1); }, xfmt: function (v) { return String(Math.round(v)); }, title: "전체 구간" });
  const B = s2panel({ x: 54 + PW + 66, y: PY, w: PW, h: PH, xmin: 16, xmax: 26, ymin: 1.3, ymax: 2.5, yfmt: function (v) { return v.toFixed(1); }, xfmt: function (v) { return String(Math.round(v)); }, title: "가운데만 잘라내면" });
  let g = '<rect x="' + A.sx(16).toFixed(1) + '" y="' + PY + '" width="' +
    (A.sx(26) - A.sx(16)).toFixed(1) + '" height="' + PH +
    '" fill="' + S2C.band + '" fill-opacity="0.75"/>';
  g += A.g + B.g;
  g += s2line(d, A, S2C.temp, 2);
  g += s2line(slice, B, S2C.temp, 2);
  el.innerHTML = s2svg(W, H, g);
}

function s2mistakeGeneral(el) {
  const slopes = [.04, .07, .05, .03, .06, .19];
  const series = slopes.map(function (a, i) { return s2demoLine(20, a, 1 + i * .12, .22, 11 + i * 5); });
  const W = 720, H = 300, PX = 48, PY = 24, PW = W - PX - 60, PH = H - PY - 44;
  const p = s2panel({
    x: PX, y: PY, w: PW, h: PH,
    xmin: 0, xmax: 19, ymin: .5, ymax: 5.4,
    yfmt: function (v) { return v.toFixed(1); },
    xfmt: function (v) { return String(Math.round(v)); }
  });
  let g = p.g;
  series.forEach(function (s, i) {
    if (i !== 5) g += s2line(s, p, S2C.faint, 1.4);
  });
  g += s2line(series[5], p, S2C.temp, 2.4);
  g += s2text(PX + PW + 6, (p.sy(series[5][19][1]) + 3.5).toFixed(1), "지점 F", "start", S2C.temp);
  g += s2text(PX + PW + 6, (p.sy(series[2][19][1]) + 3.5).toFixed(1), "그 외 5개", "start", S2C.lbl);
  el.innerHTML = s2svg(W, H, g);
}


/* ---------- 화면 갱신 ---------- */
function s2renderPeek() {
  const a = document.getElementById("peek-temp");
  const b = document.getElementById("peek-co2");
  if (a) a.textContent = STEP2_DATA.tempHead;
  if (b) b.textContent = STEP2_DATA.co2Head;
  document.querySelectorAll("[data-srcflag]").forEach(function (f) {
    f.dataset.src = STEP2_DATA.source;
    f.textContent = STEP2_DATA.source === "live" ? "방금 불러온 자료 기준" : "저장된 자료 기준";
  });
}

function s2renderTable() {
  const tb = document.getElementById("clean-tbody");
  if (!tb) return;
  tb.innerHTML = STEP2_DATA.merged.slice(-6).map(function (r) {
    return '<tr><th scope="row">' + r[0] + '</th><td class="num-col">' + r[1].toFixed(3) + '</td><td class="num-col">' + r[2].toFixed(2) + '</td></tr>';
  }).join("");
}

function s2renderStats() {
  const m = STEP2_DATA.merged;
  const set = function (id, v) { const e = document.getElementById(id); if (e) e.innerHTML = v; };
  set("stat-range", m[0][0] + "–" + m[m.length - 1][0]);
  set("stat-n", m.length + '<small>개 연도</small>');
  set("stat-base", '20세기 평균<small>기온 기준</small>');
}

function s2renderCorr() {
  const m = STEP2_DATA.merged;
  const r = s2corr(m.map(function (d) { return d[2]; }), m.map(function (d) { return d[1]; }));
  document.querySelectorAll("[data-rval]").forEach(function (e) { e.textContent = s2fmt(r, 2); });
  const a = document.getElementById("chart-corr-a");
  const b = document.getElementById("chart-corr-b");
  if (a) { s2chartCorrTime(a); a.dataset.done = "1"; }
  if (b) { s2chartCorrScatter(b); b.dataset.done = "1"; }
}

function s2renderReg() {
  const t = STEP2_DATA.temp;
  const xs = t.map(function (d) { return d[0]; });
  const ys = t.map(function (d) { return d[1]; });
  const f1 = s2polyfit(xs, ys, 1), e1 = s2expand(f1);
  const f2 = s2polyfit(xs, ys, 2);
  const f8 = s2polyfit(xs, ys, 8);
  const set = function (id, v) { const e = document.getElementById(id); if (e) e.textContent = v; };
  set("reg-a", s2fmt(e1.a, 4));
  set("reg-b", s2fmt(e1.b, 2));
  set("reg-pred1", s2fmt(s2polyval(f1, 2050), 2));
  set("reg-pred2", s2fmt(s2polyval(f2, 2050), 2));
  set("reg-r2-1", s2fmt(s2r2(xs, ys, f1), 2));
  set("reg-r2-2", s2fmt(s2r2(xs, ys, f2), 2));
  set("reg-r2-8", s2fmt(s2r2(xs, ys, f8), 2));
  const c = document.getElementById("chart-reg");
  if (c) { s2chartRegression(c); c.dataset.done = "1"; }
}

function s2renderAll() {
  s2renderPeek();
  s2renderTable();
  s2renderStats();
  s2renderCorr();
  s2renderReg();
  document.querySelectorAll("[data-needsdata]").forEach(function (e) { e.hidden = false; });
  document.querySelectorAll(".chart-empty").forEach(function (e) { e.remove(); });
}

function s2useFallback() {
  STEP2_DATA = {
    temp: STEP2_FALLBACK.temp.slice(),
    co2: STEP2_FALLBACK.co2.slice(),
    tempHead: STEP2_FALLBACK.tempHead,
    co2Head: STEP2_FALLBACK.co2Head,
    source: "fallback"
  };
  STEP2_DATA.merged = s2merge(STEP2_DATA.temp, STEP2_DATA.co2);
  s2renderAll();
}


/* ---------- 로더 ---------- */
function initStep2Loader() {
  const box = document.getElementById("loader");
  if (!box) return;
  const inT = document.getElementById("url-temp");
  const inC = document.getElementById("url-co2");
  const btnFill = document.getElementById("btn-fill");
  const btnLoad = document.getElementById("btn-load");
  const btnFb = document.getElementById("btn-fallback");
  const state = document.getElementById("load-state");

  const say = function (msg, cls) {
    state.textContent = msg;
    state.className = "lstate" + (cls ? " " + cls : "");
  };

  btnFill.addEventListener("click", function () {
    inT.value = STEP2_URL.temp;
    inC.value = STEP2_URL.co2;
    say("주소를 채웠습니다. 이제 ‘불러오기’를 눌러 보세요.");
  });

  btnLoad.addEventListener("click", function () {
    if (!inT.value.trim() || !inC.value.trim()) {
      say("먼저 ‘채우기’를 눌러 주소를 넣어 주세요.", "err");
      return;
    }
    say("불러오는 중…");
    btnLoad.disabled = true;
    Promise.all([
      fetch(inT.value.trim()).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }),
      fetch(inC.value.trim()).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    ]).then(function (res) {
      const temp = s2cleanTemp(res[0]);
      const co2 = s2cleanCO2(res[1]);
      if (!temp.length || !co2.length) throw new Error("empty");
      STEP2_DATA = {
        temp: temp, co2: co2,
        tempHead: res[0].trim().split(/\r?\n/).slice(0, 5).join("\n"),
        co2Head: res[1].trim().split(/\r?\n/).slice(0, 5).join("\n"),
        source: "live"
      };
      STEP2_DATA.merged = s2merge(temp, co2);
      s2renderAll();
      say("불러왔습니다. 기온 " + temp.length + "개, CO₂ " + co2.length + "개 연도 자료입니다.", "ok");
      btnFb.hidden = true;
      btnLoad.disabled = false;
    }).catch(function () {
      say("지금은 인터넷 연결 문제로 데이터를 불러오지 못했습니다.", "err");
      btnFb.hidden = false;
      btnLoad.disabled = false;
    });
  });

  btnFb.addEventListener("click", function () {
    s2useFallback();
    say("저장된 자료로 아래 내용을 채웠습니다. 실시간 자료가 아니라는 점만 기억해 두세요.", "ok");
    btnFb.hidden = true;
  });
}


/* ---------- 토글 (탭) ---------- */
function initToggles() {
  document.querySelectorAll("[data-toggle]").forEach(function (bar) {
    const btns = Array.prototype.slice.call(bar.querySelectorAll("button"));
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) {
          const on = b === btn;
          b.setAttribute("aria-selected", on ? "true" : "false");
          const panel = document.getElementById(b.getAttribute("aria-controls"));
          if (panel) panel.hidden = !on;
        });
        const fn = btn.dataset.render;
        const panel = document.getElementById(btn.getAttribute("aria-controls"));
        const target = panel && panel.querySelector(".chart-slot");
        if (fn && window[fn] && target && !target.dataset.done) {
          window[fn](target);
          target.dataset.done = "1";
        }
      });
    });
  });
}


/* ---------- 확인 문제 ---------- */
function initQuiz() {
  document.querySelectorAll(".quiz").forEach(function (quiz) {
    const fb = quiz.querySelector(".fb");
    quiz.querySelectorAll(".choices button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        quiz.querySelectorAll(".choices button").forEach(function (b) {
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
        const ok = btn.dataset.correct === "1";
        fb.className = "fb " + (ok ? "ok" : "no");
        fb.textContent = btn.dataset.fb || "";
      });
    });
  });
}


/* ---------- 코드 복사 ---------- */
function initCopyButtons() {
  document.querySelectorAll(".codeblock .copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const pre = btn.parentElement.querySelector("pre");
      if (!pre || !navigator.clipboard) return;
      navigator.clipboard.writeText(pre.innerText).then(function () {
        const old = btn.textContent;
        btn.textContent = "복사됨";
        btn.classList.add("done");
        setTimeout(function () { btn.textContent = old; btn.classList.remove("done"); }, 1400);
      });
    });
  });
}

/* 07 섹션은 자료를 불러오지 않아도 되므로 첫 탭을 바로 그린다 */
function initMistakeCharts() {
  const first = document.querySelector("#panel-m1 .chart-slot");
  if (first && !first.dataset.done) {
    s2mistakeOutlier(first);
    first.dataset.done = "1";
  }
}

window.s2mistakeOutlier = s2mistakeOutlier;
window.s2mistakeAxis = s2mistakeAxis;
window.s2mistakeSlice = s2mistakeSlice;
window.s2mistakeGeneral = s2mistakeGeneral;


document.addEventListener("DOMContentLoaded", function () {
  initClassSelect();
  initStep2Loader();
  initToggles();
  initQuiz();
  initCopyButtons();
  initMistakeCharts();
});
