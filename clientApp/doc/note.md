입사 전
- 모바일 게임 개발 (안드로이드 이전)
- 대용량 데이터 처리 엔진 개발
- 데이터마이닝 툴 기획/설계/개발
  (데이터 프로세싱부터 마이닝 모델 적용을 유연하고 다양하게 활용할 수 있음)
- 데이터마이닝 모델 기반 실시간 이상진단 솔루션 기획/설계/개발
- 공정분석 시스템 포팅 및 다수의 분석 프로젝트 리딩
- 자금세탁방지 시스템 기획/설계/개발 (Link Analysis)
- 공정분석을 위한 Visualization 도구 개발


입사 후 (2012년 11월 12일 입사)
- Crawlego / Prometheus 기획/설계/개발 (데이터 프로세싱/ETL 도구)
- epgOn 개발 (EPG 제공 서버, 실시간 방송 개인화 추천 모델 포함)
- IBS 개발/운영
- 시청 데이터 분석 프로젝트 (http://collab.lge.com/main/pages/viewpage.action?pageId=404488132)
- 홈대시보드 앱 개발
- 홈대시보드 서비스 개발
- LSS Faker 기획/설계/개발 (IoT 가전 연동 테스트를 위한 Mock 서버)
- Data Scientist 고급 과정 수료 (2020년 초 서울대)
- OLED Care Program 데이터 관리 서버 개발
- 업무 중 불편한 부분 개선을 위한 도구 다수 개발
  PM 로그 분석: http://chimera.lge.com:20000/ (설명: http://collab.lge.com/main/pages/viewpage.action?pageId=1428569256)
  GFTS Uploading: http://collab.lge.com/main/display/~mh9.kim/GFTSUploader
  Online DB 쿼리 도구: http://10.186.115.136:8080/
  IBS 활용 편의 도구: http://10.186.115.136:8018/treatX/app.html



# Buy Point Logic


## Logic #1

```xml
<?xml version="1.0" encoding="UTF-8"?>

<processingElem type="derived">
	<dataSource alias="A1"><![CDATA[ADD_DF]]></dataSource>
	<dataGroupName><![CDATA[ADD_EXDF]]></dataGroupName>
	<ui>
		<position x="650" y="346" />
		<description><![CDATA[]]></description>
	</ui>
	<addColumns>
		<derivedColumn name="VAR_CUM"><![CDATA[MOVINGVAR(@{SLP_MV5}, 20) * 15]]></derivedColumn>
		<derivedColumn name="SLP2"><![CDATA[IIF( -{VAR_CUM} < {SLP_MV5} AND {SLP_MV5} < {VAR_CUM}, 0, {SLP_MV5} )]]></derivedColumn>
		<derivedColumn name="CUM2"><![CDATA[IIF( @ROWNUM = 1, {SLP2}, GETVALUE(@THIS, -1) + {SLP2} )]]></derivedColumn>
		<derivedColumn name="STEADY_COUNT"><![CDATA[MOVINGLESSCOUNT(@{VAR_CUM}, 30, 0.1)]]></derivedColumn>
		<derivedColumn name="CONT_P_SLP"><![CDATA[IIF( @ROWNUM < 2, 0,
  IIF( {SLP2} >= 0, GETVALUE(@THIS, -1) + {SLP2}, 0 )
)]]></derivedColumn>
		<derivedColumn name="CONT_M_SLP"><![CDATA[IIF( @ROWNUM < 2, 0,
  IIF( {SLP2} <= 0, GETVALUE(@THIS, -1) + {SLP2}, 0 )
)]]></derivedColumn>
		<derivedColumn name="CONT_SLP"><![CDATA[{CONT_P_SLP} + {CONT_M_SLP}]]></derivedColumn>
		<derivedColumn name="MIN_CUM"><![CDATA[MOVINGMIN(@{CUM2}, 200)]]></derivedColumn>
		<derivedColumn name="MAX_CUM"><![CDATA[MOVINGMAX(@{CUM2}, 250)]]></derivedColumn>
		<derivedColumn name="GAP_MAX"><![CDATA[{MAX_CUM} - {CUM2}]]></derivedColumn>
		<derivedColumn name="BPOS_FLAG"><![CDATA[IIF( @ROWNUM < 100, 0,
  IIF( {CUM2}[-1] < {CUM2}[0] AND {SLP2} > 0.1
       AND MOVINGSUM(@THIS, 30) = 0, 1, 0 )
)]]></derivedColumn>
	</addColumns>
</processingElem>
```


AND {MV3-REAL} / {MIN_IN_YEAR} < 1.11


# 파생변수
DX: 기울기 계산을 위한 X축 변화량. 0.1
RPRICE: 상대가격. 첫 번째 값을 기준으로 계산하였으며 종목별 가격 편차를 헷지하기 위하여 사용. 기준값은 상황에 따라 조정이 필요함.
MV/RP: 상대가격의 이동평균. 3일 기준.
MV/LP: 종가의 이동평균 3일 기준.
SLOPE/MV: (DX, MV/RP) 5개 점을 이용하여 계산된 1차 직선의 기울기
CLINE: SLOPE/MV의 누적합

SMOOTH/FACTOR: 기울기(SLOPE/MV)을 무디게 만들기 위한 기준치. (SLOPE/MV 20개의 표준편차) * 보정팩터(1.2). 자잘한 변화는 무시하여 트렌드만 부각하기 위해 사용
SLOPE/SMOOTH: SMOOTH/FACTOR으로 보정한 무딘 기울기
CLINE/SMOOTH: SLOPE/SMOOTH의 누적합


RATIO/MV120: 120일 이동평균 대비 현재 가격(종가). 평균 수준 대비 낮은 정도를 판단할 수 있음.
CHAIN/PLUS: 양의 값을 갖는 (상승세인) SLOPE/SMOOTH의 누적합.
MV/20: 20일 이동평균
MV/60: 60일 이동평균


## PT/20 (Point Type in MV20)
0: N/A
3: 위쪽 볼록 변곡점. 하락 예상 (표시안함)
4: 아래 볼록 변곡점. 상승 예상 (표시안함)
5: 극격한 상승 (보라색)

## PT2/20
6: MV20과 MV60이 만나는 점. MV20 하락. 매도 여부 판단 (노란색, 표시안함)
7: MV20과 MV60이 만나는 점. MV20 상승. (초록색)

## SUGGEST
PT/20를 이용하여 산출한 매수/매도 포인트 제안값
1: 매수 제안 (빨간색)
2: 매도 제안


평생 같이 할 우리 륜희와 이런 식으로 계속 지낼 수 없기에 몇 자 적어요.

나이가 들면 무뎌지고 적당히 그려러니 하게 되던데 우리 륜희는 아직 젊은 것 같아요.
지난 목요일 백신 후유증인지 평소 가끔 나타나는 증상의 연장인지 모르겠지만,
머리가 너무 아프고 피곤하고 눈이랑 뇌에 피가 덜가는 느낌이었어요.
아는지 모르겠지만 나름 우리 륜희 이야기에 집중하며 머리와 눈 주변을 주무르고 있었어요.
그런데 자기가 볼 때 안본다며 화내고 밥 먹고 있는 아들도 안 본다고 화내고... 이건 좀 아닌거 같아요.

사람 한 순간에 안 변해요. 나도 그렇고 우리 륜희도 그럴거에요.
많은 노력으로 천천히 변하는거에요. 지금 내 성에 안찬다고 너 아직도 안 바꼈냐고 뭐라하면 감정만 상하는 거죠.

그냥 좋게 생각하고 얘기하고 지냈으면 좋겠어요.



## 매수로직 01

```
{RATIO/MV120} < 1.05 --> 저가 판단
AND {CHAIN/PLUS} > 0.1 --> 상승세
AND {MV/20} / {MV/20}[-1] >= 1.002 --> 오름 판단
AND {MV/60} < {MV/20} --> 상승세 판단
```



IIF( @ROWNUM = 1, 0,
  IIF( {RATIO/MV120} < 1.05
      AND {CHAIN/PLUS} > 0.1
      AND {MV/20} / {MV/20}[-1] >= 1.002
      AND {MV/60} < {MV/20}
    , IIF( MOVINGSUM(@THIS, 40) = 0, 1, 0)
    , 0 )
)


2주 내 MV20이 MV60 이하이면


IIF( @ROWNUM < 120, 0,
   IIF( {RATIO/MAX} <= 0.77
        AND 1 < {RATIO/MIN} AND {RATIO/MIN} <= 1.14
        AND {MV/20} / {MV/60} > 0.9
        AND ({STD/60} < 4 OR {AVG/60} <= {MV/60})
        AND {SLOPE/20} >= -0.0001
        AND MOVINGSUM(@THIS, 25) = 0,
   IIF( {UP/DOWN}[-1] = 0 AND {UP/DOWN} >= 0.5
        AND MOVINGSUM(@{UP/DOWN}, 11) <= IIF({UP/DOWN} = 1, 1, 0.5)
      , 1,
   IIF( {UP/DOWN}[-1] = 0.5 AND {UP/DOWN} >= 1
        AND MOVINGSUM(@{UP/DOWN}, 11) <= 6
      , 1, 0
   )), 0 )
)



IIF( @ROWNUM < 12, 0,
   IIF( MOVINGSUM(@THIS, 25) = 0 AND {STD/20} < 1.125,
      CASE( 0
         , ({HL/20}[-1] + {HL/20}) / 2 <= 0.991
           AND {HL/20} <= 0.985 AND {HL/RATIO} >= 1.0
           AND {AVG/S20} <= 4.2 AND {MV/20} < {MV/120}, 4
         , ({HL/20}[-1] + {HL/20}) / 2 >= 1.009 AND {MV/20} > {MV/120}, 3
      ),
      CASE( 0
         , MOVINGMORECOUNT(@THIS, 45, 4) = 0 AND {STD/20} > 10 AND {HL/20} > 1, 5
         , {MV/20}[-1] >= {MV/60}[-1] AND {MV/20} <= {MV/60}, 6
         , {MV/20}[-1] <= {MV/60}[-1] AND {MV/20} >= {MV/60}, 7
      )
   )
)


IIF( @ROWNUM < 130, 0,
   CASE( GETVALUE(@THIS, -1)
       , {PT/20} = 4, 4
       , GETVALUE(@THIS, -1) = 4 AND {HL/20} >= 1.0, 10
       , GETVALUE(@THIS, -1) >= 12, 20
       , GETVALUE(@THIS, -1) >= 10 AND {PT/20} = 3, GETVALUE(@THIS, -1) + 1
       , GETVALUE(@THIS, -1) >= 10 AND {PT/20} = 5, 20
   )
)


IIF( @ROWNUM < 120, 0,
   IIF( {PT2/20} = 7 AND ({HL/60} >= 1.0 OR {HL/120} >= 1.0)
      , 1, 0 )
)


IIF( @ROWNUM < 130, 0,
   IIF( {MV/20} >= {MV/60} AND {MV/20} >= {MV/120}
        AND {HL/20} > 1.0 AND {HL/60} >= 0.995 AND {HL/120} >= 0.99
        AND {HL/20} >= {HL/60} AND {HL/60} >= {HL/60}[-1]
       , 3, 0
   )
)


SLOPE/40 < 0 AND SLOPE/40 상승세
AND SLOPE/20가 SLOPE/40를 뚫고 올라가는 지점


SLOPE/40 < -n.0 AND 상승전환시


## 장기 라인 기울기가 양수 전환되는 시점
, {AVG/80}[-1] < 0 AND {SLOPE/80}[-1] <= 0.05 AND {SLOPE/80} > 0.05, 2


# Guess BP Model
## GBP-TYPE-01
- LG전자 (066570)

## GBP-TYPE-02
UD/80이 +인 상태에서, SLOPE/20 상승반전(아래로 볼록) 매수하고 다음 하락반전(위로 볼록)일 때 매도. SLOPE/20 기준 매도가 손해라면 SLOPE/60 하락반전 시점 확인.
SLOPE/20 상승반전이 UD/80이 +인 상태 전환되기 얼마 전(10~12일)에 있었다면 UD/80 + 시점에 바로 매수. 매도 지점은 동일


- 원익피앤이 (131390)
추가로, "SLOPE/20 아래 볼록 매수, 다음 위 볼록 매도" 전략도 좋아 보임.

## GBP-TYPE-02-1
GBP-TYPE-02 기본에 매수 시 SLOPE/60의 상승세 여부 고려해야 함

- 엠씨넥스 (097520)


※ UD/80 전환 값이 10개 이하인 경우 실제로 전환된 것인지는 5일 정도 두고 봐야하는 경우가 있음


# 기업별 분석



- 비나텍 (126340) :
SLOPE/20 하향세가 아닌 구간에서 UD/80이 + 전환되는 시점 매수. 이후 SLOPE/20이 꺽이는 (상승 후 하락) 지점에서 매도. 상승세일 경우는 SLOPE/20 꺽임이 몇 번 더 있을 때 매도해도 좋음.



## BADs
138690


## GOODs
V 066570
097520
119860
036930
122640
V 126340
011070
093520
004835
079190
143540
192820
007370
086040
002355
011790
017890
053280
069960
086390
092730
123750
130500
039670
160980
192080
264450
123040
006220
011690
012790
014990
024950
037400
063080
004980
027970
036000
051370
108320
V 131390



2021-10-13
세방전지 (004490) 8,500
대성홀딩스 (016710) 42,550 (5% in 5)
인팩 (023810) 17,200
SBS콘텐츠허브 (046140) 7,700 (8,000)
모두투어리츠 (204210) 4,185 (4,500)
넷게임즈 (225570) 14,950 (16,000)
세원 (234100) 5,820 (6,400)
미원에스씨 (268280) 225,500 ()
EMB (278990) 9,800 (10,500) SLOPE/80가 +로 되면 10% 정도 더 오를 경향이 있음
센트랄모텍 (308170) 31,000 (33,000)
우리금융지주 (316140) 11,800 (현재 꼭진데... 그래프는 더 오를 듯한 모양임)
