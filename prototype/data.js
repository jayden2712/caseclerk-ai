// Dữ liệu mẫu lấy từ bệnh án "Đau đầu – Xuất huyết não" (đã bỏ thông tin định danh).
// Bản thử: AI chưa kết nối, mọi nội dung "AI soạn" là văn bản dựng sẵn.

window.PHASES = [
  { id: "thu-thap", name: "Thu thập" },
  { id: "tong-hop", name: "Tổng hợp" },
  { id: "bien-luan", name: "Biện luận" },
  { id: "cls", name: "Cận lâm sàng" },
  { id: "ket-luan", name: "Kết luận" },
];

window.SECTIONS = [
  { id: "hanh-chanh", phase: "thu-thap", num: "I", title: "Hành chánh" },
  { id: "ly-do", phase: "thu-thap", num: "II", title: "Lý do nhập viện" },
  { id: "benh-su", phase: "thu-thap", num: "III", title: "Bệnh sử" },
  { id: "tien-can", phase: "thu-thap", num: "IV", title: "Tiền căn" },
  { id: "dien-tien", phase: "thu-thap", num: "V", title: "Diễn tiến bệnh" },
  { id: "luoc-qua", phase: "thu-thap", num: "VI", title: "Lược qua các cơ quan" },
  { id: "kham", phase: "thu-thap", num: "VII", title: "Khám" },
  { id: "tom-tat", phase: "tong-hop", num: "VIII", title: "Tóm tắt bệnh án" },
  { id: "dat-van-de", phase: "tong-hop", num: "IX", title: "Đặt vấn đề" },
  { id: "tra-cuu", phase: "bien-luan", num: "★", title: "Tra theo triệu chứng" },
  { id: "chan-doan", phase: "bien-luan", num: "X–XI", title: "Chẩn đoán sơ bộ và phân biệt" },
  { id: "bien-luan-ls", phase: "bien-luan", num: "XII", title: "Biện luận lâm sàng" },
  { id: "de-nghi", phase: "cls", num: "XIII", title: "Đề nghị cận lâm sàng" },
  { id: "ket-qua", phase: "cls", num: "XIV", title: "Kết quả cận lâm sàng" },
  { id: "bien-luan-cls", phase: "cls", num: "XV", title: "Biện luận cận lâm sàng" },
  { id: "chan-doan-xd", phase: "ket-luan", num: "XVI", title: "Chẩn đoán xác định" },
  { id: "dieu-tri", phase: "ket-luan", num: "XVII", title: "Điều trị" },
];

window.SOURCES = {
  dauDau: "Bài giảng: Tiếp cận chẩn đoán và điều trị đau đầu",
  dotQuy: "Bài giảng: Đột quỵ (Bai DQ Y5)",
  lietVD: "Bài giảng: Tiếp cận chẩn đoán liệt vận động",
};

