// Bộ máy tra theo triệu chứng: xếp hạng bệnh và chọn câu hỏi tiếp theo.
// Chạy bằng quy tắc trên bảng bệnh × triệu chứng (knowledge/matrix.json), không gọi AI.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Engine = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /** Điểm cộng/trừ theo vai trò của triệu chứng với bệnh, tách theo câu trả lời "có" hay "không". */
  const WEIGHTS = {
    co: { "dien-hinh": 3, "co-the": 1, "khong-ung-ho": -2, "loai-tru": 0 },
    khong: { "dien-hinh": -2, "co-the": 0, "khong-ung-ho": 1, "loai-tru": 0 },
  };
  const SUPPORTING = new Set(["dien-hinh", "co-the"]);
  const OPPOSING = new Set(["khong-ung-ho", "loai-tru"]);
  const CANDIDATE_POOL = 8;
  const EXCLUSION_BONUS = 0.15;
  const LEADER_BONUS = 0.1;

  /**
   * @param {{diseases: {id:string, findings:{symptom:string, role:string, source:string}[]}[]}} matrix
   * @returns {Map<string, Map<string, {symptom:string, role:string, source:string}>>}
   */
  function indexFindings(matrix) {
    return new Map(matrix.diseases.map((d) => [d.id, new Map(d.findings.map((f) => [f.symptom, f]))]));
  }

  /**
   * Xếp hạng bệnh theo câu trả lời.
   * @param {object} matrix
   * @param {Record<string, "co"|"khong">} answers
   */
  function rank(matrix, answers) {
    const index = indexFindings(matrix);
    const entries = Object.entries(answers);
    const ranked = [];
    const excluded = [];

    for (const disease of matrix.diseases) {
      const findings = index.get(disease.id);
      const result = scoreDisease(disease, findings, entries);
      if (result.excludedBy.length) excluded.push(result);
      else if (result.matched.length) ranked.push(result);
    }
    ranked.sort((a, b) => b.score - a.score || b.matched.length - a.matched.length || a.disease.name.localeCompare(b.disease.name, "vi"));
    return { ranked, excluded };
  }

  function scoreDisease(disease, findings, entries) {
    const result = { disease, score: 0, matched: [], against: [], excludedBy: [], typicalTotal: 0, typicalMatched: 0, unasked: [] };
    for (const f of findings.values()) {
      if (f.role === "dien-hinh") result.typicalTotal += 1;
    }
    for (const [symptomId, answer] of entries) {
      const f = findings.get(symptomId);
      if (!f) continue;
      result.score += WEIGHTS[answer][f.role];
      if (answer === "co" && f.role === "loai-tru") result.excludedBy.push(f);
      else if (answer === "co" && SUPPORTING.has(f.role)) result.matched.push(f);
      else if (answer === "co" && f.role === "khong-ung-ho") result.against.push(f);
      else if (answer === "khong" && f.role === "dien-hinh") result.against.push({ ...f, absent: true });
      if (answer === "co" && f.role === "dien-hinh") result.typicalMatched += 1;
    }
    result.unasked = [...findings.values()].filter((f) => f.role === "dien-hinh" && !(f.symptom in Object.fromEntries(entries)));
    return result;
  }

  /**
   * Chọn triệu chứng nên hỏi tiếp: ưu tiên triệu chứng chia đôi được nhóm bệnh đang dẫn đầu.
   * @param {object} matrix
   * @param {Record<string, "co"|"khong">} answers
   * @param {ReturnType<typeof rank>["ranked"]} ranked
   * @param {number} [limit]
   */
  function suggest(matrix, answers, ranked, limit = 5) {
    const pool = ranked.slice(0, CANDIDATE_POOL);
    if (pool.length < 1) return [];
    const index = indexFindings(matrix);
    const leader = pool[0].disease.id;
    const out = [];

    for (const symptom of matrix.symptoms) {
      if (symptom.id in answers) continue;
      const withIt = [];
      const againstIt = [];
      for (const r of pool) {
        const f = index.get(r.disease.id).get(symptom.id);
        if (!f) continue;
        if (SUPPORTING.has(f.role)) withIt.push(r.disease.name);
        else if (OPPOSING.has(f.role)) againstIt.push(r.disease.name);
      }
      if (!withIt.length && !againstIt.length) continue;
      const p = withIt.length / pool.length;
      const leaderFinding = index.get(leader).get(symptom.id);
      const value =
        p * (1 - p) +
        (againstIt.length ? EXCLUSION_BONUS : 0) +
        (leaderFinding && leaderFinding.role === "dien-hinh" ? LEADER_BONUS : 0);
      if (value <= 0) continue;
      out.push({ symptom, value, withIt, againstIt });
    }
    out.sort((a, b) => b.value - a.value || a.symptom.label.localeCompare(b.symptom.label, "vi"));
    return out.slice(0, limit);
  }

  /** Tìm triệu chứng theo chữ gõ, so cả nhãn và từ đồng nghĩa, bỏ dấu. */
  function search(matrix, query, limit = 8) {
    const q = fold(query.trim());
    if (!q) return [];
    const hits = [];
    for (const s of matrix.symptoms) {
      const names = [s.label, ...(s.synonyms || [])].map(fold);
      const best = Math.min(...names.map((n) => (n.startsWith(q) ? 0 : n.includes(q) ? 1 : 9)));
      if (best < 9) hits.push({ s, best });
    }
    hits.sort((a, b) => a.best - b.best || a.s.label.length - b.s.label.length);
    return hits.slice(0, limit).map((h) => h.s);
  }

  function fold(text) {
    return text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "d").toLowerCase();
  }

  return { rank, suggest, search, fold, WEIGHTS };
});
