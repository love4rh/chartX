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


# TODO List
바로 전 레코드부터 이전으로 지정한 값의 개수를 계산하는 함수 생성