window.CASE = {
  hanhChanh: [
    ["Họ và tên", "N.N.C. (viết tắt)"],
    ["Năm sinh", "1974 (52 tuổi)"],
    ["Giới tính", "Nữ"],
    ["Dân tộc", "Kinh"],
    ["Thuận tay", "Phải"],
    ["Nghề nghiệp", "Công nhân cạo mủ cao su"],
    ["Nơi cư trú", "Tây Ninh"],
    ["Ngày giờ nhập viện", "23h39 ngày 18/09/2026"],
  ],
  lyDo: "Đau đầu",
  benhSu: [
    {
      moc: "Cách NV 3 ngày",
      text: "Đang bước xuống xe thì đột ngột yếu tay (T) khi vịn thành xe, sau đó đi loạng choạng, đứng không vững do chân (T) yếu. Không tê nửa người, tự đi lại được. Tay (T) cầm nắm đồ vật không chính xác.",
    },
    {
      moc: "Cách NV 2 ngày",
      text: "Đột ngột đau đầu âm ỉ, liên tục nửa đầu (P), sau 30 phút lan sang (T). Không buồn nôn, không nhìn đôi, không ù tai. HA 150/100 mmHg. MRI phát hiện xuất huyết não, BN từ chối nhập viện, uống thuốc 5 ngày: đau đầu giảm nhưng không hết, yếu (T) không đổi.",
    },
    {
      moc: "Cách NV 8 giờ",
      text: "Đau đầu bên (P) đột ngột tăng dần về cường độ, liên tục. Đi lại không vững nên nhập viện.",
    },
    {
      moc: "Âm tính",
      text: "Không sốt, không nôn ói, không nhìn mờ/song thị, không ù tai, không nói đớ, không rối loạn tiểu tiện, không chấn thương đầu.",
    },
  ],
  tienCan: [
    ["Nội khoa", "Tăng huyết áp 12 năm, uống thuốc theo toa cũ, không tái khám (HA trung bình 140–150/90–100 mmHg). Đái tháo đường 3–4 năm, uống thuốc đều."],
    ["Ngoại khoa", "Chưa ghi nhận bất thường"],
    ["Sản khoa", "PARA 2002"],
    ["Thói quen", "Rượu bia 2–3 lon khi có tiệc. Dùng thuốc bắc giảm đau lưng 20 ngày, đã ngưng 10 ngày."],
    ["Dị ứng", "Chưa ghi nhận"],
    ["Gia đình", "Chưa ghi nhận bệnh lý"],
  ],
  dienTien: [
    ["19/09 0h10", "Tỉnh, HA 160/80. Chẩn đoán: XHN bán cầu (P) N2", "Captopril 25mg NDL, Paracetamol 1g TTM, nhập A3b"],
    ["19/09 02h00", "GCS 15, HA 140/80, đồng tử 3mm PXAS (+), sức cơ 5/5", "NaCl 0,9%, Exforge 5/80, Partamol, đánh giá nuốt"],
    ["19/09 08h00", "HA 130/80, GCS 15, yếu ½ (T) 4+/5", "Chăm sóc sau CT"],
  ],
  luocQua: [
    ["Tim mạch", "Không đau ngực, không hồi hộp, không khó thở, không phù"],
    ["Hô hấp", "Không khó thở, không ho"],
    ["Tiêu hóa", "Ăn uống được, không đau bụng, tiêu phân vàng khuôn"],
    ["Tiết niệu", "Tiểu tự chủ, nước tiểu vàng trong, ~1 l/ngày"],
    ["Cơ xương khớp", "Không đau nhức"],
    ["Thần kinh", "Hết đau đầu, không chóng mặt, không nhìn đôi, không nói khó"],
  ],
  sinhHieu: [["Mạch", "85 l/ph"], ["Nhiệt độ", "37 °C"], ["HA", "140/80 mmHg"], ["Nhịp thở", "20 l/ph"], ["SpO2", "98%"]],
  gcs: { E: 4, V: 5, M: 6 },
  mmse: 28,
  daySo: [
    ["I", "Ngửi bình thường hai bên"],
    ["II", "Thị trường không giới hạn"],
    ["III, IV, VI", "Đồng tử 2mm, PXAS (+), vận nhãn bình thường, không rung giật nhãn cầu"],
    ["V", "Cảm giác mặt đều, cơ nhai mạnh, phản xạ cằm (−)"],
    ["VII", "Rãnh mũi má còn, nhân trung giữa"],
    ["VIII", "Thính lực bình thường, nystagmus (−)"],
    ["IX, X", "Không khám được"],
    ["XI", "Xoay đầu được, ức đòn chũm không teo"],
    ["XII", "Lưỡi không teo, vận động bình thường"],
  ],
  sucCo: { tayP: 5, chanP: 5, tayT: 4, chanT: 4 },
  phanXa: [
    ["Gân cơ (nhị đầu, tam đầu, cánh tay quay, bánh chè, gót)", "(++) đều hai bên"],
    ["Babinski", "(+) chân (T)"],
    ["Chaddock, Oppenheim, Hoffman, Tromner", "Không đáp ứng"],
  ],
  camGiac: "Sờ nông, đau, nhiệt đều hai bên; còn cảm giác vị thế ngón",
  mangNao: "Cổ mềm, Kernig (−), Brudzinski (−)",
};

