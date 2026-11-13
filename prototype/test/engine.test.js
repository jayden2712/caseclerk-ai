const test = require("node:test");
const assert = require("node:assert/strict");
const Engine = require("../engine.js");

const matrix = {
  symptoms: [
    { id: "yeu-nua-nguoi", label: "Yếu nửa người", synonyms: ["liệt nửa người"] },
    { id: "dau-dau-dot-ngot", label: "Đau đầu khởi phát đột ngột", synonyms: [] },
    { id: "sot", label: "Sốt", synonyms: [] },
    { id: "co-gong", label: "Cổ gượng", synonyms: [] },
    { id: "run-khi-nghi", label: "Run khi nghỉ", synonyms: [] },
    { id: "thieu-nao", label: "Bất thường tiểu não rõ", synonyms: [] },
  ],
  diseases: [
    { id: "xhn", name: "Xuất huyết não", findings: [
      { symptom: "yeu-nua-nguoi", role: "dien-hinh", source: "a" },
      { symptom: "dau-dau-dot-ngot", role: "co-the", source: "a" },
    ] },
    { id: "vmn", name: "Viêm màng não", findings: [
      { symptom: "sot", role: "dien-hinh", source: "b" },
      { symptom: "co-gong", role: "dien-hinh", source: "b" },
      { symptom: "dau-dau-dot-ngot", role: "co-the", source: "b" },
    ] },
    { id: "pd", name: "Bệnh Parkinson", findings: [
      { symptom: "run-khi-nghi", role: "dien-hinh", source: "c" },
      { symptom: "thieu-nao", role: "loai-tru", source: "c" },
    ] },
  ],
};

test("xếp bệnh có nhiều triệu chứng điển hình khớp lên đầu", () => {
  const { ranked } = Engine.rank(matrix, { "yeu-nua-nguoi": "co", "dau-dau-dot-ngot": "co" });
  assert.equal(ranked[0].disease.id, "xhn");
  assert.equal(ranked[0].score, 4);
  assert.deepEqual(ranked.map((r) => r.disease.id), ["xhn", "vmn"]);
});

test("trả lời 'không' với triệu chứng điển hình làm tụt điểm", () => {
  const { ranked } = Engine.rank(matrix, { "dau-dau-dot-ngot": "co", sot: "khong" });
  const vmn = ranked.find((r) => r.disease.id === "vmn");
  assert.equal(vmn.score, 1 - 2);
  assert.equal(vmn.against[0].absent, true);
  assert.equal(ranked[0].disease.id, "xhn");
});

test("triệu chứng loại trừ đưa bệnh sang danh sách đã loại", () => {
  const { ranked, excluded } = Engine.rank(matrix, { "run-khi-nghi": "co", "thieu-nao": "co" });
  assert.equal(ranked.length, 0);
  assert.equal(excluded[0].disease.id, "pd");
});

test("không trả về bệnh không khớp triệu chứng nào", () => {
  const { ranked, excluded } = Engine.rank(matrix, {});
  assert.equal(ranked.length, 0);
  assert.equal(excluded.length, 0);
});

test("gợi ý câu hỏi chia đôi nhóm bệnh dẫn đầu, bỏ câu đã trả lời", () => {
  const answers = { "dau-dau-dot-ngot": "co" };
  const { ranked } = Engine.rank(matrix, answers);
  const ids = Engine.suggest(matrix, answers, ranked).map((s) => s.symptom.id);
  assert.ok(!ids.includes("dau-dau-dot-ngot"));
  assert.ok(ids.includes("yeu-nua-nguoi"));
  assert.ok(ids.includes("sot"));
});

test("không gợi ý gì khi chưa có bệnh nào khớp", () => {
  assert.deepEqual(Engine.suggest(matrix, {}, []), []);
});

test("tìm triệu chứng không cần gõ dấu, khớp cả từ đồng nghĩa", () => {
  assert.equal(Engine.search(matrix, "yeu nua")[0].id, "yeu-nua-nguoi");
  assert.equal(Engine.search(matrix, "liệt nửa")[0].id, "yeu-nua-nguoi");
  assert.equal(Engine.search(matrix, "dau dau")[0].id, "dau-dau-dot-ngot");
  assert.deepEqual(Engine.search(matrix, "   "), []);
});
