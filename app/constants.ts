import { Question, Law } from './types'

export const INITIAL_QUESTION: Question = {
    id: "situation-input",
    question:
        "안녕하세요! 동대문구 민원 도우미입니다. 어떤 상황이신지 자유롭게 말씀해 주세요.\n상황을 분석하여 가장 적합한 민원 창구를 안내해드리겠습니다.",
    subtitle: "예: 불법주차 차량을 신고하고 싶어요\n예: 소음 문제로 고민이에요",
    inputType: "textarea",
    placeholder: "예: 불법주차 차량을 신고하고 싶어요\n예: 소음 문제로 고민이에요",
    field: "complaintType",
}

export const VIOLATION_TYPE_OPTIONS = [
    "교통위반(고속도로 포함)",
    "이륜차 위반",
    "난폭/보복운전",
    "버스전용차로 위반(고속도로제외)",
    "번호판 규정 위반",
    "불법등화, 반사판(지) 가림·손상",
    "불법 튜닝, 해체, 조작",
    "기타 자동차 안전기준 위반"
]

export const SAFETY_REPORT_QUESTIONS: Question[] = [
    {
        id: "photos",
        question: "사진/동영상을 업로드해 주세요.\n이곳을 터치 또는 파일을 드래그 하세요.",
        inputType: "file",
        field: "photos",
    },
    {
        id: "location",
        question: "신고 발생 지역을 알려주세요.\n위치 찾기를 이용하여 대략의 주소를 검색해 주세요.",
        inputType: "text",
        placeholder: "서울특별시 중구 시청로 161",
        field: "location",
    },
    {
        id: "title",
        question: "제목을 입력해 주세요.",
        inputType: "text",
        placeholder: "최소 2자, 최대 150자 작성 가능",
        field: "title",
    },
    {
        id: "content",
        question: "신고 내용을 자세히 작성해 주세요.",
        inputType: "textarea",
        placeholder:
            "자동차·교통 위반 사항을 신고해 주세요.(이 메뉴에 불법 주정차를 신고하면 요건이 충족되지 않아 과태료 부과가 안 될 수 있습니다.)",
        field: "content",
    },
    {
        id: "vehicle-number",
        question: "차량 번호를 입력해 주세요.",
        inputType: "text",
        placeholder: "차량 번호 입력",
        field: "vehicleNumber",
    },
    {
        id: "date",
        question: "발생 일자를 입력해 주세요.",
        inputType: "date",
        field: "date",
    },
    {
        id: "time",
        question: "발생 시각을 입력해 주세요.",
        inputType: "time",
        field: "time",
    },
    {
        id: "phone",
        question: "휴대전화 번호를 입력해 주세요.",
        inputType: "phone",
        placeholder: "010-1234-5678",
        field: "phone",
    },
    {
        id: "verification",
        question: "인증 번호를 입력해 주세요.",
        inputType: "text",
        placeholder: "인증번호 6자리",
        field: "verificationCode",
    },
    {
        id: "share-content",
        question: "신고 내용 공유에 동의하시겠습니까?\n\n공유에 동의하시면 신고 내용과 답변내용이 신고업무 처리나 정부정책에 반영하기 위해 다른 행정기관에 제공 될 수 있으며, 필요 시 행정기관등의 홈페이지를 통해 일반국민들에게 신고 사례로 제공 될 수 있습니다.",
        inputType: "select",
        field: "shareContent",
        options: ["예", "아니요"],
    },
    {
        id: "personal-info",
        question: "인적 사항을 입력해 주세요.\n\n인적 사항(성명 등) 미입력 시 처리 기관의 신고 이력 관리, 진행 사항 통보, 처리 등 업무에 제약을 받을 수 있습니다. 「민원처리에 관한 법률」 시행령 제2조 제1항",
        inputType: "select",
        field: "personalInfoType",
        options: ["개인", "기관", "단체·기업"],
    },
    {
        id: "name",
        question: "이름을 입력해 주세요.\n(주민등록상 기재된 실명을 입력해 주세요.)",
        inputType: "text",
        placeholder: "홍길동",
        field: "name",
    },
    {
        id: "email",
        question: "이메일 주소를 입력해 주세요.",
        inputType: "text",
        placeholder: "example@email.com",
        field: "email",
    },
    {
        id: "privacy-consent",
        question: "개인정보 수집 동의에 동의하시겠습니까?",
        inputType: "select",
        field: "privacyConsent",
        options: ["예", "아니요"],
    },
]

