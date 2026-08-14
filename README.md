# TaxMaster 2026 (연말정산 절세 도우미)

2026년 귀속 세법(자녀 수에 따른 공제한도 확대 등)을 반영한 연말정산 신용카드 소득공제 계산기 및 절세 가이드 웹 애플리케이션입니다.
Google AdSense 승인 조건을 고려하여 개발되었습니다.

## 특징 (Features)

- **2026년 귀속 세법 완벽 반영:** 부양자녀 수에 따른 신용카드 공제한도 확대 (1인당 50만원, 최대 100만원)
- **절세 추천 시스템:** 입력된 소비 패턴을 분석하여 신용카드/체크카드 사용 비율 조정을 통한 맞춤형 절세 가이드 제공
- **Premium Design:** 'Golden Wealth' 테마 기반의 고급스러운 다크 모드 UI와 파티클 애니메이션
- **Privacy First:** 사용자 입력 데이터는 서버로 전송되지 않고 브라우저 LocalStorage에만 저장됨
- **SEO & AdSense Ready:** 검색 엔진 최적화 및 구글 애드센스 승인을 위한 필수 페이지(소개, 약관, 개인정보처리방침 등) 완비

## 구조 (Structure)

```text
/
├── index.html        # 메인 계산기 페이지
├── guide.html        # 절세 가이드 페이지 (SEO 목적)
├── about.html        # 사이트 소개
├── privacy.html      # 개인정보처리방침 (AdSense 필수)
├── terms.html        # 이용약관
├── contact.html      # 문의하기 (AdSense 필수)
├── robots.txt        # 검색 로봇 제어
├── sitemap.xml       # 검색 엔진 사이트맵
├── css/
│   └── style.css     # 공통 디자인 시스템 및 애니메이션
└── js/
    ├── calculator.js # 2026 귀속 세법 계산 로직
    ├── storage.js    # LocalStorage 저장/불러오기
    └── ui.js         # DOM 조작 및 인터랙션
```

## 향후 과제 (TODO)

- [ ] Github Pages에 호스팅 배포 설정
- [ ] Cloudflare 연동 및 SSL/커스텀 도메인 설정 (선택사항)
- [ ] 사이트 소유권 확인 후 Google Search Console / Naver Webmaster tool 등록
- [ ] 구글 애드센스 신청 및 승인 후 `index.html`과 `guide.html`의 임시 광고 슬롯에 실제 태그 삽입