// Triệu chứng dùng cho tóm tắt và gom hội chứng
window.SYMPTOMS = [
  { id: "cn1", kind: "TCCN", text: "Đau âm ỉ liên tục nửa đầu (P), lan sang (T)" },
  { id: "cn2", kind: "TCCN", text: "Đau đầu đổi tính chất, tăng dần cường độ" },
  { id: "cn3", kind: "TCCN", text: "Đột ngột yếu tay (T) rồi chân (T)" },
  { id: "cn4", kind: "TCCN", text: "Tay (T) cầm nắm không chính xác" },
  { id: "cn5", kind: "TCCN", text: "Đi loạng choạng do yếu chân (T)" },
  { id: "tt1", kind: "TCTT", text: "Sức cơ tay (T) 4/5, chân (T) 4/5" },
  { id: "tt2", kind: "TCTT", text: "Babinski (T) (+)" },
  { id: "tt3", kind: "TCTT", text: "HA lúc nhập viện 160/80 mmHg" },
];

window.SYNDROMES = [
  { id: "s1", name: "Yếu ½ người (T) kiểu trung ương" },
  { id: "s2", name: "Đau đầu thứ phát tiến triển" },
];

// Gợi ý ban đầu của "AI": triệu chứng nào thuộc hội chứng nào (null = chưa xếp)
window.INITIAL_ASSIGN = { cn1: "s2", cn2: "s2", cn3: "s1", cn4: null, cn5: "s1", tt1: "s1", tt2: "s1", tt3: null };

// Bảng "Dấu hiệu cảnh báo" của bài giảng Đau đầu (knowledge/dau-dau.md). Bài không dùng tên SNOOP.
// on = gợi ý ban đầu theo ca mẫu; phù gai thị chưa khám nên để trống.
window.RED_FLAGS = [
  { text: "Khởi phát đột ngột", dx: "XHDN; xuất huyết trong u hay AVM; ngập máu tuyến yên; khối choán chỗ", cls: "Hình ảnh học thần kinh; chọc dò DNT", on: true },
  { text: "Đau đầu mới khởi phát sau 50 tuổi", dx: "Viêm động mạch thái dương; khối choán chỗ", cls: "Tốc độ lắng máu; hình ảnh học thần kinh", on: true },
  { text: "Phù gai thị", dx: "Khối choán chỗ; hội chứng giả u não", cls: "Hình ảnh học thần kinh; chọc dò DNT", on: false },
  { text: "Kèm sốt, hồng ban, bệnh hệ thống, cổ gượng", dx: "Viêm màng não; viêm não; nhiễm trùng hệ thống; bệnh mạch máu collagen; bệnh Lyme", cls: "Hình ảnh học thần kinh; chọc dò DNT; xét nghiệm máu", on: false },
  { text: "Đau đầu mới ở bệnh nhân ung thư hay nhiễm HIV", dx: "Di căn; viêm màng não; abcès não", cls: "Hình ảnh học thần kinh; chọc dò DNT", on: false },
  { text: "Tiến triển nặng dần", dx: "Máu tụ dưới màng cứng; u não; lạm dụng thuốc", cls: "Hình ảnh học thần kinh", on: true },
  { text: "Kèm dấu thần kinh định vị hay co giật", dx: "Đột quỵ; u não; huyết khối tĩnh mạch nội sọ; viêm não; abcès não", cls: "Hình ảnh học thần kinh; chọc dò DNT", on: true },
];