export const DONGDAEMUN_REPORT_QUESTIONS: Question[] = [
    {
        id: "title",
        question: "제목을 입력해 주세요.",
        inputType: "text",
        placeholder: "최소 2자, 최대 150자 작성 가능",
        field: "title",
    },
    {
        id: "public-status",
        question: "공개여부를 선택해 주세요.",
        inputType: "select",
        field: "publicStatus",
        options: ["공개", "비공개", "내용공개"],
    },
    {
        id: "address",
        question: "주소를 입력해 주세요.",
        inputType: "text",
        placeholder: "주소 검색을 이용해 주세요",
        field: "location",
    },
    {
        id: "email",
        question: "전자우편주소를 입력해 주세요.",
        inputType: "text",
        placeholder: "example@email.com",
        field: "email",
    },
    {
        id: "mobile-phone",
        question: "휴대폰 번호를 입력해 주세요.\n'-'을 제외한 휴대폰번호 숫자만 입력해 주세요.",
        inputType: "phone",
        placeholder: "01012345678",
        field: "phone",
    },
    {
        id: "phone-number",
        question: "전화번호를 입력해 주세요.\n'-'을 제외한 전화번호 숫자만 입력해 주세요.",
        inputType: "phone",
        placeholder: "0212345678",
        field: "phoneNumber",
    },
    {
        id: "notification-method",
        question: "별도 결과통지여부를 선택해 주세요.",
        inputType: "select",
        field: "notificationMethod",
        options: ["게시판 답변", "전자우편(E-MAIL)", "휴대전화 문자메시지(SMS)"],
    },
    {
        id: "same-complaint",
        question: "동일 고충민원여부를 확인해 주세요.",
        inputType: "select",
        field: "sameComplaint",
        options: ["동일 민원 없음", "동일 민원 있음"],
    },
    {
        id: "content",
        question: "내용을 자세히 작성해 주세요.",
        inputType: "textarea",
        placeholder: "민원 내용을 자세히 작성해 주세요.",
        field: "content",
    },
    {
        id: "attachments",
        question: "첨부파일을 업로드해 주세요.\n최대 5MByte, 한글 파일명 사용 시 오류가 발생할 수 있습니다.",
        inputType: "file",
        field: "photos",
    },
    {
        id: "privacy-consent-dongdaemun",
        question: "개인정보 수집 및 이용에 동의하시겠습니까?",
        inputType: "select",
        field: "privacyConsent",
        options: ["동의함", "동의하지 않음"],
    },
]
export const RELATED_LAWS: Law[] = [
    {
        title: "장애인·노인·임산부 등의 편의증진 보장에 관한 법률 제9조 제2항",
        content: "공공기관은 전체 주차 면적의 2% 이상을 장애인 전용 주차구역으로 설치하여야 한다.",
        draft: "해당 공공기관의 주차장에서 장애인 전용 주차구역이 전체 주차 면적의 2% 미만으로 설치되어 있어 「장애인·노인·임산부 등의 편의증진 보장에 관한 법률」 제9조 제2항을 위반하고 있습니다. 장애인 전용 주차구역을 법정 비율에 맞게 확충하여 장애인의 편의를 보장해 주시기 바랍니다."
    },
    {
        title: "도로교통법 제32조 제1항",
        content: "모든 차의 운전자는 교통안전표지가 표시하는 지시에 따라야 한다.",
        draft: "해당 차량이 교통안전표지(신호등, 도로표지 등)를 준수하지 않고 운행하여 「도로교통법」 제32조 제1항을 위반하고 있습니다. 교통안전표지를 준수하여 안전한 교통질서를 유지해 주시기 바랍니다."
    },
    {
        title: "도로교통법 제43조 제1항",
        content: "모든 차의 운전자는 제한속도를 초과하여 운전하여서는 아니 된다.",
        draft: "해당 차량이 제한속도를 초과하여 운전하여 「도로교통법」 제43조 제1항을 위반하고 있습니다. 제한속도를 준수하여 안전한 운전을 해 주시기 바랍니다."
    },
    {
        title: "도로교통법 제44조",
        content: "모든 차의 운전자는 안전거리를 확보하여야 한다.",
        draft: "해당 차량이 안전거리를 확보하지 않고 운전하여 「도로교통법」 제44조를 위반하고 있습니다. 안전거리를 확보하여 교통사고를 예방해 주시기 바랍니다."
    },
    {
        title: "도로교통법 제45조",
        content: "모든 차의 운전자는 앞지르기를 할 때에는 안전한 방법과 절차에 따라야 한다.",
        draft: "해당 차량이 안전한 방법과 절차를 준수하지 않고 앞지르기를 하여 「도로교통법」 제45조를 위반하고 있습니다. 안전한 앞지르기 방법을 준수해 주시기 바랍니다."
    }
]
export const MAYOR_REQUEST_QUESTIONS: Question[] = [
    {
        id: "notes-agreement",
        question: "유의사항",
        subtitle: "구민의 관심과 참여로 함께 하는 열린행정구현! 구민 여러분과 소통하는 소중한 의견을 듣습니다.\n\n• 누구든지 정보통신망을 통하여 사람을 비방하거나 욕설 등 불건전한 내용을 게시하거나 배포 하면 \"정보통신망 이용촉진 및 정보보호 등에 관한 법률 제70조 내지 제74조에 따라 처벌 받을 수 있습니다.\n• 게시판의 건전한 운영을 위해 불건전한 자료나 민원으로 부적합하다고 판단되는 의견은 \"서울특별시 동대문구 정보화 기본조례 제38조\"에 따라 삭제 될 수 있습니다.\n• 30분이상 페이지요청이 없는 경우 보안정책상 자동로그아웃 됩니다. 이에 게시글 등록이 안되시는 경우, 개인PC에 작성하신 내용을 따로 저장한 후 다시 로그인하여 등록해주시기 바랍니다.",
        inputType: "select",
        field: "notesAgreement",
        options: ["유의사항을 확인하였습니다."],
    },
    {
        id: "privacy-agreement",
        question: "개인정보 수집 및 이용 동의",
        subtitle: "1. 동대문구 홈페이지 민원(상담,의견,신고) 등록과 관련하여 개인정보보호법에 의거 본인의 개인정보를 아래와 같이 활용하는데 동의합니다.\n\n가. 수집하는 개인정보의 항목\n1. 개인정보 수집이용 내역(민원통합상담창구)\n\n수집하는 개인정보의 항목 - 수집항목, 수집·이용목적, 보유기간 항목으로 구성된 표입니다\n수집항목   수집·이용목적   보유기간\n신청자 정보   필수: 이름, 휴대전화번호, 휴대전화 문자알림 여부, 주소, 공개여부\n선택: 이메일주소   - 민원(상담, 의견, 신고)확인 및 처리   본 서비스 종료 시까지\n위의 개인정보 수집·이용에 대한 동의를 거부할 권리가 있습니다. 그러나 동의를 거부할 경우 경우 글 등록이 제한됩니다.\n\n2. 수집된 개인정보는 위 목적 이외의 용도로는 이용되지 않으며, 제3자에게 제공하지 않습니다.",
        inputType: "select",
        field: "privacyAgreement",
        options: ["개인정보 수집 및 이용에 동의합니다."],
    },
    {
        id: "mobile-phone",
        question: "휴대전화를 입력해 주세요.",
        inputType: "text",
        placeholder: "010-1234-5678",
        field: "phone",
    },
    {
        id: "email",
        question: "이메일을 입력해 주세요.",
        inputType: "text",
        placeholder: "example@email.com",
        field: "email",
    },
    {
        id: "title",
        question: "제목을 입력해 주세요.",
        inputType: "text",
        placeholder: "최소 2자, 최대 150자 작성 가능",
        field: "title",
    },
    {
        id: "content",
        question: "민원 내용을 자세히 작성해 주세요.",
        inputType: "textarea",
        placeholder: "민원 내용을 자세히 작성해 주세요.",
        field: "content",
    },
    {
        id: "attachments",
        question: "첨부파일을 업로드해 주세요.",
        subtitle: "최대 5MByte, 한글 파일명 사용 시 오류가 발생할 수 있습니다.\n\n업로드된 파일은 개인정보 보호용으로 자동 변환되어 민감한 정보가 제거됩니다. 제출할 파일을 선택해 주세요.",
        inputType: "file",
        field: "photos",
    },
    {
        id: "text-notification",
        question: "휴대전화 문자알림을 선택해 주세요.",
        inputType: "select",
        field: "notificationMethod",
        options: ["신청", "신청안함"],
    },
    {
        id: "public-disclosure",
        question: "공개여부를 선택해 주세요.",
        inputType: "select",
        field: "publicStatus",
        options: ["공개", "비공개"],
    },
]


