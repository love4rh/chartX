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

<?xml version="1.0" encoding="UTF-8"?>

<processingElem type="derived">
	<dataSource alias="A1"><![CDATA[SORTBYBASE]]></dataSource>
	<dataGroupName><![CDATA[ADD_DF]]></dataGroupName>
	<ui>
		<position x="479" y="345" />
		<description><![CDATA[]]></description>
	</ui>
	<addColumns>
		<derivedColumn name="DX"><![CDATA[@ROWNUM * 0.1]]></derivedColumn>
		<derivedColumn name="RPRICE"><![CDATA[IIF( @ROWNUM = 1, (A := {LAST_P}) / {LAST_P}, {LAST_P} / A )]]></derivedColumn>
		<derivedColumn name="MV/RP"><![CDATA[MOVINGAVG(@{RPRICE}, MIN(2, @ROWNUM))]]></derivedColumn>
		<derivedColumn name="MV/LP"><![CDATA[MOVINGAVG( @{LAST_P}, MIN(2, @ROWNUM) )]]></derivedColumn>
		<derivedColumn name="SLOPE/MV"><![CDATA[IIF(@ROWNUM < 5, 0, LINEARSLOPE(@{DX}, @{MV/RP}, 5))]]></derivedColumn>
		<derivedColumn name="CLINE"><![CDATA[IIF( @ROWNUM = 1, {SLOPE/MV}, GETVALUE(@THIS, -1) + {SLOPE/MV} )]]></derivedColumn>
		<derivedColumn name="SMOOTH/FACTOR"><![CDATA[SQRT(MOVINGVAR(@{SLOPE/MV}, 20)) * 0.8]]></derivedColumn>
		<derivedColumn name="SLOPE/SMOOTH"><![CDATA[IIF( ISBETWEEN({SLOPE/MV}, -{SMOOTH/FACTOR}, {SMOOTH/FACTOR}), 0, {SLOPE/MV} )]]></derivedColumn>
		<derivedColumn name="CLINE/SMOOTH"><![CDATA[IIF( @ROWNUM = 1, {SLOPE/SMOOTH}, GETVALUE(@THIS, -1) + {SLOPE/SMOOTH} )]]></derivedColumn>
		<derivedColumn name="CHAIN/PLUS"><![CDATA[IIF( @ROWNUM < 2, 0,
  IIF( {SLOPE/SMOOTH} >= 0, GETVALUE(@THIS, -1) + {SLOPE/SMOOTH}, 0 )
)]]></derivedColumn>
		<derivedColumn name="CHAIN/MINUS"><![CDATA[IIF( @ROWNUM < 2, 0,
  IIF( {SLOPE/SMOOTH} <= 0, GETVALUE(@THIS, -1) + {SLOPE/SMOOTH}, 0 )
)]]></derivedColumn>
		<derivedColumn name="CHAIN/VAL"><![CDATA[{CHAIN/PLUS} + {CHAIN/MINUS}]]></derivedColumn>
	</addColumns>
</processingElem>
