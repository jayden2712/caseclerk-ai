// Bản thử giao diện. AI được giả lập: bấm nút sẽ "soạn" văn bản dựng sẵn sau một nhịp chờ.
(function () {
  "use strict";

  const MODEL_COST = { Haiku: 0.002, Sonnet: 0.045, Opus: 0.09 };
  const AI_DELAY_MS = 900;
  const OPUS_LOOSE_THRESHOLD = 3;

  /** @type {{current:string, visited:string[], assign:Record<string,string|null>, ai:Record<string,string>, cost:number, selectedDx:string, snoop:boolean[]}} */
  let state = {
    current: SECTIONS[0].id,
    visited: [],
    assign: { ...INITIAL_ASSIGN },
    ai: {},
    cost: 0,
    selectedDx: "d1",
    flags: RED_FLAGS.map((s) => s.on),
    answers: {},
    fromSearch: null,
  };

  const MATRIX = window.MATRIX || null;
  const SYMPTOM_BY_ID = new Map(MATRIX ? MATRIX.symptoms.map((s) => [s.id, s]) : []);
  const LECTURE_NAMES = {
    "dot-quy": "Đột quỵ",
    "dau-dau": "Đau đầu",
    "chong-mat": "Chóng mặt",
    "liet-van-dong": "Liệt vận động",
    "than-kinh-ngoai-bien": "Thần kinh ngoại biên",
    "dong-kinh": "Động kinh",
    parkinson: "Parkinson",
    "kham-day-than-kinh-so": "Khám dây thần kinh sọ",
  };
  const SHOW_UNASKED = 4;
  const SHOW_OTHERS = 3;

  function setState(patch) {
    state = { ...state, ...patch };
    render();
  }

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // ---------- Chọn mô hình tự động ----------
  function looseCount() {
    return Object.values(state.assign).filter((v) => v === null).length;
  }

  function pickModel(sectionId) {
    if (sectionId === "tom-tat") return { model: "Haiku", why: "Việc diễn đạt lại thông tin đã có" };
    if (sectionId === "bien-luan-ls" && looseCount() >= OPUS_LOOSE_THRESHOLD) {
      return { model: "Opus", why: `Nâng lên Opus vì còn ${looseCount()} triệu chứng chưa xếp vào hội chứng` };
    }
    return { model: "Sonnet", why: "Bước biện luận" };
  }

  // ---------- Khối AI giả lập ----------
  function aiBlock(id, bodyHtml, sourceKey) {
    const status = state.ai[id] || "idle";
    const { model, why } = pickModel(state.current);
    const head = `<div class="ai-head"><span class="ai-label">AI soạn nháp</span><span class="model" title="${esc(why)}">${model}</span></div>`;
    if (status === "idle") {
      return `<div class="ai-block">${head}<div class="btn-row"><button class="btn ai" data-action="ai" data-id="${id}">Soạn nháp</button><span class="source" style="margin:0">${esc(why)}</span></div></div>`;
    }
    if (status === "loading") {
      return `<div class="ai-block">${head}<div class="ai-body loading">${model} đang đọc bài giảng và soạn…</div></div>`;
    }
    const src = sourceKey ? `<div class="source">${esc(SOURCES[sourceKey])} · kho kiến thức đã nạp</div>` : "";
    return `<div class="ai-block">${head}<div class="ai-body">${bodyHtml}</div>${src}</div>`;
  }

  function runAi(id) {
    const { model } = pickModel(state.current);
    setState({ ai: { ...state.ai, [id]: "loading" } });
    setTimeout(() => {
      setState({ ai: { ...state.ai, [id]: "done" }, cost: state.cost + MODEL_COST[model] });
    }, AI_DELAY_MS);
  }

  // ---------- Mẩu dựng sẵn ----------
  const kvRows = (rows) =>
    `<div class="kv">${rows.map(([k, v]) => `<div class="k">${esc(k)}</div><div><input value="${esc(v)}" aria-label="${esc(k)}"></div>`).join("")}</div>`;

  const kvText = (rows) =>
    `<div class="kv">${rows.map(([k, v]) => `<div class="k">${esc(k)}</div><div><textarea rows="2" aria-label="${esc(k)}">${esc(v)}</textarea></div>`).join("")}</div>`;

  const ul = (items) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;

  function head(sec, hint) {
    return `<div class="sec-head"><span class="sec-num">${sec.num}</span><h2 class="sec-title">${esc(sec.title)}</h2></div><p class="sec-hint">${hint}</p>`;
  }

  // ---------- Từng mục ----------
  const VIEWS = {
    "hanh-chanh": (s) => head(s, "Tên bệnh nhân chỉ ghi viết tắt. Ứng dụng không lưu thông tin định danh.") + kvRows(CASE.hanhChanh),

    "ly-do": (s) =>
      head(s, "Một triệu chứng chính khiến bệnh nhân nhập viện.") +
      `<div class="kv"><div class="k">Lý do</div><div><input value="${esc(CASE.lyDo)}" aria-label="Lý do nhập viện"></div></div>`,

    "benh-su": (s) =>
      head(s, "Ghi theo mốc thời gian. Với mỗi triệu chứng, nêu tính chất, mức độ, cường độ, yếu tố tăng giảm.") +
      `<div class="timeline">${CASE.benhSu
        .map((b) => `<div class="tl-item"><div class="tl-moc">${esc(b.moc)}</div><textarea class="field" rows="3">${esc(b.text)}</textarea></div>`)
        .join("")}</div>` +
      `<div class="review"><b>Gợi ý hỏi thêm:</b> cơn đau đầu có đánh thức bệnh nhân lúc ngủ không, có tăng khi ho, rặn không?</div>`,

    "tien-can": (s) => head(s, "Bản thân (nội, ngoại, sản khoa, thói quen, dị ứng) và gia đình.") + kvText(CASE.tienCan),

    "dien-tien": (s) =>
      head(s, "Bảng theo dõi từ lúc nhập viện, đúng mẫu ba cột của khoa.") +
      `<table class="grid"><thead><tr><th style="width:110px">Thời gian</th><th>Diễn tiến</th><th>Chỉ định</th></tr></thead><tbody>${CASE.dienTien
        .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`)
        .join("")}</tbody></table><div class="btn-row" style="margin-top:10px"><button class="btn">Thêm dòng</button></div>`,

    "luoc-qua": (s) => head(s, "Hỏi theo từng hệ cơ quan tại thời điểm làm bệnh án.") + kvText(CASE.luocQua),

    kham: viewKham,
    "tom-tat": viewTomTat,
    "dat-van-de": viewDatVanDe,
    "tra-cuu": viewTraCuu,
    "chan-doan": viewChanDoan,
    "bien-luan-ls": viewBienLuanLs,
    "de-nghi": viewDeNghi,
    "ket-qua": viewKetQua,
    "bien-luan-cls": viewBienLuanCls,
    "chan-doan-xd": viewChanDoanXd,
    "dieu-tri": viewDieuTri,
  };

  function viewKham(s) {
    const { E, V, M } = CASE.gcs;
    const opt = (max, val) => Array.from({ length: max }, (_, i) => `<option ${i + 1 === val ? "selected" : ""}>${i + 1}</option>`).join("");
    const p = CASE.sucCo;
    const pw = (k, v) => `<input data-power="${k}" value="${v}" class="${v < 5 ? "weak" : ""}" aria-label="Sức cơ ${k}">`;
    return (
      head(s, "Khám tổng quát rồi khám thần kinh 8 phần. Các thang điểm tự tính.") +
      `<h3>Sinh hiệu</h3>${kvRows(CASE.sinhHieu)}` +
      `<h3>1. Chức năng thần kinh cao cấp</h3>
       <div class="calc"><label>E <select data-gcs>${opt(4, E)}</select></label><label>V <select data-gcs>${opt(5, V)}</select></label><label>M <select data-gcs>${opt(6, M)}</select></label><span class="score" id="gcs">GCS ${E + V + M}</span></div>
       <p style="font-size:14px;color:var(--ink-2)">MMSE ${CASE.mmse} điểm: không suy giảm nhận thức</p>` +
      `<h3>3. Mười hai đôi dây thần kinh sọ</h3>${kvRows(CASE.daySo.map(([k, v]) => [`Dây ${k}`, v]))}` +
      `<h3>4. Vận động: sức cơ</h3><div class="power"><div class="hd"></div><div class="hd">Phải</div><div class="hd">Trái</div><div class="hd">Tay</div><div>${pw("tayP", p.tayP)}</div><div>${pw("tayT", p.tayT)}</div><div class="hd">Chân</div><div>${pw("chanP", p.chanP)}</div><div>${pw("chanT", p.chanT)}</div></div>` +
      `<h3>5–7. Cảm giác, phản xạ, màng não</h3>${kvRows([["Cảm giác", CASE.camGiac], ...CASE.phanXa, ["Dấu màng não", CASE.mangNao]])}`
    );
  }

  function viewTomTat(s) {
    const byKind = (k) => SYMPTOMS.filter((x) => x.kind === k).map((x) => x.text);
    const body =
      `<p>Bệnh nhân nữ, 52 tuổi, nhập viện vì đau đầu. Qua hỏi bệnh và thăm khám ghi nhận:</p>` +
      `<b>Triệu chứng cơ năng</b>${ul(byKind("TCCN"))}<b>Triệu chứng thực thể</b>${ul(byKind("TCTT"))}` +
      `<b>Tiền căn</b>${ul(["Tăng huyết áp 12 năm", "Đái tháo đường 3–4 năm"])}<b>Thói quen</b>${ul(["Rượu bia khi có tiệc", "Thuốc bắc 20 ngày, ngưng 10 ngày trước NV"])}`;
    return head(s, "AI gom từ các mục I–VII. Bạn sửa trực tiếp sau khi có nháp.") + aiBlock("tom-tat", body);
  }

  function viewDatVanDe(s) {
    const col = (synId, name, loose) => {
      const items = SYMPTOMS.filter((x) => state.assign[x.id] === synId);
      const opts = (cur) =>
        [`<option value="" ${cur === null ? "selected" : ""}>Chưa xếp</option>`, ...SYNDROMES.map((y) => `<option value="${y.id}" ${cur === y.id ? "selected" : ""}>${esc(y.name)}</option>`)].join("");
      const chips = items
        .map((x) => `<div class="chip"><span>${esc(x.text)} <span class="kind">${x.kind}</span></span><select data-assign="${x.id}" aria-label="Chuyển triệu chứng">${opts(state.assign[x.id])}</select></div>`)
        .join("");
      return `<div class="syn ${loose ? "loose" : ""}"><div class="syn-name">${esc(name)}</div>${chips || '<div class="source">Trống</div>'}</div>`;
    };
    return (
      head(s, "Gom triệu chứng cơ năng và thực thể thành hội chứng. Triệu chứng không khớp hội chứng nào thì để riêng. Dùng ô chọn ở mỗi thẻ để chuyển.") +
      `<div class="syn-grid">${SYNDROMES.map((y) => col(y.id, y.name, false)).join("")}${col(null, "Chưa xếp", true)}</div>` +
      `<h3>Đặt vấn đề</h3>${ul([...SYNDROMES.map((y) => y.name), "Tiền căn: THA, ĐTĐ type 2"])}`
    );
  }

  // ---------- Tra theo triệu chứng ----------
  const symLabel = (id) => (SYMPTOM_BY_ID.get(id) || { label: id }).label;
  const answerButtons = (id) =>
    `<span class="ans"><button class="btn sm" data-answer="${id}" data-val="co">Có</button><button class="btn sm" data-answer="${id}" data-val="khong">Không</button></span>`;

  function viewTraCuu(s) {
    const intro = head(s, "Nhập triệu chứng, đánh dấu có hoặc không. Danh sách bệnh lấy từ 8 bài giảng và tự cập nhật; mỗi lý do đều có nguồn.");
    if (!MATRIX) {
      return intro + `<div class="review"><b>Chưa có bảng bệnh × triệu chứng.</b> Chạy <code>python scripts/build_matrix.py</code> để tạo <code>matrix.js</code>.</div>`;
    }
    const { ranked, excluded } = Engine.rank(MATRIX, state.answers);
    const questions = Engine.suggest(MATRIX, state.answers, ranked);
    return (
      intro +
      `<div class="sym-search"><input id="sym-q" type="search" placeholder="yếu nửa người, đau đầu đột ngột, run khi nghỉ…" aria-label="Tìm triệu chứng" autocomplete="off"><div id="sym-results"></div></div>` +
      renderAnswered() +
      renderQuestions(questions) +
      renderRanked(ranked) +
      renderExcluded(excluded)
    );
  }

  function renderAnswered() {
    const entries = Object.entries(state.answers);
    if (!entries.length) return `<p class="source" style="margin:12px 0 0">Chưa có triệu chứng nào.</p>`;
    const chip = ([id, v]) =>
      `<button class="tag ${v}" data-toggle="${id}" title="Bấm để đổi có/không">${v === "co" ? "" : "Không: "}${esc(symLabel(id))}<span data-remove="${id}" aria-label="Bỏ" role="button"> ×</span></button>`;
    return (
      `<div class="tags">${entries.map(chip).join("")}</div>` +
      `<div class="btn-row" style="margin-top:8px"><button class="btn sm" data-action="clear-answers">Xóa hết</button></div>`
    );
  }

  function renderQuestions(questions) {
    if (!questions.length) return "";
    const rows = questions
      .map((q) => {
        const split = q.againstIt.length
          ? `Ủng hộ: ${q.withIt.join(", ") || "—"} · Chống lại: ${q.againstIt.join(", ")}`
          : `Gặp trong: ${q.withIt.join(", ")}`;
        return `<div class="q-row"><div><div>${esc(q.symptom.question)}</div><div class="source" style="margin:2px 0 0">${esc(split)}</div></div>${answerButtons(q.symptom.id)}</div>`;
      })
      .join("");
    return `<div class="ask"><div class="ask-title">Nên hỏi thêm</div>${rows}</div>`;
  }

  function renderRanked(ranked) {
    if (!ranked.length) return Object.keys(state.answers).length ? `<p class="sec-hint">Không bệnh nào trong 8 bài giảng khớp các triệu chứng này.</p>` : "";
    const top = Math.max(...ranked.map((r) => r.score), 1);
    const card = (r, i) => {
      const width = Math.max(4, Math.round((100 * Math.max(r.score, 0)) / top));
      const list = (items, cls) => items.map((f) => `<span class="${cls}" title="${esc(f.source)}">${esc(symLabel(f.symptom))}</span>`).join("");
      const unasked = r.unasked.slice(0, SHOW_UNASKED);
      return `<div class="dx rank" tabindex="0">
        <div class="dx-top"><span class="dx-name"><span class="rank-n">${i + 1}</span>${esc(r.disease.name)}</span><span class="pill muted">${esc(LECTURE_NAMES[r.disease.lecture] || r.disease.lecture)}</span></div>
        <div class="bar"><span style="width:${width}%"></span></div>
        <div class="why">
          <div><b class="ok-t">Khớp</b> ${list(r.matched, "f ok")}</div>
          ${r.against.length ? `<div><b class="bad-t">Chống lại</b> ${list(r.against, "f bad")}</div>` : ""}
          ${unasked.length ? `<div><b>Điển hình, chưa hỏi</b> ${unasked.map((f) => `<button class="f ask-f" data-answer="${f.symptom}" data-val="co" title="Bấm nếu có">${esc(symLabel(f.symptom))}</button>`).join("")}</div>` : ""}
        </div>
      </div>`;
    };
    return (
      `<h3>Bệnh phù hợp <span class="source" style="font-family:var(--sans)">${ranked.length} bệnh · di chuột lên lý do để xem nguồn</span></h3>` +
      ranked.slice(0, 8).map(card).join("") +
      `<div class="btn-row" style="margin-top:12px"><button class="btn primary" data-action="use-search">Đưa vào chẩn đoán sơ bộ và phân biệt →</button></div>`
    );
  }

  function renderExcluded(excluded) {
    if (!excluded.length) return "";
    const rows = excluded
      .map((r) => `<div class="crit"><span>${esc(r.disease.name)}</span><span class="source" style="margin:0">Loại trừ vì: ${r.excludedBy.map((f) => `${esc(symLabel(f.symptom))} (${esc(f.source)})`).join("; ")}</span></div>`)
      .join("");
    return `<h3>Đã loại trừ</h3>${rows}`;
  }

  function renderSearchResults(query) {
    const box = document.getElementById("sym-results");
    if (!box) return;
    const hits = Engine.search(MATRIX, query).filter((s) => !(s.id in state.answers));
    box.innerHTML = hits
      .map((s) => `<div class="hit"><span>${esc(s.label)} <span class="kind">${esc(s.group || "")}</span></span>${answerButtons(s.id)}</div>`)
      .join("");
  }

  function setAnswer(id, val, refocus = false) {
    setState({ answers: { ...state.answers, [id]: val } });
    const q = document.getElementById("sym-q");
    if (refocus && q) q.focus();
  }

  function removeAnswer(id) {
    const { [id]: _, ...rest } = state.answers;
    setState({ answers: rest });
  }

  function useSearch() {
    const { ranked } = Engine.rank(MATRIX, state.answers);
    if (!ranked.length) return;
    const pick = (r) => ({ name: r.disease.name, lecture: r.disease.lecture, matched: r.matched.map((f) => symLabel(f.symptom)) });
    go("chan-doan", { fromSearch: { primary: pick(ranked[0]), others: ranked.slice(1, 1 + SHOW_OTHERS).map(pick) } });
  }

  function searchBanner() {
    const fs = state.fromSearch;
    if (!fs) return "";
    const line = (d) => `<b style="font-weight:500">${esc(d.name)}</b> <span class="source" style="margin:0">(${esc(LECTURE_NAMES[d.lecture] || "")}; khớp: ${esc(d.matched.join(", "))})</span>`;
    return `<div class="review" style="border-color:var(--accent);background:var(--accent-soft)"><b style="color:var(--accent)">Từ tra cứu triệu chứng</b><div>Sơ bộ: ${line(fs.primary)}</div>${fs.others.length ? `<div>Phân biệt: ${fs.others.map(line).join("; ")}</div>` : ""}<div class="source">Khi nối AI, phần biện luận bên dưới sẽ được viết lại theo các bệnh này.</div></div>`;
  }

  function viewChanDoan(s) {
    const verdictPill = (v) => `<span class="pill ${v.startsWith("Ít") ? "muted" : "warn"}">${esc(v)}</span>`;
    const critPill = (st) => (st === "dat" ? '<span class="pill ok">Đạt</span>' : '<span class="pill warn">Chờ cận lâm sàng</span>');
    const card = (d) => {
      const sel = state.selectedDx === d.id ? "selected" : "";
      if (d.role === "so-bo") {
        return `<div class="dx primary-dx ${sel}" data-dx="${d.id}" tabindex="0"><div class="dx-top"><span class="dx-name">${esc(d.name)}</span><span class="pill ok">Sơ bộ</span></div>${d.criteria
          .map(([t, st]) => `<div class="crit"><span>${esc(t)}</span>${critPill(st)}</div>`)
          .join("")}<div class="source">${esc(SOURCES[d.source])}</div></div>`;
      }
      return `<div class="dx ${sel}" data-dx="${d.id}" tabindex="0"><div class="dx-top"><span class="dx-name">${esc(d.name)}</span>${verdictPill(d.verdict)}</div><div class="procon"><div class="pro"><b>Ủng hộ</b>${esc(d.pro)}</div><div class="con"><b>Không ủng hộ</b>${esc(d.con)}</div></div></div>`;
    };
    return (
      head(s, "Bấm vào một chẩn đoán để xem nó dựa trên hội chứng nào ở bản đồ bên phải.") +
      searchBanner() +
      `<h3>X. Chẩn đoán sơ bộ</h3>${DIAGNOSES.filter((d) => d.role === "so-bo").map(card).join("")}` +
      `<h3>XI. Chẩn đoán phân biệt</h3>${DIAGNOSES.filter((d) => d.role === "phan-biet").map(card).join("")}`
    );
  }

  function viewBienLuanLs(s) {
    const checked = RED_FLAGS.filter((_, i) => state.flags[i]);
    const flags = RED_FLAGS.map(
      (x, i) => `<label><input type="checkbox" data-flag="${i}" ${state.flags[i] ? "checked" : ""}><span class="letter">${i + 1}</span><span>${esc(x.text)}</span></label>`
    ).join("");
    const alert = checked.length
      ? `<div class="alert">${checked.length} dấu hiệu cảnh báo → nghĩ đau đầu thứ phát.</div><table class="grid" style="margin-top:8px"><thead><tr><th>Dấu hiệu</th><th>Chẩn đoán có thể</th><th>Cận lâm sàng</th></tr></thead><tbody>${checked
          .map((x) => `<tr><td>${esc(x.text)}</td><td>${esc(x.dx)}</td><td>${esc(x.cls)}</td></tr>`)
          .join("")}</tbody></table><div class="source">Đau đầu §Dấu hiệu cảnh báo</div>`
      : "";
    const body =
      `<b>1. Tiếp cận hội chứng</b><p>Đau đầu cấp thứ phát: khởi phát đột ngột, tiến triển nặng hơn, kèm yếu ½ người (T), trước đây không có cơn tương tự. Yếu ½ người (T) kiểu trung ương: sức cơ (T) 4/5, Babinski (T) (+).</p>` +
      `<b>2. Định vị tổn thương</b><p>${esc(LOCALIZATION.where)}. ${esc(LOCALIZATION.why)}</p>` +
      `<b>3. Nguyên nhân</b>${ul(CAUSES.map(([n, v, w]) => `${n}: ${v.toLowerCase()} (${w})`))}` +
      `<b>4. Chẩn đoán phân biệt</b><p>Xem mục X–XI.</p>`;
    return (
      head(s, "Bốn phần theo mẫu của khoa: tiếp cận hội chứng, định vị, nguyên nhân, chẩn đoán phân biệt.") +
      `<h3>Dấu hiệu cảnh báo đau đầu thứ phát (theo bài giảng)</h3><div class="snoop">${flags}</div>${alert}` +
      aiBlock("bien-luan-ls", body, "dauDau")
    );
  }

  function viewDeNghi(s) {
    const body = `<table class="grid"><thead><tr><th>Cận lâm sàng</th><th>Mục đích</th><th>Cho chẩn đoán</th></tr></thead><tbody>${CLS_REQUESTS.map(
      (r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`
    ).join("")}</tbody></table>`;
    return head(s, "Mỗi đề nghị phải nêu để xác định hay loại trừ chẩn đoán nào.") + aiBlock("de-nghi", body, "dotQuy");
  }

  function flag(v, lo, hi) {
    if (v > hi) return "H";
    if (v < lo) return "L";
    return "";
  }

  function viewKetQua(s) {
    const rows = LABS.map(([n, v, u, lo, hi]) => {
      const f = flag(v, lo, hi);
      return `<tr><td>${esc(n)}</td><td class="num ${f ? "flag-" + f : ""}">${v}</td><td>${esc(u)}</td><td class="num flag-${f}">${f}</td><td class="num">${lo} – ${hi}</td></tr>`;
    }).join("");
    const img = IMAGING.map((m) => `<h3>${esc(m.name)}</h3>${ul(m.lines)}`).join("");
    return (
      head(s, "Nhập kết quả. Chỉ số ngoài giới hạn tham chiếu được tự đánh dấu H (cao) hoặc L (thấp).") +
      `<h3>Xét nghiệm máu</h3><table class="grid"><thead><tr><th>Xét nghiệm</th><th style="text-align:right">Kết quả</th><th>Đơn vị</th><th></th><th style="text-align:right">Tham chiếu</th></tr></thead><tbody>${rows}</tbody></table>` +
      img
    );
  }

  function viewBienLuanCls(s) {
    const body = CLS_REASONING.map(([k, v]) => `<p><b>${esc(k)}.</b> ${esc(v)}</p>`).join("");
    const flags = state.ai["bien-luan-cls"] === "done" ? REVIEW_FLAGS.map((f) => `<div class="review"><b>AI rà soát:</b> ${esc(f.text)}</div>`).join("") : "";
    return head(s, "Liên hệ từng kết quả với lâm sàng. AI rà lại số liệu với bảng kết quả.") + aiBlock("bien-luan-cls", body, "dotQuy") + flags;
  }

  function viewChanDoanXd(s) {
    return (
      head(s, "Ghép theo công thức: bệnh, vị trí, ngày, nguyên nhân / bệnh kèm.") +
      `<div class="dx primary-dx selected" style="cursor:default"><div class="dx-name">${esc(FINAL_DX)}</div></div>` +
      `<div class="kv" style="margin-top:16px">${[
        ["Bệnh", "Xuất huyết não cấp"],
        ["Vị trí", "Vùng đính (P)"],
        ["Thời gian", "Ngày 3"],
        ["Nguyên nhân", "Nghĩ do THA"],
        ["Bệnh kèm", "THA, ĐTĐ type 2"],
      ]
        .map(([k, v]) => `<div class="k">${k}</div><div>${v}</div>`)
        .join("")}</div>`
    );
  }

  function viewDieuTri(s) {
    const items = TREATMENT.map(([h, text, src]) =>
      text
        ? `<div class="crit" style="display:block"><b style="font-weight:500">${esc(h)}.</b> ${esc(text)}<div class="source">${esc(src)}</div></div>`
        : `<div class="crit"><span>${esc(h)}</span><span class="pill muted">Không có trong bài giảng</span></div>`
    ).join("");
    return (
      head(s, "Mục này bản mẫu của khoa chưa có. Nội dung lấy nguyên từ bài giảng Đột quỵ, phần xuất huyết não; ý nào bài không có thì ghi rõ.") +
      items +
      `<h3>Xuất bệnh án</h3><div class="btn-row"><button class="btn primary" data-action="preview">Xem trước bản xuất</button><span class="source" style="margin:0">Xuất Word sẽ có ở bản thật</span></div>` +
      (state.showPreview ? `<div class="preview">${esc(buildExport())}</div>` : "")
    );
  }

  function buildExport() {
    const line = (rows) => rows.map(([k, v]) => `- ${k}: ${v}`).join("\n");
    const sym = (k) => SYMPTOMS.filter((x) => x.kind === k).map((x) => `- ${x.text}`).join("\n");
    return [
      "BỆNH ÁN THẦN KINH",
      "",
      "I. HÀNH CHÁNH",
      line(CASE.hanhChanh),
      "",
      `II. LÝ DO NHẬP VIỆN: ${CASE.lyDo}`,
      "",
      "III. BỆNH SỬ",
      CASE.benhSu.map((b) => `${b.moc}: ${b.text}`).join("\n"),
      "",
      "IV. TIỀN CĂN",
      line(CASE.tienCan),
      "",
      "VIII. TÓM TẮT BỆNH ÁN",
      "Bệnh nhân nữ, 52 tuổi, nhập viện vì đau đầu.",
      "TCCN:",
      sym("TCCN"),
      "TCTT:",
      sym("TCTT"),
      "",
      "IX. ĐẶT VẤN ĐỀ",
      SYNDROMES.map((y) => `- ${y.name}`).join("\n"),
      "",
      "X. CHẨN ĐOÁN SƠ BỘ",
      `- ${DIAGNOSES[0].name}`,
      "",
      "XI. CHẨN ĐOÁN PHÂN BIỆT",
      DIAGNOSES.slice(1).map((d) => `- ${d.name}`).join("\n"),
      "",
      "XVI. CHẨN ĐOÁN XÁC ĐỊNH",
      FINAL_DX,
      "",
      "(Bản xem trước rút gọn: các mục V–VII, XII–XV, XVII có trong bản xuất thật.)",
    ].join("\n");
  }

  // ---------- Cột trái ----------
  function renderSteps() {
    return PHASES.map((ph) => {
      const items = SECTIONS.filter((s) => s.phase === ph.id)
        .map((s) => {
          const cls = [s.id === state.current ? "active" : "", state.visited.includes(s.id) && s.id !== state.current ? "done" : ""].join(" ");
          return `<button class="step ${cls}" data-go="${s.id}"><span class="step-num">${s.num}</span><span>${esc(s.title)}</span></button>`;
        })
        .join("");
      return `<div class="phase"><div class="phase-name">${esc(ph.name)}</div>${items}</div>`;
    }).join("");
  }

  // ---------- Cột phải: bản đồ lập luận ----------
  function renderMap() {
    const dx = DIAGNOSES.find((d) => d.id === state.selectedDx);
    const hotSyn = new Set(dx ? dx.path : []);
    const synNode = (y) => `<div class="node ${hotSyn.has(y.id) ? "hot" : "dim"}">${esc(y.name)}</div>`;
    const symNodes = SYMPTOMS.map((x) => {
      const a = state.assign[x.id];
      const cls = a === null ? "loose" : hotSyn.has(a) ? "" : "dim";
      return `<div class="node ${cls}">${esc(x.text)}</div>`;
    }).join("");
    const dxNodes = DIAGNOSES.map((d) => `<div class="node ${d.id === state.selectedDx ? "hot" : "dim"}">${esc(d.name)}</div>`).join("");
    return (
      `<div class="map-title">Bản đồ lập luận</div><div class="map-sub">Đang xem: ${esc(dx ? dx.name : "")}</div>` +
      `<div class="lvl">Triệu chứng</div>${symNodes}<div class="arrow">↓</div>` +
      `<div class="lvl">Hội chứng</div>${SYNDROMES.map(synNode).join("")}<div class="arrow">↓</div>` +
      `<div class="lvl">Định khu</div><div class="node">${esc(LOCALIZATION.where)}</div><div class="arrow">↓</div>` +
      `<div class="lvl">Chẩn đoán</div>${dxNodes}`
    );
  }

  // ---------- Vẽ toàn trang ----------
  function render() {
    const idx = SECTIONS.findIndex((s) => s.id === state.current);
    const sec = SECTIONS[idx];
    const prev = SECTIONS[idx - 1];
    const next = SECTIONS[idx + 1];
    const nav =
      `<div class="footer-nav">` +
      (prev ? `<button class="btn" data-go="${prev.id}">← ${esc(prev.title)}</button>` : "<span></span>") +
      (next ? `<button class="btn primary" data-go="${next.id}">${esc(next.title)} →</button>` : "<span></span>") +
      `</div>`;
    document.getElementById("steps").innerHTML = renderSteps();
    document.getElementById("work").innerHTML = VIEWS[sec.id](sec) + nav;
    document.getElementById("map").innerHTML = renderMap();
    document.getElementById("cost").textContent = "$" + state.cost.toFixed(3);
    keepActiveStepVisible();
  }

  // Trên điện thoại, thanh mục cuộn ngang: đưa mục đang mở vào giữa tầm nhìn.
  function keepActiveStepVisible() {
    const steps = document.getElementById("steps");
    const active = steps.querySelector(".step.active");
    if (!active || steps.scrollWidth <= steps.clientWidth) return;
    steps.scrollLeft = active.offsetLeft - (steps.clientWidth - active.offsetWidth) / 2;
  }

  function go(id, extra = {}) {
    const visited = state.visited.includes(state.current) ? state.visited : [...state.visited, state.current];
    setState({ current: id, visited, showPreview: false, ...extra });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- Sự kiện ----------
  document.addEventListener("click", (e) => {
    const rm = e.target.closest("[data-remove]");
    if (rm) return removeAnswer(rm.dataset.remove);
    const t = e.target.closest("[data-go],[data-action],[data-dx],[data-answer],[data-toggle]");
    if (!t) return;
    if (t.dataset.answer) return setAnswer(t.dataset.answer, t.dataset.val, !!t.closest("#sym-results"));
    if (t.dataset.toggle) return setAnswer(t.dataset.toggle, state.answers[t.dataset.toggle] === "co" ? "khong" : "co");
    if (t.dataset.action === "clear-answers") return setState({ answers: {} });
    if (t.dataset.action === "use-search") return useSearch();
    if (t.dataset.go) return go(t.dataset.go);
    if (t.dataset.action === "ai") return runAi(t.dataset.id);
    if (t.dataset.action === "preview") return setState({ showPreview: !state.showPreview });
    if (t.dataset.dx) return setState({ selectedDx: t.dataset.dx });
  });

  document.addEventListener("keydown", (e) => {
    const t = e.target.closest("[data-dx]");
    if (t && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setState({ selectedDx: t.dataset.dx });
    }
  });

  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.assign) {
      return setState({ assign: { ...state.assign, [t.dataset.assign]: t.value || null } });
    }
    if (t.dataset.flag !== undefined) {
      const i = Number(t.dataset.flag);
      return setState({ flags: state.flags.map((v, j) => (j === i ? t.checked : v)) });
    }
  });

  // Tính lại tại chỗ, không vẽ lại trang để giữ con trỏ trong ô nhập
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.id === "sym-q") return renderSearchResults(t.value);
    if (t.matches("[data-gcs]")) {
      const sum = [...document.querySelectorAll("[data-gcs]")].reduce((a, el) => a + Number(el.value), 0);
      document.getElementById("gcs").textContent = "GCS " + sum;
    }
    if (t.matches("[data-power]")) {
      const v = Number(t.value);
      t.classList.toggle("weak", Number.isFinite(v) && v < 5);
    }
  });

  render();
})();