export const VIOLATION_TYPE_KEYWORDS = {
    "교통위반(고속도로 포함)": [
        "신호위반", "신호", "교통신호", "빨간불", "노란불", "초록불",
        "과속", "속도위반", "제한속도", "속도", "빠르게", "천천히",
        "고속도로", "고속", "도로", "교통", "운전", "차량"
    ],
    "이륜차 위반": [
        "오토바이", "이륜차", "바이크", "모터사이클", "스쿠터",
        "원동기", "이륜", "오토바이", "바이크"
    ],
    "난폭/보복운전": [
        "난폭운전", "보복운전", "위협", "협박", "폭력", "싸움",
        "추월", "급제동", "급출발", "위험운전", "과격", "공격적"
    ],
    "버스전용차로 위반(고속도로제외)": [
        "버스전용차로", "버스차로", "전용차로", "버스", "버스전용",
        "차로위반", "버스차로", "전용"
    ],
    "번호판 규정 위반": [
        "번호판", "차량번호", "번호", "판", "차량번호판",
        "번호판가림", "번호판손상", "번호판변조", "번호판위반"
    ],
    "불법등화, 반사판(지) 가림·손상": [
        "등화", "불법등화", "반사판", "가림", "손상", "조명",
        "불빛", "등", "램프", "헤드라이트", "브레이크등"
    ],
    "불법 튜닝, 해체, 조작": [
        "튜닝", "불법튜닝", "해체", "조작", "개조", "수정",
        "변경", "부품", "엔진", "배기관", "소음기"
    ],
    "기타 자동차 안전기준 위반": [
        "안전기준", "안전", "기준", "위반", "자동차", "차량",
        "안전장치", "브레이크", "타이어", "유리", "미러"
    ]
}