window.DIAGNOSES = [
  {
    id: "d1",
    role: "so-bo",
    name: "Xuất huyết não bán cầu (P) ngày 3, nghĩ do THA / THA – ĐTĐ type 2",
    path: ["s1", "s2"],
    criteria: [
      ["Khởi phát đột ngột", "dat"],
      ["Dấu thần kinh khu trú: yếu ½ người (T) kiểu trung ương", "dat"],
      ["Đau đầu kèm HA cao lúc khởi phát", "dat"],
      ["Hình ảnh học xác nhận máu tụ", "cho"],
    ],
    source: "dotQuy",
  },
  {
    id: "d2",
    role: "phan-biet",
    name: "Nhồi máu não bán cầu (P), vùng ĐM não giữa, ngày 3",
    verdict: "Chưa loại được, cần hình ảnh học",
    path: ["s1"],
    pro: "THA, ĐTĐ nhiều năm; dấu thần kinh khu trú",
    con: "Đau đầu nổi bật, tăng dần",
    source: "dotQuy",
  },
  {
    id: "d3",
    role: "phan-biet",
    name: "Huyết khối tĩnh mạch nội sọ",
    verdict: "Ít nghĩ",
    path: ["s2"],
    pro: "Đau đầu âm ỉ kéo dài kèm yếu nửa người",
    con: "Yếu khởi phát trước đau đầu; không estrogen, không nhiễm trùng đầu mặt, không tăng đông",
    source: "dauDau",
  },
  {
    id: "d4",
    role: "phan-biet",
    name: "Migraine liệt nửa người có tính gia đình",
    verdict: "Ít nghĩ",
    path: ["s1", "s2"],
    pro: "Yếu nửa người kèm đau nửa đầu",
    con: "52 tuổi, không đau theo nhịp đập, không có cơn tương tự trước đây, gia đình không ai mắc",
    source: "dauDau",
  },
];

window.LOCALIZATION = {
  where: "Vỏ não hoặc bao trong bán cầu não (P)",
  why: "Yếu tay chân (T) kiểu trung ương. Đau đầu khởi đầu bên (P) rồi lan sang (T), phù hợp ổ tổn thương bán cầu (P) kích thích màng cứng.",
};

window.CAUSES = [
  ["Tăng huyết áp mạn", "Nghĩ nhiều", "THA 12 năm, không tái khám"],
  ["Bệnh mạch máu dạng bột", "Chưa loại trừ", "Lớn tuổi"],
  ["Dị dạng mạch máu não", "Ít nghĩ", "Tuổi hiện tại, không đau đầu mạn trước đây; cần MRI/CTA/DSA nếu nghi"],
];

window.CLS_REQUESTS = [
  ["CT não không cản quang / MRI", "Phân biệt xuất huyết và nhồi máu não", "d1, d2"],
  ["Đường huyết mao mạch, HbA1c", "Đánh giá kiểm soát ĐTĐ", "Tiền căn"],
  ["ECG", "Tìm nguồn thuyên tắc từ tim", "d2"],
  ["TPTTBM, PT, aPTT, INR", "Loại trừ rối loạn đông máu gây xuất huyết", "d1"],
  ["Ion đồ, creatinin, AST, ALT, bilan mỡ", "Nền chuyển hóa, chuẩn bị điều trị", "—"],
];

// [tên, kết quả, đơn vị, thấp, cao]
window.LABS = [
  ["WBC", 9.95, "K/uL", 4.0, 10.0],
  ["RBC", 5.62, "M/uL", 4.0, 5.4],
  ["Hgb", 15.1, "g/dL", 12.2, 15.4],
  ["MCH", 26.9, "pg", 27, 33.6],
  ["MCHC", 31.9, "g/dL", 32.3, 35.7],
  ["PLT", 280, "K/uL", 150, 400],
  ["MPV", 10.2, "fL", 5, 9],
  ["INR", 0.95, "", 1.14, 1.27],
  ["Creatinine", 50.42, "umol/L", 44, 88],
  ["Na+", 138.83, "mmol/L", 135, 150],
  ["K+", 3.12, "mmol/L", 3.5, 5.1],
  ["ALT", 30.94, "U/L", 0, 31],
  ["HbA1c", 9.5, "%", 4.0, 6.4],
];

