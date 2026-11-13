# CaseClerk AI

Web tự học viết bệnh án Nội thần kinh cho sinh viên y: phân tích triệu chứng, gom hội chứng, chẩn đoán sơ bộ và phân biệt, đề nghị và biện luận cận lâm sàng, chẩn đoán xác định, điều trị. Có mục tra cứu bệnh theo triệu chứng.

Bản thử: AI chưa kết nối, phần lập luận là nội dung mẫu.

## Cấu trúc
- `prototype/`: trang web tĩnh (HTML, CSS, JS thuần).
- `knowledge/`: kiến thức tóm tắt từ bài giảng, mỗi dòng có nguồn; `matrix.json` là bảng bệnh × triệu chứng.
- `scripts/`: `build_matrix.py` kiểm tra `matrix.json` và tạo `prototype/matrix.js`; `check_knowledge.py` kiểm tra nguồn trích dẫn.

## Chạy trên máy
```bash
python -m http.server 8770 --directory prototype
```
Mở http://localhost:8770.

## Kiểm tra
```bash
node --test prototype/test/engine.test.js
python scripts/build_matrix.py
python scripts/check_knowledge.py
```

Chỉ dùng để học tập, không thay thế chẩn đoán của bác sĩ.
