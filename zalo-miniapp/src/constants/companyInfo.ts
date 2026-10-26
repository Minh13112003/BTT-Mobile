// Thông tin công ty lấy từ benthanhtourist.com (/gioi-thieu và /lien-he).

export interface OfficePhone {
  label: string;
  number: string;
}

export interface Office {
  name: string;
  address: string;
  phones: OfficePhone[];
}

export const COMPANY = {
  name: "Công ty Cổ phần Dịch vụ Du lịch Bến Thành",
  brand: "BenThanh Tourist",
  ceo: "Nguyễn Ngọc Hoài Nguyên",
  taxCode: "0301171827",
  license:
    "Số 0301171827, đăng ký lần đầu ngày 13/01/2005, do Sở Kế hoạch và Đầu tư TP.HCM cấp",
  travelLicense: "79-089/2020/TCDL-GP LHQT",
  hq: "70 Lý Tự Trọng, Phường Bến Thành, TP. Hồ Chí Minh",
  hotline: "1900 6668",
  tel: "028 3520 2020",
  email: "benthanh@benthanhtourist.com",
  website: "benthanhtourist.com",
  intro: [
    "Là một trong những công ty du lịch hàng đầu Việt Nam, cùng với lịch sử hơn 35 năm phát triển liên tục, BenThanh Tourist đã xây dựng một thương hiệu du lịch uy tín trên thị trường trong và ngoài nước.",
    "BenThanh Tourist luôn xây dựng niềm tin cho khách hàng bằng đội ngũ nhân sự giàu kinh nghiệm trong lĩnh vực du lịch, chuỗi sản phẩm đa dạng và phong phú cùng hệ thống cơ sở vật chất tiện nghi, nhằm thực hiện đúng những gì đã cam kết với khách hàng.",
  ],
  stats: [
    { value: "35+", label: "năm phát triển" },
    { value: "1989", label: "thành lập" },
    { value: "3 miền", label: "có văn phòng" },
  ],
  businessLines: [
    "Tour trong nước & quốc tế",
    "Tour MICE",
    "Vận chuyển du lịch",
    "Nhà hàng – Khách sạn",
    "Cao ốc văn phòng cho thuê",
    "Thương mại",
    "Đầu tư tài chính",
  ],
  associations: [
    { code: "VITA", name: "Hiệp hội Du lịch Việt Nam" },
    { code: "HTA", name: "Hiệp hội Du lịch TP. Hồ Chí Minh" },
    { code: "PATA", name: "Hiệp hội Du lịch Châu Á Thái Bình Dương" },
  ],
  serviceLines: [
    { label: "Khách lẻ", number: "0832 666 000" },
    { label: "Đoàn trong nước", number: "0971 963 676" },
    { label: "Đoàn quốc tế", number: "0919 696 894" },
    { label: "Vé máy bay", number: "0823 260 110" },
  ],
} as const;

export const OFFICES_VN: Office[] = [
  {
    "name": "Trụ sở chính",
    "address": "70 Lý Tự Trọng, P. Bến Thành, TP. Hồ Chí Minh",
    "phones": [
      {
        "label": "ĐT",
        "number": "028 3520 2020"
      }
    ]
  },
  {
    "name": "Trung tâm Du lịch Khách lẻ",
    "address": "03–05 Nguyễn Huệ, P. Sài Gòn, TP. Hồ Chí Minh",
    "phones": [
      {
        "label": "ĐT",
        "number": "028 3822 7788"
      },
      {
        "label": "Hotline",
        "number": "0832 666 000"
      }
    ]
  },
  {
    "name": "Chi nhánh Hà Nội",
    "address": "Tầng 4, Tòa nhà Kinh Đô, 93 Lò Đúc, P. Hai Bà Trưng, Hà Nội",
    "phones": [
      {
        "label": "ĐT",
        "number": "024 3944 5126"
      },
      {
        "label": "Hotline",
        "number": "0908 275 680"
      }
    ]
  },
  {
    "name": "Chi nhánh Đà Nẵng",
    "address": "90 Quang Trung, P. Hải Châu, Đà Nẵng",
    "phones": [
      {
        "label": "ĐT",
        "number": "023 6356 1770"
      },
      {
        "label": "Hotline",
        "number": "0913 561 770"
      }
    ]
  },
  {
    "name": "Văn phòng Huế",
    "address": "18 Lê Lợi, P. Thuận Hóa, Huế",
    "phones": [
      {
        "label": "ĐT",
        "number": "023 4397 9989"
      },
      {
        "label": "Hotline",
        "number": "0979 566 777"
      }
    ]
  },
  {
    "name": "Chi nhánh Vĩnh Long – KDL Vinh Sang",
    "address": "Tổ 14, Ấp An Thuận, Xã An Bình, Tỉnh Vĩnh Long",
    "phones": [
      {
        "label": "ĐT",
        "number": "027 0627 7277"
      },
      {
        "label": "Hotline",
        "number": "0918 664 499"
      }
    ]
  },
  {
    "name": "Chi nhánh Cần Thơ",
    "address": "171 Trần Văn Khéo, P. Cái Khế, Cần Thơ",
    "phones": [
      {
        "label": "ĐT",
        "number": "029 2367 6868"
      },
      {
        "label": "Hotline",
        "number": "0919 978 860"
      }
    ]
  },
  {
    "name": "Văn phòng Cà Mau",
    "address": "378 Phan Ngọc Hiển, P. An Xuyên, Tỉnh Cà Mau",
    "phones": [
      {
        "label": "ĐT",
        "number": "029 0354 0234"
      },
      {
        "label": "ĐT",
        "number": "029 0354 0345"
      },
      {
        "label": "Hotline",
        "number": "0976 677 868"
      }
    ]
  },
  {
    "name": "Văn phòng An Giang",
    "address": "76 Hùng Vương, P. Long Xuyên, Tỉnh An Giang",
    "phones": [
      {
        "label": "Hotline",
        "number": "0919 249 993"
      }
    ]
  }
];

export const OFFICES_OVERSEAS: Office[] = [
  {
    "name": "Đại lý tại Canada",
    "address": "3387 Oakglade Crescent, Mississauga, Ontario L5C 1X4",
    "phones": [
      {
        "label": "ĐT",
        "number": "+1 (647) 468 0678"
      }
    ]
  },
  {
    "name": "Đại lý tại Úc (Australia)",
    "address": "69 Ballarat Rd, Footscray, Vic 3011",
    "phones": [
      {
        "label": "ĐT",
        "number": "+61 047 878 9767"
      }
    ]
  },
  {
    "name": "Đại lý tại Đức",
    "address": "Basselscheider Str. 3, 56281 Emmelshausen, Rheinland-Pfalz",
    "phones": [
      {
        "label": "WhatsApp",
        "number": "+49 176 7018 8868"
      }
    ]
  }
];
