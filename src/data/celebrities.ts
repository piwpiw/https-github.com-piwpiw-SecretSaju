/**
 * Celebrity Matching Database
 *
 * Maps each of the 60 pillars to 2-3 famous people
 * who share that pillar for social proof and engagement.
 *
 * 일주 코드는 저장소 엔진(src/core/calendar/ganji.ts의 getDayPillar)으로
 * birthdate(출생지 현지 양력 날짜)를 계산해 배정했다.
 * 생년월일은 위키백과 등 공개된 값만 사용한다.
 */

export type Celebrity = {
    name: string
    category: '기업가' | '연예인' | '정치인' | '스포츠' | '예술가' | '학자'
    birthdate: string
    achievement: string
    personality_match: string
    quote?: string
    image_url?: string
    wiki_link?: string
}

export type CelebrityData = {
    [pillarCode: string]: Celebrity[]
}

/**
 * Celebrity Matches by Pillar Code
 * Total: 60 pillars, 142 entries (every pillar has 2-3 celebs)
 */
export const CELEBRITY_MATCHES: CelebrityData = {
    // 1. GAP_JA (갑자) - 추진력, 책임감, 우두머리 기질
    "GAP_JA": [
        {
            name: "이재용",
            category: "기업가",
            birthdate: "1968-06-23",
            achievement: "삼성전자 회장, 삼성그룹 3대 총수",
            personality_match: "갑자일주 특유의 우두머리 기질과 책임감. 거대한 조직을 이끄는 무게를 견디는 타고난 리더.",
            wiki_link: "https://ko.wikipedia.org/wiki/이재용"
        },
        {
            name: "윈터",
            category: "연예인",
            birthdate: "2001-01-01",
            achievement: "에스파(aespa) 멤버, 차세대 K-pop 보컬",
            personality_match: "1월 1일에 태어난 진짜 '새 시작'의 아이콘. 갑자일주답게 맨 앞에서 치고 나가는 스타일.",
            wiki_link: "https://ko.wikipedia.org/wiki/윈터_(가수)"
        }
    ],

    // 2. EUL_CHUK (을축) - 외유내강, 끈기, 대기만성
    "EUL_CHUK": [
        {
            name: "박찬호",
            category: "스포츠",
            birthdate: "1973-07-28",
            achievement: "한국인 최초 메이저리거, MLB 아시아 투수 최다승(124승)",
            personality_match: "온화한 얼굴 뒤에 숨은 강철 끈기. 을축일주의 대기만성으로 미국 무대를 개척한 파이어니어.",
            wiki_link: "https://ko.wikipedia.org/wiki/박찬호"
        },
        {
            name: "마돈나",
            category: "연예인",
            birthdate: "1958-08-16",
            achievement: "'팝의 여왕', 여성 아티스트 역대 최고 음반 판매 기록",
            personality_match: "부드러워 보여도 절대 꺾이지 않는 을축의 뚝심. 수십 년간 정상을 지킨 지구력이 증거.",
            wiki_link: "https://en.wikipedia.org/wiki/Madonna"
        },
        {
            name: "모차르트",
            category: "예술가",
            birthdate: "1756-01-27",
            achievement: "클래식 음악의 천재, 35년 생애 동안 600여 곡 작곡",
            personality_match: "겉으론 유쾌했지만 속엔 음악에 대한 소처럼 우직한 몰입이 있었다. 을축의 겉과 속.",
            wiki_link: "https://ko.wikipedia.org/wiki/볼프강_아마데우스_모차르트"
        }
    ],

    // 3. BYEONG_IN (병인) - 열정, 창의성, 독립성
    "BYEONG_IN": [
        {
            name: "백종원",
            category: "기업가",
            birthdate: "1966-09-04",
            achievement: "더본코리아 창업자, 외식 사업가 겸 방송인",
            personality_match: "병인일주 특유의 뜨거운 추진력과 독립성. 하고 싶은 건 일단 저지르고 보는 스타일.",
            wiki_link: "https://ko.wikipedia.org/wiki/백종원"
        },
        {
            name: "스티븐 스필버그",
            category: "예술가",
            birthdate: "1946-12-18",
            achievement: "E.T., 쥬라기 공원, 쉰들러 리스트 감독",
            personality_match: "호랑이 위에 뜬 태양처럼 스케일 큰 상상력. 병인일주의 창의성이 영화 역사를 바꿨다.",
            wiki_link: "https://en.wikipedia.org/wiki/Steven_Spielberg"
        },
        {
            name: "넬슨 만델라",
            category: "정치인",
            birthdate: "1918-07-18",
            achievement: "남아공 최초 흑인 대통령, 노벨 평화상 수상",
            personality_match: "27년 감옥에서도 꺼지지 않은 병인의 불꽃. 신념 하나로 세상을 바꾼 큰 호랑이.",
            wiki_link: "https://ko.wikipedia.org/wiki/넬슨_만델라"
        }
    ],

    // 4. JEONG_MYO (정묘) - 섬세함, 예민함, 집중력
    "JEONG_MYO": [
        {
            name: "김택용",
            category: "스포츠",
            birthdate: "1989-11-03",
            achievement: "스타크래프트 '3.3 혁명'의 주인공, MSL 3회 우승 프로게이머",
            personality_match: "정묘일주의 섬세한 컨트롤과 예리한 집중력. 손끝 하나로 판을 뒤집은 혁명가.",
            wiki_link: "https://ko.wikipedia.org/wiki/김택용"
        },
        {
            name: "해리슨 포드",
            category: "연예인",
            birthdate: "1942-07-13",
            achievement: "인디아나 존스, 스타워즈 한 솔로 역의 할리우드 전설",
            personality_match: "화려함보다 디테일로 승부하는 정묘 스타일. 목수 출신답게 손으로 하나하나 쌓아 올린 커리어.",
            wiki_link: "https://en.wikipedia.org/wiki/Harrison_Ford"
        }
    ],

    // 5. MU_JIN (무진) - 뚝심, 배포, 강인함
    "MU_JIN": [
        {
            name: "박보검",
            category: "연예인",
            birthdate: "1993-06-16",
            achievement: "응답하라 1988, 구르미 그린 달빛으로 국민 배우 등극",
            personality_match: "부드러운 미소 뒤에 산 같은 뚝심. 무진일주답게 흔들리지 않고 제 길을 가는 타입.",
            wiki_link: "https://ko.wikipedia.org/wiki/박보검"
        },
        {
            name: "태연",
            category: "연예인",
            birthdate: "1989-03-09",
            achievement: "소녀시대 리더이자 메인보컬, 솔로로도 정상급 가수",
            personality_match: "무진일주의 묵직한 존재감. 화려한 그룹을 이끌면서도 중심이 흔들리지 않는 큰 산.",
            wiki_link: "https://ko.wikipedia.org/wiki/태연"
        }
    ],

    // 6. GI_SA (기사) - 지혜, 전략, 임기응변
    "GI_SA": [
        {
            name: "버락 오바마",
            category: "정치인",
            birthdate: "1961-08-04",
            achievement: "미국 최초 흑인 대통령, 노벨 평화상 수상",
            personality_match: "기사일주 특유의 부드러운 언변과 전략적 사고. 말로 사람을 움직이는 타고난 설득가.",
            wiki_link: "https://ko.wikipedia.org/wiki/버락_오바마"
        },
        {
            name: "수지",
            category: "연예인",
            birthdate: "1994-10-10",
            achievement: "미쓰에이 출신 '국민 첫사랑', 가수 겸 배우",
            personality_match: "순한 인상 뒤의 영리한 실속. 기사일주답게 가수에서 배우까지 판을 넓히는 감각이 남다르다.",
            wiki_link: "https://ko.wikipedia.org/wiki/수지_(1994년)"
        }
    ],

    // 7. GYEONG_O (경오) - 카리스마, 결단력, 승부사
    "GYEONG_O": [
        {
            name: "무하마드 알리",
            category: "스포츠",
            birthdate: "1942-01-17",
            achievement: "헤비급 세계 챔피언 3회, 20세기 최고의 스포츠 아이콘",
            personality_match: "경오일주의 강철 승부욕과 불꽃 카리스마. 링 위에서도 링 밖에서도 물러섬이 없었다.",
            quote: "나비처럼 날아서 벌처럼 쏜다",
            wiki_link: "https://ko.wikipedia.org/wiki/무하마드_알리"
        },
        {
            name: "장미란",
            category: "스포츠",
            birthdate: "1983-10-09",
            achievement: "베이징 올림픽 역도 금메달, 문화체육관광부 차관",
            personality_match: "쇠(庚)를 다루는 일주답게 바벨을 지배한 챔피언. 경오의 우직한 결단력.",
            wiki_link: "https://ko.wikipedia.org/wiki/장미란"
        }
    ],

    // 8. SIN_MI (신미) - 감수성, 자기 스타일, 은근한 고집
    "SIN_MI": [
        {
            name: "차은우",
            category: "연예인",
            birthdate: "1997-03-30",
            achievement: "아스트로 멤버, '얼굴 천재'로 불리는 가수 겸 배우",
            personality_match: "신미일주는 다듬어진 보석. 타고난 미모에 성실한 자기 관리가 더해진 케이스.",
            wiki_link: "https://ko.wikipedia.org/wiki/차은우"
        },
        {
            name: "레이디 가가",
            category: "연예인",
            birthdate: "1986-03-28",
            achievement: "그래미·아카데미를 모두 수상한 팝 아이콘",
            personality_match: "남 눈치 안 보는 신미의 자기 스타일. 예민한 감수성을 무기로 바꾼 아티스트.",
            wiki_link: "https://en.wikipedia.org/wiki/Lady_Gaga"
        }
    ],

    // 9. IM_SIN (임신) - 총명함, 아이디어, 실행력
    "IM_SIN": [
        {
            name: "방시혁",
            category: "기업가",
            birthdate: "1972-08-09",
            achievement: "하이브 창업자, BTS를 만든 프로듀서",
            personality_match: "임신일주의 총명함과 아이디어가 K-pop 산업 지도를 바꿨다. 머리와 실행력을 다 가진 타입.",
            wiki_link: "https://ko.wikipedia.org/wiki/방시혁"
        },
        {
            name: "박진영",
            category: "연예인",
            birthdate: "1971-12-13",
            achievement: "JYP엔터테인먼트 창업자, 가수 겸 프로듀서",
            personality_match: "물처럼 유연하게 시대를 읽는 임신일주. 30년 넘게 히트곡을 만드는 아이디어 뱅크.",
            wiki_link: "https://ko.wikipedia.org/wiki/박진영"
        },
        {
            name: "하정우",
            category: "연예인",
            birthdate: "1978-03-11",
            achievement: "추격자, 신과함께 등 천만 영화 다수의 충무로 대표 배우",
            personality_match: "연기, 그림, 감독까지 넘나드는 임신일주의 다재다능. 재주가 흘러넘치는 물의 기운.",
            wiki_link: "https://ko.wikipedia.org/wiki/하정우"
        }
    ],

    // 10. GYE_YU (계유) - 신중함, 예리함, 완벽주의
    "GYE_YU": [
        {
            name: "김연아",
            category: "스포츠",
            birthdate: "1990-09-05",
            achievement: "밴쿠버 올림픽 금메달, '피겨 여왕'",
            personality_match: "계유일주의 완벽주의가 얼음 위에서 빛났다. 우아함 속에 숨은 소름 돋는 정확함.",
            wiki_link: "https://ko.wikipedia.org/wiki/김연아"
        },
        {
            name: "류현진",
            category: "스포츠",
            birthdate: "1987-03-25",
            achievement: "아시아 최초 MLB 평균자책점 1위에 오른 '코리안 몬스터'",
            personality_match: "힘이 아니라 제구로 승부하는 투수. 계유의 예리한 칼끝 같은 컨트롤.",
            wiki_link: "https://ko.wikipedia.org/wiki/류현진"
        }
    ],

    // 11. GAP_SUL (갑술) - 책임감, 신념, 우직함
    "GAP_SUL": [
        {
            name: "이소룡",
            category: "연예인",
            birthdate: "1940-11-27",
            achievement: "절권도 창시자, 세계 영화사를 바꾼 액션 스타",
            personality_match: "갑술일주의 곧은 신념. 자기 철학(절권도)을 만들 만큼 타협 없는 외길.",
            quote: "나는 만 가지 발차기를 연습한 사람보다 하나를 만 번 연습한 사람이 두렵다",
            wiki_link: "https://ko.wikipedia.org/wiki/이소룡"
        },
        {
            name: "앙겔라 메르켈",
            category: "정치인",
            birthdate: "1954-07-17",
            achievement: "독일 최초 여성 총리, 16년 재임",
            personality_match: "화려함 대신 신뢰로 16년을 버틴 갑술의 우직함. 큰 나무처럼 묵묵히 자리를 지켰다.",
            wiki_link: "https://ko.wikipedia.org/wiki/앙겔라_메르켈"
        }
    ],

    // 12. EUL_HAE (을해) - 유연함, 생존력, 온화함
    "EUL_HAE": [
        {
            name: "크리스티아누 호날두",
            category: "스포츠",
            birthdate: "1985-02-05",
            achievement: "발롱도르 5회 수상, 국가대표 역대 최다 득점자",
            personality_match: "큰물 위에 뜬 꽃처럼 어디서든 피어나는 을해의 생존력. 리그를 옮겨도 늘 정상.",
            wiki_link: "https://ko.wikipedia.org/wiki/크리스티아누_호날두"
        },
        {
            name: "문재인",
            category: "정치인",
            birthdate: "1953-01-24",
            achievement: "대한민국 제19대 대통령",
            personality_match: "부드러운 인상 속의 끈질긴 생명력. 을해일주 특유의 온화한 뚝심.",
            wiki_link: "https://ko.wikipedia.org/wiki/문재인"
        }
    ],

    // 13. BYEONG_JA (병자) - 밝음 속의 깊음, 감성, 직관
    "BYEONG_JA": [
        {
            name: "헤르만 헤세",
            category: "예술가",
            birthdate: "1877-07-02",
            achievement: "데미안, 싯다르타의 작가, 노벨 문학상 수상",
            personality_match: "태양이 깊은 물 위에 뜬 병자일주. 밝은 문장 아래 깊은 내면 탐구가 흐른다.",
            quote: "새는 알에서 나오려고 투쟁한다",
            wiki_link: "https://ko.wikipedia.org/wiki/헤르만_헤세"
        },
        {
            name: "청하",
            category: "연예인",
            birthdate: "1996-02-09",
            achievement: "아이오아이 출신 솔로 가수, 퍼포먼스 퀸",
            personality_match: "무대 위의 태양 같은 화려함과 무대 밖의 깊은 성실함. 병자의 두 얼굴이 매력.",
            wiki_link: "https://ko.wikipedia.org/wiki/청하_(가수)"
        }
    ],

    // 14. JEONG_CHUK (정축) - 성실함, 은근한 끈기, 헌신
    "JEONG_CHUK": [
        {
            name: "유재석",
            category: "연예인",
            birthdate: "1972-08-14",
            achievement: "국민 MC, 방송 3사 연예대상 최다 수상",
            personality_match: "정축일주의 성실함과 은근한 끈기로 무명 9년을 버텨 정상까지. 꾸준함이 재능을 이겼다.",
            wiki_link: "https://ko.wikipedia.org/wiki/유재석"
        },
        {
            name: "이효리",
            category: "연예인",
            birthdate: "1979-05-10",
            achievement: "핑클 출신 '국민 요정', K-pop 솔로 여가수 시대를 연 아이콘",
            personality_match: "화려해 보여도 본질은 은근하고 단단한 정축. 유행이 지나도 자기 페이스를 지킨다.",
            wiki_link: "https://ko.wikipedia.org/wiki/이효리"
        },
        {
            name: "지민",
            category: "연예인",
            birthdate: "1995-10-13",
            achievement: "BTS 멤버, 한국 솔로 최초 빌보드 핫100 1위 데뷔",
            personality_match: "연습벌레로 유명한 정축일주의 표본. 촛불처럼 조용히, 그러나 끝까지 타오른다.",
            wiki_link: "https://ko.wikipedia.org/wiki/지민_(가수)"
        }
    ],

    // 15. MU_IN (무인) - 개척 정신, 배포, 리더십
    "MU_IN": [
        {
            name: "공유",
            category: "연예인",
            birthdate: "1979-07-10",
            achievement: "도깨비, 부산행, 오징어 게임의 한류 배우",
            personality_match: "산 위의 호랑이 같은 무인일주. 묵직한 존재감으로 작품 전체를 끌고 가는 힘.",
            wiki_link: "https://ko.wikipedia.org/wiki/공유_(배우)"
        },
        {
            name: "노무현",
            category: "정치인",
            birthdate: "1946-09-01",
            achievement: "대한민국 제16대 대통령, 인권 변호사 출신",
            personality_match: "무인일주의 개척 정신. 학벌도 배경도 없이 원칙 하나로 정상까지 간 승부사.",
            quote: "사람 사는 세상",
            wiki_link: "https://ko.wikipedia.org/wiki/노무현"
        },
        {
            name: "마이클 잭슨",
            category: "연예인",
            birthdate: "1958-08-29",
            achievement: "'팝의 황제', 역대 최다 판매 앨범 스릴러",
            personality_match: "무대 위에선 산도 움직일 기세. 무인일주의 스케일과 개척 정신이 팝의 역사를 새로 썼다.",
            wiki_link: "https://ko.wikipedia.org/wiki/마이클_잭슨"
        }
    ],

    // 16. GI_MYO (기묘) - 감각, 유연함, 섬세한 계산
    "GI_MYO": [
        {
            name: "비",
            category: "연예인",
            birthdate: "1982-06-25",
            achievement: "'It's Raining'으로 아시아를 석권한 월드스타, 가수 겸 배우",
            personality_match: "기묘일주의 부드러운 땅 위에 돋는 새싹 같은 생명력. 오디션 12번 낙방에도 다시 일어섰다.",
            wiki_link: "https://ko.wikipedia.org/wiki/비_(가수)"
        },
        {
            name: "저우룬파",
            category: "연예인",
            birthdate: "1955-05-18",
            achievement: "영웅본색, 홍콩 느와르의 아이콘",
            personality_match: "화면 속 카리스마와 달리 실제론 소탈한 서민 배우. 기묘일주의 유연하고 겸손한 처세.",
            wiki_link: "https://ko.wikipedia.org/wiki/저우룬파"
        }
    ],

    // 17. GYEONG_JIN (경진) - 강철 의지, 큰 그릇, 대기만성
    "GYEONG_JIN": [
        {
            name: "이정재",
            category: "연예인",
            birthdate: "1972-12-15",
            achievement: "오징어 게임으로 에미상 남우주연상 수상",
            personality_match: "경진일주는 용을 품은 강철. 데뷔 30년 차에 세계 정상에 오른 대기만성의 정석.",
            wiki_link: "https://ko.wikipedia.org/wiki/이정재_(배우)"
        },
        {
            name: "임요환",
            category: "스포츠",
            birthdate: "1980-09-04",
            achievement: "'스타크래프트 황제', e스포츠라는 판을 개척한 1세대 프로게이머",
            personality_match: "없던 직업을 만들어낸 경진의 강철 의지. 연습량으로 황제가 된 노력형 승부사.",
            wiki_link: "https://ko.wikipedia.org/wiki/임요환"
        }
    ],

    // 18. SIN_SA (신사) - 예리한 재능, 프로 정신, 완벽 추구
    "SIN_SA": [
        {
            name: "전지현",
            category: "연예인",
            birthdate: "1981-10-30",
            achievement: "엽기적인 그녀, 별에서 온 그대의 한류 아이콘",
            personality_match: "신사일주는 불 속에서 제련된 보석. 화려함 뒤에 철저한 프로 정신이 있다.",
            wiki_link: "https://ko.wikipedia.org/wiki/전지현"
        },
        {
            name: "송강호",
            category: "연예인",
            birthdate: "1967-01-17",
            achievement: "기생충 주연, 칸 영화제 남우주연상 수상",
            personality_match: "신사일주의 예리한 감각. 대사 한 줄도 허투루 안 하는 디테일의 장인.",
            wiki_link: "https://ko.wikipedia.org/wiki/송강호"
        }
    ],

    // 19. IM_O (임오) - 자유, 열정, 스타성
    "IM_O": [
        {
            name: "프레디 머큐리",
            category: "연예인",
            birthdate: "1946-09-05",
            achievement: "퀸(Queen)의 보컬, 보헤미안 랩소디의 주인공",
            personality_match: "물과 불이 함께 있는 임오일주. 폭발적인 무대 장악력과 자유로운 영혼의 결정체.",
            quote: "The show must go on",
            wiki_link: "https://ko.wikipedia.org/wiki/프레디_머큐리"
        },
        {
            name: "백남준",
            category: "예술가",
            birthdate: "1932-07-20",
            achievement: "비디오 아트의 창시자",
            personality_match: "장르 자체를 새로 만든 임오의 자유분방함. 틀에 갇히는 걸 견디지 못하는 천마.",
            quote: "예술은 사기다",
            wiki_link: "https://ko.wikipedia.org/wiki/백남준"
        },
        {
            name: "장원영",
            category: "연예인",
            birthdate: "2004-08-31",
            achievement: "아이브(IVE) 센터, 4세대 K-pop 대표 아이콘",
            personality_match: "타고난 무대 체질에 스타성까지. 임오일주 특유의 반짝이는 인기운.",
            wiki_link: "https://ko.wikipedia.org/wiki/장원영"
        }
    ],

    // 20. GYE_MI (계미) - 온화함, 공감, 여림 속의 강함
    "GYE_MI": [
        {
            name: "박은빈",
            category: "연예인",
            birthdate: "1992-09-04",
            achievement: "이상한 변호사 우영우로 백상예술대상 대상 수상",
            personality_match: "계미일주의 맑은 감수성과 공감 능력. 여려 보여도 아역부터 25년을 버틴 강단.",
            wiki_link: "https://ko.wikipedia.org/wiki/박은빈"
        },
        {
            name: "메릴 스트립",
            category: "연예인",
            birthdate: "1949-06-22",
            achievement: "아카데미 3회 수상, 역대 최다 노미네이트 배우",
            personality_match: "빗물처럼 어떤 배역에도 스며드는 계미의 유연한 감성. 공감의 천재.",
            wiki_link: "https://en.wikipedia.org/wiki/Meryl_Streep"
        }
    ],

    // 21. GAP_SIN (갑신) - 도전, 변화, 개혁
    "GAP_SIN": [
        {
            name: "일론 머스크",
            category: "기업가",
            birthdate: "1971-06-28",
            achievement: "테슬라·스페이스X CEO, 혁신의 아이콘",
            personality_match: "바위 위에 뿌리내리는 나무처럼 역경 속에서 더 강해지는 갑신일주. 불가능에 도전하는 개혁가.",
            quote: "실패는 옵션이다",
            wiki_link: "https://en.wikipedia.org/wiki/Elon_Musk"
        },
        {
            name: "김대중",
            category: "정치인",
            birthdate: "1924-01-06",
            achievement: "대한민국 제15대 대통령, 한국 최초 노벨 평화상 수상",
            personality_match: "죽을 고비를 넘기며 더 단단해진 갑신의 생명력. 시련이 클수록 크게 자라는 나무.",
            quote: "행동하는 양심",
            wiki_link: "https://ko.wikipedia.org/wiki/김대중"
        },
        {
            name: "로제",
            category: "연예인",
            birthdate: "1997-02-11",
            achievement: "블랙핑크 멤버, APT.로 빌보드 글로벌 차트 1위",
            personality_match: "뉴질랜드에서 한국까지, 환경이 바뀔수록 강해지는 갑신의 적응력과 도전 정신.",
            wiki_link: "https://ko.wikipedia.org/wiki/로제_(가수)"
        }
    ],

    // 22. EUL_YU (을유) - 여린 듯 강단, 절제된 승부욕
    "EUL_YU": [
        {
            name: "손흥민",
            category: "스포츠",
            birthdate: "1992-07-08",
            achievement: "아시아 최초 프리미어리그 득점왕, 대한민국 대표팀 주장",
            personality_match: "부드러운 미소 뒤의 칼 같은 절제. 을유일주의 성실한 자기 관리가 월드클래스를 만들었다.",
            wiki_link: "https://ko.wikipedia.org/wiki/손흥민"
        },
        {
            name: "비욘세",
            category: "연예인",
            birthdate: "1981-09-04",
            achievement: "그래미 역대 최다 수상 아티스트",
            personality_match: "우아한 꽃이면서 동시에 칼을 품은 을유. 완벽한 무대 뒤엔 지독한 절제가 있다.",
            wiki_link: "https://en.wikipedia.org/wiki/Beyoncé"
        }
    ],

    // 23. BYEONG_SUL (병술) - 상상력, 표현력, 정 많음
    "BYEONG_SUL": [
        {
            name: "J.K. 롤링",
            category: "예술가",
            birthdate: "1965-07-31",
            achievement: "해리 포터 시리즈 작가, 역대 최고 판매 시리즈 기록",
            personality_match: "병술일주의 상상력은 산 위의 노을처럼 세상을 물들인다. 무명 시절을 버틴 뚝심은 덤.",
            wiki_link: "https://ko.wikipedia.org/wiki/J._K._롤링"
        },
        {
            name: "저스틴 비버",
            category: "연예인",
            birthdate: "1994-03-01",
            achievement: "유튜브에서 발굴된 글로벌 팝 스타",
            personality_match: "태양처럼 어디서든 눈에 띄는 병술의 표현력. 끼를 숨기지 못하는 타고난 엔터테이너.",
            wiki_link: "https://en.wikipedia.org/wiki/Justin_Bieber"
        }
    ],

    // 24. JEONG_HAE (정해) - 감성, 통찰, 예술혼
    "JEONG_HAE": [
        {
            name: "데이비드 보위",
            category: "연예인",
            birthdate: "1947-01-08",
            achievement: "글램 록의 선구자, 끊임없이 변신한 팝 아티스트",
            personality_match: "바다 위의 등불 같은 정해일주. 몽환적 감성과 깊은 통찰로 시대를 앞서갔다.",
            wiki_link: "https://en.wikipedia.org/wiki/David_Bowie"
        },
        {
            name: "이승만",
            category: "정치인",
            birthdate: "1875-03-26",
            achievement: "대한민국 초대 대통령, 독립운동가",
            personality_match: "넓은 바다 건너 세계를 읽은 정해의 통찰력. 촛불 하나로 어둠을 건넌 인생.",
            wiki_link: "https://ko.wikipedia.org/wiki/이승만"
        }
    ],

    // 25. MU_JA (무자) - 현실 감각, 재물운, 속 깊음
    "MU_JA": [
        {
            name: "박세리",
            category: "스포츠",
            birthdate: "1977-09-28",
            achievement: "US여자오픈 우승, '세리 키즈'를 낳은 골프 명예의 전당 멤버",
            personality_match: "무자일주의 우직한 현실 감각. 맨발 투혼으로 IMF 시대 국민에게 희망을 줬다.",
            wiki_link: "https://ko.wikipedia.org/wiki/박세리"
        },
        {
            name: "로버트 다우니 주니어",
            category: "연예인",
            birthdate: "1965-04-04",
            achievement: "아이언맨으로 재기해 할리우드 최고 몸값 배우가 됨",
            personality_match: "바닥까지 갔다가 다시 정상으로. 무자일주의 속 깊은 저력과 현실 감각의 승리.",
            wiki_link: "https://en.wikipedia.org/wiki/Robert_Downey_Jr."
        },
        {
            name: "김혜수",
            category: "연예인",
            birthdate: "1970-09-05",
            achievement: "타짜, 시그널 등에서 활약한 충무로 대표 배우",
            personality_match: "화려함 속에 감춘 단단한 현실 감각. 40년 가까이 정상을 지킨 무자의 저력.",
            wiki_link: "https://ko.wikipedia.org/wiki/김혜수"
        }
    ],

    // 26. GI_CHUK (기축) - 인내, 우직함, 묵묵한 몰입
    "GI_CHUK": [
        {
            name: "이세돌",
            category: "스포츠",
            birthdate: "1983-03-02",
            achievement: "바둑 9단, 알파고를 이긴 유일한 인간",
            personality_match: "기축일주의 묵묵한 몰입. 반집 승부의 세계에서 수십 년을 버틴 인내의 화신.",
            wiki_link: "https://ko.wikipedia.org/wiki/이세돌"
        },
        {
            name: "지그문트 프로이트",
            category: "학자",
            birthdate: "1856-05-06",
            achievement: "정신분석학의 창시자",
            personality_match: "무의식이라는 어두운 땅을 평생 파고든 기축의 우직함. 밭을 갈듯 인간 내면을 갈았다.",
            wiki_link: "https://ko.wikipedia.org/wiki/지그문트_프로이트"
        },
        {
            name: "슈가",
            category: "연예인",
            birthdate: "1993-03-09",
            achievement: "BTS 래퍼 겸 프로듀서, 솔로 Agust D로도 활약",
            personality_match: "말수는 적어도 작업실에선 누구보다 오래 버티는 기축의 몰입력. 조용한 노력파.",
            wiki_link: "https://ko.wikipedia.org/wiki/슈가_(래퍼)"
        }
    ],

    // 27. GYEONG_IN (경인) - 행동력, 정면돌파, 의리
    "GYEONG_IN": [
        {
            name: "박태환",
            category: "스포츠",
            birthdate: "1989-09-27",
            achievement: "한국 최초 수영 올림픽 금메달리스트",
            personality_match: "경인일주의 정면돌파. 아시아인은 안 된다던 자유형에서 세계 최정상을 찍었다.",
            wiki_link: "https://ko.wikipedia.org/wiki/박태환"
        },
        {
            name: "어니스트 헤밍웨이",
            category: "예술가",
            birthdate: "1899-07-21",
            achievement: "노인과 바다의 작가, 노벨 문학상 수상",
            personality_match: "전쟁터와 바다를 직접 부딪친 행동파 작가. 경인의 강철 같은 문장과 승부 근성.",
            quote: "인간은 파괴될지언정 패배하지 않는다",
            wiki_link: "https://ko.wikipedia.org/wiki/어니스트_헤밍웨이"
        }
    ],

    // 28. SIN_MYO (신묘) - 예리함과 섬세함, 장인 기질
    "SIN_MYO": [
        {
            name: "마이클 조던",
            category: "스포츠",
            birthdate: "1963-02-17",
            achievement: "NBA 6회 우승, '농구 황제'",
            personality_match: "신묘일주의 정교한 칼끝 같은 기술. 디테일을 갈고닦아 신의 경지에 오른 장인.",
            quote: "나는 실패를 받아들일 수 있다. 그러나 시도하지 않는 것은 받아들일 수 없다",
            wiki_link: "https://ko.wikipedia.org/wiki/마이클_조던"
        },
        {
            name: "젠슨 황",
            category: "기업가",
            birthdate: "1963-02-17",
            achievement: "엔비디아 창업자, AI 반도체 시대를 연 CEO",
            personality_match: "마이클 조던과 생년월일까지 같은 신묘일주. 30년 한 우물로 세계 1위 기업을 만든 장인 정신.",
            wiki_link: "https://en.wikipedia.org/wiki/Jensen_Huang"
        },
        {
            name: "마리 퀴리",
            category: "학자",
            birthdate: "1867-11-07",
            achievement: "노벨상 2회 수상(물리학·화학), 라듐 발견",
            personality_match: "실험실에서 평생을 갈아 넣은 신묘의 집요한 섬세함. 보이지 않는 것을 캐낸 세공사.",
            wiki_link: "https://ko.wikipedia.org/wiki/마리_퀴리"
        }
    ],

    // 29. IM_JIN (임진) - 스케일, 야망, 상상력
    "IM_JIN": [
        {
            name: "봉준호",
            category: "예술가",
            birthdate: "1969-09-14",
            achievement: "기생충 감독, 아카데미 4관왕",
            personality_match: "용이 큰물을 만난 임진일주. 장르를 넘나드는 스케일과 디테일을 겸비한 거장.",
            wiki_link: "https://ko.wikipedia.org/wiki/봉준호"
        },
        {
            name: "오타니 쇼헤이",
            category: "스포츠",
            birthdate: "1994-07-05",
            achievement: "투타 겸업으로 MLB MVP 3회 수상",
            personality_match: "투수와 타자를 다 하겠다는 발상 자체가 임진의 스케일. 상식을 깨는 야망의 용.",
            wiki_link: "https://ko.wikipedia.org/wiki/오타니_쇼헤이"
        },
        {
            name: "파블로 피카소",
            category: "예술가",
            birthdate: "1881-10-25",
            achievement: "입체파의 창시자, 20세기 미술의 상징",
            personality_match: "그림의 문법 자체를 바꾼 임진의 거대한 상상력. 평생 스타일을 바꾸며 물처럼 흘렀다.",
            wiki_link: "https://ko.wikipedia.org/wiki/파블로_피카소"
        }
    ],

    // 30. GYE_SA (계사) - 지략, 치밀함, 빠른 눈치
    "GYE_SA": [
        {
            name: "이병헌",
            category: "연예인",
            birthdate: "1970-07-12",
            achievement: "내부자들, 오징어 게임, 할리우드까지 진출한 배우",
            personality_match: "계사일주의 치밀한 계산과 유연함. 눈빛 하나까지 설계하는 지략형 배우.",
            wiki_link: "https://ko.wikipedia.org/wiki/이병헌"
        },
        {
            name: "팀 쿡",
            category: "기업가",
            birthdate: "1960-11-01",
            achievement: "애플 CEO, 잡스 이후 애플을 세계 시가총액 1위로",
            personality_match: "화려한 창업자 뒤의 치밀한 운영 천재. 계사의 물샐틈없는 관리 능력.",
            wiki_link: "https://en.wikipedia.org/wiki/Tim_Cook"
        }
    ],

    // 31. GAP_O (갑오) - 밝은 추진력, 표현력, 인기
    "GAP_O": [
        {
            name: "손예진",
            category: "연예인",
            birthdate: "1982-01-11",
            achievement: "사랑의 불시착, 멜로 퀸에서 국민 배우로",
            personality_match: "말 위에 탄 나무처럼 시원시원한 갑오일주. 청순과 카리스마를 오가는 표현력.",
            wiki_link: "https://ko.wikipedia.org/wiki/손예진"
        },
        {
            name: "니콜라 테슬라",
            category: "학자",
            birthdate: "1856-07-10",
            achievement: "교류 전기 시스템 개발, 시대를 앞선 발명가",
            personality_match: "번뜩이는 아이디어를 세상에 내달리게 한 갑오의 추진력. 시대보다 100년 빨랐다.",
            wiki_link: "https://ko.wikipedia.org/wiki/니콜라_테슬라"
        }
    ],

    // 32. EUL_MI (을미) - 부드러운 고집, 생활력, 인내
    "EUL_MI": [
        {
            name: "안철수",
            category: "기업가",
            birthdate: "1962-02-26",
            achievement: "안랩 창업자, 의사에서 IT·정치까지",
            personality_match: "을미일주의 부드러운 고집. 조용해 보여도 결심하면 인생 항로를 통째로 바꾼다.",
            wiki_link: "https://ko.wikipedia.org/wiki/안철수"
        },
        {
            name: "브래드 피트",
            category: "연예인",
            birthdate: "1963-12-18",
            achievement: "아카데미 남우조연상 수상, 할리우드 대표 배우",
            personality_match: "메마른 땅에서도 피어나는 을미의 생활력. 미남 배우 꼬리표를 연기력으로 지웠다.",
            wiki_link: "https://en.wikipedia.org/wiki/Brad_Pitt"
        }
    ],

    // 33. BYEONG_SIN (병신) - 아이디어, 재치, 다재다능
    "BYEONG_SIN": [
        {
            name: "알베르트 아인슈타인",
            category: "학자",
            birthdate: "1879-03-14",
            achievement: "상대성이론 발표, 노벨 물리학상 수상",
            personality_match: "병신일주의 번뜩이는 직관. 태양처럼 멀리 비추는 상상력이 물리학을 뒤집었다.",
            quote: "상상력은 지식보다 중요하다",
            wiki_link: "https://ko.wikipedia.org/wiki/알베르트_아인슈타인"
        },
        {
            name: "강동원",
            category: "연예인",
            birthdate: "1981-01-18",
            achievement: "늑대의 유혹, 검은 사제들의 배우",
            personality_match: "모델, 배우, 장르물까지 어디로 튈지 모르는 병신의 다재다능과 역마 기질.",
            wiki_link: "https://ko.wikipedia.org/wiki/강동원"
        },
        {
            name: "빈센트 반 고흐",
            category: "예술가",
            birthdate: "1853-03-30",
            achievement: "별이 빛나는 밤 등을 남긴 후기 인상파 화가",
            personality_match: "태양의 열정이 캔버스 위에서 소용돌이친 병신일주. 시대가 못 알아본 천재의 불꽃.",
            wiki_link: "https://ko.wikipedia.org/wiki/빈센트_반_고흐"
        }
    ],

    // 34. JEONG_YU (정유) - 섬세한 빛, 무대 체질, 예술 감각
    "JEONG_YU": [
        {
            name: "아이유",
            category: "연예인",
            birthdate: "1993-05-16",
            achievement: "싱어송라이터 겸 배우, 국민 가수",
            personality_match: "정유일주는 보석을 비추는 촛불. 섬세한 감성과 무대 위의 반짝임을 타고났다.",
            wiki_link: "https://ko.wikipedia.org/wiki/아이유"
        },
        {
            name: "우사인 볼트",
            category: "스포츠",
            birthdate: "1986-08-21",
            achievement: "100m 세계기록 9.58초, 올림픽 단거리 8관왕",
            personality_match: "결승선 앞에서도 여유를 부리는 타고난 쇼맨십. 정유의 무대 체질은 트랙 위에서도 통한다.",
            wiki_link: "https://ko.wikipedia.org/wiki/우사인_볼트"
        }
    ],

    // 35. MU_SUL (무술) - 묵직한 존재감, 원칙, 신의
    "MU_SUL": [
        {
            name: "박찬욱",
            category: "예술가",
            birthdate: "1963-08-23",
            achievement: "올드보이로 칸 심사위원대상, 헤어질 결심으로 칸 감독상",
            personality_match: "무술일주의 묵직한 미학. 유행에 흔들리지 않고 자기 스타일을 산처럼 쌓아 올렸다.",
            wiki_link: "https://ko.wikipedia.org/wiki/박찬욱"
        },
        {
            name: "르브론 제임스",
            category: "스포츠",
            birthdate: "1984-12-30",
            achievement: "NBA 통산 최다 득점 기록 보유자",
            personality_match: "20년 넘게 정상을 지키는 무술의 지구력과 자기 원칙. 몸 관리부터 산처럼 철저하다.",
            wiki_link: "https://ko.wikipedia.org/wiki/르브론_제임스"
        }
    ],

    // 36. GI_HAE (기해) - 포용력, 상상력, 유연한 확장
    "GI_HAE": [
        {
            name: "이정후",
            category: "스포츠",
            birthdate: "1998-08-20",
            achievement: "KBO MVP 출신 메이저리거, '바람의 손자'",
            personality_match: "기해일주의 부드러운 유연함. 힘이 아닌 감각으로 치는 천재 타자의 물 흐르는 스윙.",
            wiki_link: "https://ko.wikipedia.org/wiki/이정후"
        },
        {
            name: "펠레",
            category: "스포츠",
            birthdate: "1940-10-23",
            achievement: "월드컵 3회 우승의 '축구 황제'",
            personality_match: "바다처럼 넓은 시야와 포용력. 기해일주의 축복받은 확장운이 축구 역사를 만들었다.",
            wiki_link: "https://ko.wikipedia.org/wiki/펠레"
        }
    ],

    // 37. GYEONG_JA (경자) - 명석함, 예리한 언변, 집중력
    "GYEONG_JA": [
        {
            name: "팀 버너스리",
            category: "학자",
            birthdate: "1955-06-08",
            achievement: "월드와이드웹(WWW)의 발명자",
            personality_match: "경자일주의 차갑고 명석한 두뇌. 세상을 연결하는 시스템을 혼자 설계했다.",
            wiki_link: "https://ko.wikipedia.org/wiki/팀_버너스리"
        },
        {
            name: "태민",
            category: "연예인",
            birthdate: "1993-07-18",
            achievement: "샤이니 멤버, K-pop 퍼포먼스의 교과서",
            personality_match: "칼처럼 정확한 춤선은 경자의 집중력에서 나온다. 물속의 칼 같은 절제된 예리함.",
            wiki_link: "https://ko.wikipedia.org/wiki/태민"
        }
    ],

    // 38. SIN_CHUK (신축) - 묵묵한 단련, 인내, 완성
    "SIN_CHUK": [
        {
            name: "김수현",
            category: "연예인",
            birthdate: "1988-02-16",
            achievement: "별에서 온 그대, 눈물의 여왕의 톱스타",
            personality_match: "신축일주는 흙 속에서 갈리는 보석. 조용한 성격에 완벽주의 연기 수련이 더해졌다.",
            wiki_link: "https://ko.wikipedia.org/wiki/김수현_(1988년)"
        },
        {
            name: "RM",
            category: "연예인",
            birthdate: "1994-09-12",
            achievement: "BTS 리더, UN 연설로 세계에 메시지를 던진 아티스트",
            personality_match: "신축의 묵묵한 자기 단련. 독학 영어로 UN 연단까지, 갈고닦아 완성되는 보석.",
            wiki_link: "https://ko.wikipedia.org/wiki/RM_(래퍼)"
        },
        {
            name: "킬리안 음바페",
            category: "스포츠",
            birthdate: "1998-12-20",
            achievement: "19세에 월드컵 우승, 프랑스 축구의 아이콘",
            personality_match: "어린 나이에도 흔들리지 않는 신축의 단단함. 재능 위에 단련을 쌓는 타입.",
            wiki_link: "https://ko.wikipedia.org/wiki/킬리안_음바페"
        }
    ],

    // 39. IM_IN (임인) - 지혜와 모험심, 스케일
    "IM_IN": [
        {
            name: "폴 매카트니",
            category: "연예인",
            birthdate: "1942-06-18",
            achievement: "비틀즈 멤버, 대중음악 역사상 가장 성공한 작곡가",
            personality_match: "큰물을 만난 호랑이처럼 거침없는 임인일주. 지혜와 모험심으로 팝의 바다를 넓혔다.",
            wiki_link: "https://ko.wikipedia.org/wiki/폴_매카트니"
        },
        {
            name: "톰 크루즈",
            category: "연예인",
            birthdate: "1962-07-03",
            achievement: "미션 임파서블 시리즈, 스턴트를 직접 소화하는 액션 스타",
            personality_match: "환갑에도 비행기에 매달리는 임인의 모험심. 스케일이 남다른 행동파.",
            wiki_link: "https://en.wikipedia.org/wiki/Tom_Cruise"
        }
    ],

    // 40. GYE_MYO (계묘) - 감성, 창작, 부드러운 직관
    "GYE_MYO": [
        {
            name: "엘튼 존",
            category: "연예인",
            birthdate: "1947-03-25",
            achievement: "3억 장 이상 음반을 판 싱어송라이터",
            personality_match: "봄비가 새싹을 틔우듯 멜로디를 길러내는 계묘의 감성. 부드러움이 최고의 무기.",
            wiki_link: "https://en.wikipedia.org/wiki/Elton_John"
        },
        {
            name: "스티븐 킹",
            category: "예술가",
            birthdate: "1947-09-21",
            achievement: "쇼생크 탈출, 미저리 등 원작의 '공포의 제왕'",
            personality_match: "계묘일주의 여린 감수성이 상상력으로 폭발한 케이스. 매일 쓰는 성실한 창작자.",
            wiki_link: "https://ko.wikipedia.org/wiki/스티븐_킹"
        }
    ],

    // 41. GAP_JIN (갑진) - 큰 뜻, 성장, 리더
    "GAP_JIN": [
        {
            name: "송혜교",
            category: "연예인",
            birthdate: "1981-11-22",
            achievement: "태양의 후예, 더 글로리의 한류 스타",
            personality_match: "갑진일주는 용의 등에 올라탄 큰 나무. 우아함 속에 스케일 큰 성장 욕심이 있다.",
            wiki_link: "https://ko.wikipedia.org/wiki/송혜교"
        },
        {
            name: "리오넬 메시",
            category: "스포츠",
            birthdate: "1987-06-24",
            achievement: "발롱도르 8회 수상, 월드컵 우승",
            personality_match: "성장호르몬 장애를 딛고 세계 최고가 된 갑진의 성장 서사. 큰 뜻은 몸집을 가리지 않는다.",
            wiki_link: "https://ko.wikipedia.org/wiki/리오넬_메시"
        },
        {
            name: "이상혁 (페이커)",
            category: "스포츠",
            birthdate: "1996-05-07",
            achievement: "리그 오브 레전드 월드 챔피언십 5회 우승, e스포츠의 살아있는 전설",
            personality_match: "갑진일주의 꾸준한 성장과 자기 절제. 10년 넘게 정상에서 군림하는 '불사대마왕'.",
            wiki_link: "https://ko.wikipedia.org/wiki/페이커"
        }
    ],

    // 42. EUL_SA (을사) - 감각, 화려함, 영리한 처세
    "EUL_SA": [
        {
            name: "지드래곤",
            category: "연예인",
            birthdate: "1988-08-18",
            achievement: "빅뱅 리더, K-pop 패션·음악 트렌드의 아이콘",
            personality_match: "을사일주의 화려한 감각. 부드러운 덩굴처럼 유연하게 트렌드 꼭대기를 감아 올라간다.",
            wiki_link: "https://ko.wikipedia.org/wiki/지드래곤"
        },
        {
            name: "박서준",
            category: "연예인",
            birthdate: "1988-12-16",
            achievement: "이태원 클라쓰, 김비서가 왜 그럴까의 배우",
            personality_match: "로코부터 액션까지 영리하게 갈아타는 을사의 처세 감각. 매력의 결이 다양하다.",
            wiki_link: "https://ko.wikipedia.org/wiki/박서준"
        }
    ],

    // 43. BYEONG_O (병오) - 폭발적 에너지, 스타성
    "BYEONG_O": [
        {
            name: "정국",
            category: "연예인",
            birthdate: "1997-09-01",
            achievement: "BTS 막내, 솔로곡 Seven으로 빌보드 핫100 1위",
            personality_match: "병오일주는 한낮의 태양. 노래·춤·운동까지 다 되는 '황금 막내'의 폭발적 에너지.",
            wiki_link: "https://ko.wikipedia.org/wiki/정국_(가수)"
        },
        {
            name: "유발 하라리",
            category: "학자",
            birthdate: "1976-02-24",
            achievement: "사피엔스의 저자, 세계적 역사학자",
            personality_match: "인류사 전체를 한 권으로 태워버린 병오의 화력. 뜨거운 통찰이 세계를 사로잡았다.",
            wiki_link: "https://ko.wikipedia.org/wiki/유발_하라리"
        }
    ],

    // 44. JEONG_MI (정미) - 따뜻한 열정, 은근한 뒷심
    "JEONG_MI": [
        {
            name: "테일러 스위프트",
            category: "연예인",
            birthdate: "1989-12-13",
            achievement: "그래미 올해의 앨범 4회 수상, 역사상 가장 성공한 투어",
            personality_match: "정미일주의 은근하고 꾸준한 화력. 컨트리 소녀에서 팝의 제왕까지 쉼 없이 타올랐다.",
            wiki_link: "https://ko.wikipedia.org/wiki/테일러_스위프트"
        },
        {
            name: "김종국",
            category: "연예인",
            birthdate: "1976-04-25",
            achievement: "터보 출신 가수, 런닝맨의 '능력자'",
            personality_match: "매일 헬스장 가는 그 꾸준함이 바로 정미의 뒷심. 은근한 불은 절대 안 꺼진다.",
            wiki_link: "https://ko.wikipedia.org/wiki/김종국_(가수)"
        }
    ],

    // 45. MU_SIN (무신) - 실용성, 다재다능, 활동력
    "MU_SIN": [
        {
            name: "마크 저커버그",
            category: "기업가",
            birthdate: "1984-05-14",
            achievement: "페이스북(메타) 창업자",
            personality_match: "무신일주의 실용주의. 기숙사 아이디어를 세계 최대 플랫폼으로 만든 실행력.",
            wiki_link: "https://ko.wikipedia.org/wiki/마크_저커버그"
        },
        {
            name: "이병철",
            category: "기업가",
            birthdate: "1910-02-12",
            achievement: "삼성그룹 창업주",
            personality_match: "설탕에서 반도체까지, 무신의 다재다능한 사업 감각. 산 아래 바위처럼 판단이 단단했다.",
            quote: "인재제일",
            wiki_link: "https://ko.wikipedia.org/wiki/이병철"
        },
        {
            name: "제시카",
            category: "연예인",
            birthdate: "1989-04-18",
            achievement: "소녀시대 출신, 패션 브랜드를 이끄는 가수 겸 사업가",
            personality_match: "가수에서 디자이너·사업가로 변신한 무신의 활동력. 한 우물만 파지 않는 팔방미인.",
            wiki_link: "https://ko.wikipedia.org/wiki/제시카_(1989년)"
        }
    ],

    // 46. GI_YU (기유) - 깔끔함, 디테일, 미적 감각
    "GI_YU": [
        {
            name: "오드리 헵번",
            category: "연예인",
            birthdate: "1929-05-04",
            achievement: "로마의 휴일 주연, 은퇴 후 유니세프 친선대사로 헌신",
            personality_match: "기유일주의 정갈한 우아함. 화려함보다 절제된 아름다움으로 시대의 아이콘이 됐다.",
            wiki_link: "https://ko.wikipedia.org/wiki/오드리_헵번"
        },
        {
            name: "저스틴 팀버레이크",
            category: "연예인",
            birthdate: "1981-01-31",
            achievement: "엔싱크 출신 솔로 팝스타, 그래미 10회 수상",
            personality_match: "노래·춤·연기를 깔끔하게 다 해내는 기유의 미적 감각. 완성도에 집착하는 타입.",
            wiki_link: "https://en.wikipedia.org/wiki/Justin_Timberlake"
        }
    ],

    // 47. GYEONG_SUL (경술) - 책임감, 수호자, 강직함
    "GYEONG_SUL": [
        {
            name: "엠마 왓슨",
            category: "연예인",
            birthdate: "1990-04-15",
            achievement: "해리 포터 헤르미온느 역, UN 여성 인권 캠페인 주도",
            personality_match: "경술일주의 강직한 책임감. 배우를 넘어 신념을 지키는 수호자 역할을 자처했다.",
            wiki_link: "https://ko.wikipedia.org/wiki/엠마_왓슨"
        },
        {
            name: "타이거 우즈",
            category: "스포츠",
            birthdate: "1975-12-30",
            achievement: "메이저 15승, 골프 역사상 최고의 선수",
            personality_match: "부상과 추락을 강철 의지로 돌파한 경술의 근성. 무너져도 다시 지키러 돌아온다.",
            wiki_link: "https://ko.wikipedia.org/wiki/타이거_우즈"
        }
    ],

    // 48. SIN_HAE (신해) - 지적 세련미, 예술적 직관
    "SIN_HAE": [
        {
            name: "한강",
            category: "예술가",
            birthdate: "1970-11-27",
            achievement: "한국 최초 노벨 문학상 수상 작가",
            personality_match: "신해일주는 바다에 잠긴 보석. 차갑도록 세공된 문장에 깊은 직관이 흐른다.",
            wiki_link: "https://ko.wikipedia.org/wiki/한강_(작가)"
        },
        {
            name: "현빈",
            category: "연예인",
            birthdate: "1982-09-25",
            achievement: "시크릿 가든, 사랑의 불시착의 한류 스타",
            personality_match: "신해의 서늘하고 세련된 분위기. 절제된 연기 속 깊은 감정선이 무기.",
            wiki_link: "https://ko.wikipedia.org/wiki/현빈"
        },
        {
            name: "크리스토퍼 놀란",
            category: "예술가",
            birthdate: "1970-07-30",
            achievement: "인셉션, 오펜하이머로 아카데미 감독상 수상",
            personality_match: "시간과 꿈을 세공하는 신해의 지적 직관. 차가운 논리와 예술성이 공존한다.",
            wiki_link: "https://ko.wikipedia.org/wiki/크리스토퍼_놀런"
        }
    ],

    // 49. IM_JA (임자) - 큰물, 지혜, 흐름을 읽는 눈
    "IM_JA": [
        {
            name: "워렌 버핏",
            category: "기업가",
            birthdate: "1930-08-30",
            achievement: "'투자의 신', 버크셔 해서웨이 회장",
            personality_match: "임자일주는 바다 그 자체. 시장의 큰 흐름을 읽는 지혜와 기다림의 미학.",
            quote: "룰 1: 절대 돈을 잃지 마라",
            wiki_link: "https://en.wikipedia.org/wiki/Warren_Buffett"
        },
        {
            name: "제니",
            category: "연예인",
            birthdate: "1996-01-16",
            achievement: "블랙핑크 멤버, 샤넬 앰배서더로 글로벌 패션 아이콘",
            personality_match: "임자의 도도한 큰물 기운. 무대·패션·솔로까지 흐름을 타며 판을 키운다.",
            wiki_link: "https://ko.wikipedia.org/wiki/제니_(1996년)"
        }
    ],

    // 50. GYE_CHUK (계축) - 조용한 집념, 인내
    "GYE_CHUK": [
        {
            name: "미야자키 하야오",
            category: "예술가",
            birthdate: "1941-01-05",
            achievement: "센과 치히로의 행방불명, 스튜디오 지브리의 거장",
            personality_match: "계축일주의 소 같은 집념. 은퇴 선언을 번복하며 평생 한 컷 한 컷 손으로 그렸다.",
            wiki_link: "https://ko.wikipedia.org/wiki/미야자키_하야오"
        },
        {
            name: "이강인",
            category: "스포츠",
            birthdate: "2001-02-19",
            achievement: "파리 생제르맹 미드필더, 한국 축구의 미래",
            personality_match: "10살에 홀로 스페인으로 떠난 계축의 조용한 독기. 겉은 순해도 속은 승부사.",
            wiki_link: "https://ko.wikipedia.org/wiki/이강인"
        }
    ],

    // 51. GAP_IN (갑인) - 곧은 소나무, 뚝심, 자존심
    "GAP_IN": [
        {
            name: "키아누 리브스",
            category: "연예인",
            birthdate: "1964-09-02",
            achievement: "매트릭스, 존 윅 시리즈의 할리우드 스타",
            personality_match: "갑인일주는 숲의 제왕 소나무. 화려한 명성에도 소탈함을 지키는 곧은 심지.",
            wiki_link: "https://en.wikipedia.org/wiki/Keanu_Reeves"
        },
        {
            name: "조성진",
            category: "예술가",
            birthdate: "1994-05-28",
            achievement: "한국인 최초 쇼팽 국제 콩쿠르 우승 피아니스트",
            personality_match: "타협 없는 연습으로 세계 정상에 오른 갑인의 자존심. 크고 곧게 자라는 나무.",
            wiki_link: "https://ko.wikipedia.org/wiki/조성진_(피아니스트)"
        }
    ],

    // 52. EUL_MYO (을묘) - 유연한 생명력, 부드러운 카리스마
    "EUL_MYO": [
        {
            name: "손정의",
            category: "기업가",
            birthdate: "1957-08-11",
            achievement: "소프트뱅크 창업자, 세계적 투자가",
            personality_match: "을묘일주는 밟혀도 다시 자라는 풀. 파산 위기를 몇 번이나 넘긴 유연한 생명력.",
            quote: "뜻을 높게 세워라",
            wiki_link: "https://ko.wikipedia.org/wiki/손_마사요시"
        },
        {
            name: "빌리 아일리시",
            category: "연예인",
            birthdate: "2001-12-18",
            achievement: "그래미 주요 4개 부문 석권한 최연소 아티스트",
            personality_match: "속삭이듯 부드러운데 존재감은 압도적. 을묘의 조용한 카리스마 그 자체.",
            wiki_link: "https://en.wikipedia.org/wiki/Billie_Eilish"
        }
    ],

    // 53. BYEONG_JIN (병진) - 스케일, 표현력, 야망
    "BYEONG_JIN": [
        {
            name: "스티브 잡스",
            category: "기업가",
            birthdate: "1955-02-24",
            achievement: "애플 창업자, 아이폰으로 세상을 바꾼 혁신가",
            personality_match: "용 위에 뜬 태양, 병진일주. 세상을 바꾸겠다는 야망과 프레젠테이션의 화력.",
            quote: "Stay hungry, stay foolish",
            wiki_link: "https://ko.wikipedia.org/wiki/스티브_잡스"
        },
        {
            name: "김구라",
            category: "연예인",
            birthdate: "1970-10-03",
            achievement: "라디오 스타 등 독설 캐릭터로 예능 한 축을 만든 MC",
            personality_match: "병진일주의 거침없는 표현력. 할 말은 하고 마는 태양의 직설 화법.",
            wiki_link: "https://ko.wikipedia.org/wiki/김구라"
        },
        {
            name: "레오나르도 디카프리오",
            category: "연예인",
            birthdate: "1974-11-11",
            achievement: "타이타닉, 레버넌트로 아카데미 남우주연상 수상",
            personality_match: "스크린을 가득 채우는 병진의 존재감. 연기도 환경운동도 스케일이 크다.",
            wiki_link: "https://ko.wikipedia.org/wiki/리어나도_디캐프리오"
        }
    ],

    // 54. JEONG_SA (정사) - 은근한 카리스마, 집중된 열정
    "JEONG_SA": [
        {
            name: "임영웅",
            category: "연예인",
            birthdate: "1991-06-16",
            achievement: "미스터트롯 진(眞), 전 세대를 사로잡은 가수",
            personality_match: "정사일주의 은근하고 따뜻한 화력. 조용히 시작해 무대 전체를 데우는 사람.",
            wiki_link: "https://ko.wikipedia.org/wiki/임영웅"
        },
        {
            name: "월트 디즈니",
            category: "기업가",
            birthdate: "1901-12-05",
            achievement: "디즈니 창업자, 미키마우스와 애니메이션 제국의 아버지",
            personality_match: "촛불 하나로 왕국을 세운 정사의 집중된 열정. 상상이 현실이 될 때까지 태운다.",
            quote: "꿈꿀 수 있다면 이룰 수 있다",
            wiki_link: "https://ko.wikipedia.org/wiki/월트_디즈니"
        },
        {
            name: "코비 브라이언트",
            category: "스포츠",
            birthdate: "1978-08-23",
            achievement: "NBA 5회 우승, '맘바 멘탈리티'의 상징",
            personality_match: "새벽 4시 훈련으로 유명한 정사의 조용한 독기. 불꽃은 화려함보다 지속력이다.",
            wiki_link: "https://ko.wikipedia.org/wiki/코비_브라이언트"
        }
    ],

    // 55. MU_O (무오) - 뜨거운 심지, 에너지, 승부욕
    "MU_O": [
        {
            name: "로저 페더러",
            category: "스포츠",
            birthdate: "1981-08-08",
            achievement: "그랜드슬램 20회 우승의 테니스 레전드",
            personality_match: "무오일주는 불을 품은 산. 우아해 보여도 코트 위 승부욕은 화산급이었다.",
            wiki_link: "https://ko.wikipedia.org/wiki/로저_페더러"
        },
        {
            name: "에드 시런",
            category: "연예인",
            birthdate: "1991-02-17",
            achievement: "Shape of You 등 스트리밍 역대 최고 기록의 싱어송라이터",
            personality_match: "기타 하나로 스타디움을 채우는 무오의 심지. 겉은 수수해도 에너지는 뜨겁다.",
            wiki_link: "https://en.wikipedia.org/wiki/Ed_Sheeran"
        }
    ],

    // 56. GI_MI (기미) - 신중함, 원칙, 내실
    "GI_MI": [
        {
            name: "에이브러햄 링컨",
            category: "정치인",
            birthdate: "1809-02-12",
            achievement: "미국 제16대 대통령, 노예 해방 선언",
            personality_match: "기미일주의 신중한 원칙주의. 느려 보여도 한번 정한 길은 끝까지 간다.",
            wiki_link: "https://ko.wikipedia.org/wiki/에이브러햄_링컨"
        },
        {
            name: "찰스 다윈",
            category: "학자",
            birthdate: "1809-02-12",
            achievement: "종의 기원 저술, 진화론의 아버지",
            personality_match: "링컨과 같은 날 태어난 기미일주. 20년 넘게 증거를 쌓은 뒤에야 발표한 신중함의 끝판왕.",
            wiki_link: "https://ko.wikipedia.org/wiki/찰스_다윈"
        },
        {
            name: "김태리",
            category: "연예인",
            birthdate: "1990-04-24",
            achievement: "아가씨, 미스터 션샤인, 악귀의 배우",
            personality_match: "작품을 고르는 신중한 눈과 단단한 내공. 기미의 내실이 필모그래피에 그대로 보인다.",
            wiki_link: "https://ko.wikipedia.org/wiki/김태리"
        }
    ],

    // 57. GYEONG_SIN (경신) - 강철 결단력, 실행, 총명함
    "GYEONG_SIN": [
        {
            name: "정주영",
            category: "기업가",
            birthdate: "1915-11-25",
            achievement: "현대그룹 창업주, 한강의 기적 주역",
            personality_match: "경신일주는 두 번 담금질한 강철. 맨손으로 조선소를 지어낸 결단력과 실행력.",
            quote: "이봐, 해봤어?",
            wiki_link: "https://ko.wikipedia.org/wiki/정주영"
        },
        {
            name: "박정희",
            category: "정치인",
            birthdate: "1917-11-14",
            achievement: "제5~9대 대통령, 경제개발 5개년 계획 주도",
            personality_match: "경신일주의 강력한 결단과 추진. 타협 없는 강철 스타일로 산업화 시대를 끌었다.",
            wiki_link: "https://ko.wikipedia.org/wiki/박정희"
        },
        {
            name: "제프 베이조스",
            category: "기업가",
            birthdate: "1964-01-12",
            achievement: "아마존 창업자, 세계 최대 전자상거래 제국 건설",
            personality_match: "안정된 직장을 버리고 차고에서 창업한 경신의 결단력. 한번 벼리면 끝까지 밀어붙인다.",
            wiki_link: "https://ko.wikipedia.org/wiki/제프_베이조스"
        }
    ],

    // 58. SIN_YU (신유) - 예리한 보석, 완벽주의, 미학
    "SIN_YU": [
        {
            name: "스티븐 호킹",
            category: "학자",
            birthdate: "1942-01-08",
            achievement: "블랙홀 이론의 물리학자, 시간의 역사 저자",
            personality_match: "신유일주는 순도 100%의 보석. 몸이 멈춰도 정신의 예리함은 우주 끝까지 갔다.",
            quote: "고개를 들어 별을 보라",
            wiki_link: "https://ko.wikipedia.org/wiki/스티븐_호킹"
        },
        {
            name: "송중기",
            category: "연예인",
            birthdate: "1985-09-19",
            achievement: "태양의 후예, 빈센조의 한류 스타",
            personality_match: "깔끔하게 벼려진 신유의 이미지 관리와 완벽주의. 디테일에 강한 배우.",
            wiki_link: "https://ko.wikipedia.org/wiki/송중기"
        },
        {
            name: "마릴린 먼로",
            category: "연예인",
            birthdate: "1926-06-01",
            achievement: "20세기 최고의 섹시 심벌이자 문화 아이콘",
            personality_match: "신유일주의 반짝이는 보석 같은 매력. 화려함 뒤의 섬세하고 예민한 내면까지 닮았다.",
            wiki_link: "https://ko.wikipedia.org/wiki/마릴린_먼로"
        }
    ],

    // 59. IM_SUL (임술) - 큰 그릇, 통찰, 포용
    "IM_SUL": [
        {
            name: "이건희",
            category: "기업가",
            birthdate: "1942-01-09",
            achievement: "삼성전자를 세계 1위로 키운 삼성 2대 회장",
            personality_match: "임술일주는 산이 큰물을 품은 형상. 10년 뒤를 내다본 통찰의 승부사.",
            quote: "마누라와 자식 빼고 다 바꿔라",
            wiki_link: "https://ko.wikipedia.org/wiki/이건희"
        },
        {
            name: "빌 게이츠",
            category: "기업가",
            birthdate: "1955-10-28",
            achievement: "마이크로소프트 공동 창업자, 세계 최대 자선재단 운영",
            personality_match: "PC 시대를 내다본 임술의 큰 통찰. 이제는 그 큰물로 세상을 품는 자선가.",
            quote: "성공은 형편없는 선생이다",
            wiki_link: "https://ko.wikipedia.org/wiki/빌_게이츠"
        },
        {
            name: "싸이",
            category: "연예인",
            birthdate: "1977-12-31",
            achievement: "강남스타일로 유튜브 최초 10억 뷰를 돌파한 월드스타",
            personality_match: "임술의 큰물은 국경이 없다. B급 감성에 담긴 대범한 스케일이 세계를 흔들었다.",
            wiki_link: "https://ko.wikipedia.org/wiki/싸이"
        }
    ],

    // 60. GYE_HAE (계해) - 깊은 바다, 상상력, 감수성
    "GYE_HAE": [
        {
            name: "존 덴버",
            category: "연예인",
            birthdate: "1943-12-31",
            achievement: "Take Me Home, Country Roads의 컨트리 음악 전설",
            personality_match: "계해일주는 바다처럼 깊은 감수성. 자연을 노래한 서정성이 시대를 넘어 흐른다.",
            wiki_link: "https://en.wikipedia.org/wiki/John_Denver"
        },
        {
            name: "케이트 베킨세일",
            category: "연예인",
            birthdate: "1973-07-26",
            achievement: "언더월드 시리즈의 할리우드 배우",
            personality_match: "옥스퍼드에서 문학을 공부한 지성파. 계해의 깊은 물처럼 겉과 속의 층이 많다.",
            wiki_link: "https://en.wikipedia.org/wiki/Kate_Beckinsale"
        }
    ]
}

/**
 * Get celebrities for a given pillar code
 */
export function getCelebritiesByCode(code: string): Celebrity[] {
    return CELEBRITY_MATCHES[code] || []
}

/**
 * Check if celebrity data exists for a pillar
 */
export function hasCelebrityData(code: string): boolean {
    const celebs = CELEBRITY_MATCHES[code]
    return celebs !== undefined && celebs.length > 0
}
