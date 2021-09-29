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