window.IMAGING = [
  {
    name: "MRI sọ não không cản từ (17/09)",
    lines: [
      "Tụ máu xuất huyết cấp nhu mô não vùng đính (P), phù não quanh tổn thương",
      "Vi xuất huyết cũ cánh tay sau bao trong (T) và bên (T) cầu não",
      "Vài ổ tăng tín hiệu FLAIR chất trắng hai bán cầu, nghĩ bệnh mạch máu nhỏ",
      "Không thấy bất thường động mạch nội sọ",
    ],
  },
  {
    name: "ECG (19/09)",
    lines: ["Nhịp xoang 81 l/ph, trục trung gian", "Không lớn nhĩ, không lớn thất, không block", "Không hình ảnh nhồi máu cơ tim, QTc ~0,42"],
  },
];

window.CLS_REASONING = [
  ["Công thức máu", "Hgb, Hct, tiểu cầu bình thường → loại trừ bệnh huyết học thuận lợi xuất huyết. WBC tăng nhẹ, không sốt → nghĩ phản ứng stress."],
  ["Đông máu", "PT, aPTT, INR không kéo dài → loại trừ nguyên nhân rối loạn đông máu."],
  ["Sinh hóa", "Creatinin, eGFR bình thường. K+ giảm nhẹ 3,12 → bổ sung đường uống, theo dõi."],
  ["HbA1c", "9,5% → kiểm soát đường huyết kém, là yếu tố nguy cơ tái phát."],
  ["MRI", "Máu tụ đính (P) phù hợp lâm sàng. Vi xuất huyết cũ vị trí sâu → nghĩ do THA lâu năm. Tổn thương chất trắng → bệnh mạch máu nhỏ do THA, ĐTĐ."],
];

// Chỗ "AI kiểm tra" phát hiện chưa khớp, để minh họa chế độ rà soát
window.REVIEW_FLAGS = [
  {
    where: "bien-luan-cls",
    text: "Biện luận ghi \"WBC tăng nhẹ\" nhưng WBC 9,95 K/uL vẫn nằm trong giới hạn 4,0–10,0. Nên sửa thành \"WBC bình thường cao\".",
  },
];

window.FINAL_DX = "Xuất huyết não cấp vùng đính (P) ngày 3, nghĩ nguyên nhân do THA / THA – ĐTĐ type 2";

// Lấy từ knowledge/dot-quy.md, mục "ĐQ xuất huyết não" và "Phòng ngừa thứ phát và phục hồi".
// text = null nghĩa là bài giảng không có nội dung cho ý này.
window.TREATMENT = [
  ["Điều trị đặc hiệu", "Chưa có điều trị đặc hiệu trong giai đoạn cấp. Không có chỉ định tiêu sợi huyết.", "Bai DQ Y5 §B.1; Dot quy Y5_PPT §Điều trị XHN"],
  ["Theo dõi, đường thở", "Theo dõi sát và bảo vệ đường thở.", "Bai DQ Y5 §B.4"],
  ["Huyết áp", "Duy trì HA ban đầu đến khi có CT. Theo INTERACT2: HATT 150–220 mmHg, không chống chỉ định hạ áp cấp → hạ HATT đến 140 mmHg là an toàn; HATT > 220 mmHg → hạ áp tích cực bằng thuốc tĩnh mạch, theo dõi sát.", "Bai DQ Y5 §B.4"],
  ["Đông máu, đường huyết, biến chứng", "Điều chỉnh rối loạn đông máu; điều trị tăng đường huyết; điều trị biến chứng (viêm phổi…); điều trị bệnh kèm theo.", "Dot quy Y5_PPT §Điều trị XHN"],
  ["Phục hồi chức năng", "Hầu hết khiếm khuyết cải thiện trong 3–6 tháng đầu; vật lý trị liệu và ngôn ngữ trị liệu giúp hồi phục nhanh hơn.", "Bai DQ Y5 §4.2"],
  ["Mục tiêu đường huyết, bù K+ cụ thể", null, null],
];
