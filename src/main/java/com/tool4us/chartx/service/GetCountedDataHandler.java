package com.tool4us.chartx.service;

import static com.tool4us.chartx.AppSetting.OPT;
import static com.tool4us.common.Util.UT;

import java.io.File;
import java.util.Map;
import java.util.TreeMap;

import com.tool4us.net.http.TomyRequestor;
import com.tool4us.net.http.TomyResponse;

import lib.turbok.common.ValueType;
import lib.turbok.data.FileMapStore;

import com.tool4us.net.http.ApiError;
import com.tool4us.net.http.ApiHandler;
import com.tool4us.net.http.TomyApi;



// 차트용 데이터를 지정한 개수만큼 잘라서 반환
@TomyApi(paths={ "/ctx" })
public class GetCountedDataHandler extends ApiHandler
{
    @Override
    public String call(TomyRequestor req, TomyResponse res) throws Exception
    {
        int _xColumn     = OPT.getChartX();
        int[][] _yList = OPT.getChartY();
        
        String authCode = req.getHeaderValue("x-auth-code");
        
        if( emptyCheck(authCode) )
            return makeResponseJson(ApiError.InvalidAuthCode);
        
        // TODO authCode 검증 로직 추가

        String countStr = req.getParameter("count");
        String pCode = req.getParameter("pCode");
        
        if( emptyCheck(pCode ) )
        	return makeResponseJson(ApiError.MissingParameter);
        
        // 데이터 가져오기
        String pathName = OPT.dataFolder() + File.separator + "P" + pCode + ".pmd";
        
        FileMapStore ds = FileMapStore.newInstance(pathName);
        if( ds == null )
            return makeResponseJson(ApiError.InvalidParameter);

        StringBuilder sb = new StringBuilder();
        
        sb.append("{");

        sb.append("\"chart\":{ \"X\": ").append(_xColumn)
          .append(", \"Y1\":[").append(UT.textWithDelimiter(_yList[0])).append("]");
        
        if( _yList[1] != null )
        {
            sb.append(", \"Y2\":[").append(UT.textWithDelimiter(_yList[1])).append("]");
        }
        
        sb.append("}");

        // Data Column Index --> Color
        sb.append(", \"colorMap\": {")
          .append("\"2\": \"#4e79a7\", ")
          .append("\"3\": \"#e15759\", ")
          .append("\"4\": \"#59a14f\", ")
          .append("\"5\": \"#edc949\", ")
          .append("\"6\": \"#f28e2c\", ")
          .append("\"7\": \"#76b7b2\", ")
          .append("\"8\": \"#af7aa1\", ")
          .append("\"9\": \"#ff9da7\", ")
          .append("\"10\": \"#9c755f\", ")
          .append("\"11\": \"#bab0ab\" }")
        ;

        // data --> title, columns( { name, type(string, number, datetime), data[] }), editable(false)
        sb.append(", \"data\":[");
        
        Map<Integer, double[]> extentMap = new TreeMap<Integer, double[]>();
        
        long shownCount = countStr == null || countStr.isEmpty() ? 250 : Long.parseLong(countStr); // 한 차트에 보일 데이터 개수
        long dataCount = ds.getRowSize();
        long missing = dataCount <= shownCount ? 0 : dataCount % shownCount; // 앞쪽 표시하지 않을 데이터 개수
        
        boolean assigned = false;
        for(long r = missing; r < dataCount; r += shownCount)
        {
            String dataBlock = this.makeDataBlock(r, Math.min(r + shownCount, dataCount), ds, _xColumn, extentMap);

            if( dataBlock != null )
            {
                if( assigned )
                    sb.append(",");
                
                sb.append(dataBlock);
                assigned = true;
            }
        }
        sb.append("]");
        
        // Extent Value
        if( !extentMap.isEmpty() )
        {
            for(int j = 1; j <= 2; ++j)
            {
                int[] list = _yList[j - 1];

                double[] minMax = null;;
                for(int i = 0; i < list.length; ++i)
                {
                    double[] mm = extentMap.get(list[i]);
                    if( mm == null )
                        continue;
                    
                    if( minMax == null )
                        minMax = mm;
                    else
                    {
                        minMax[0] = Math.min(minMax[0], mm[0]);
                        minMax[1] = Math.max(minMax[1], mm[1]);
                    }
                }
                
                if( minMax != null )
                {
                    sb.append(", \"extentY").append(j).append("\":[")
                        .append(minMax[0]).append(", ").append(minMax[1]).append("]");
                }
            }
        }

        sb.append("}");
        
        ds.close();
        
        return makeResponseJson(sb.toString());
    }
    
    private String makeDataBlock( long startRow, long endRow, FileMapStore ds, int dateColumn
                                , Map<Integer, double[]> extentMap ) throws Exception
    {
        int _suggestIdx  = OPT.getChartSuggest();
        int[] _fetchColumns = OPT.getChartData();
        
        
        StringBuilder sb = new StringBuilder();
        StringBuilder[] sbMarker = { new StringBuilder(), new StringBuilder() };

        sb.append("{");
        
        // TODO 제목
        sb.append("\"title\":\"").append("untitled").append("\"");
        sb.append(",\"columns\":[");
        
        boolean[] markerOn = { false, false };
        for(int i = 0; i < _fetchColumns.length; ++i)
        {
            if( i > 0 )
                sb.append(",");
            
            int c = _fetchColumns[i];
            
            ValueType vt = ds.getColumnType(c);
            String typeStr = "string";

            double[] minMax = null;
            
            if( vt == ValueType.DateTime )
                typeStr = "datetime";
            else if( vt == ValueType.Integer || vt == ValueType.Real )
            {
                typeStr = "number";
                minMax = extentMap.get(c);
            }

            sb.append("{ \"name\":\"").append(ds.getColumnName(c)).append("\"");
            sb.append(", \"type\":\"").append(typeStr).append("\"");
            sb.append(", \"data\":[");
            
            boolean assigned = false;
            Object pv = null;
            for(long r = startRow; r < endRow; ++r)
            {
                if( c == 0)
                {
                    int bFlag = ((Double) ds.getCell(_suggestIdx, r)).intValue();
                    if( bFlag > 0 )
                    {
                        bFlag -= 1;
                        if( markerOn[bFlag] )
                            sbMarker[bFlag].append(",");
    
                        sbMarker[bFlag].append(r - startRow);
                        markerOn[bFlag] = true;
                    }
                }
                    
                if( assigned )
                    sb.append(",");
                
                Object v = ds.getCell(c, r);
                
                if( v == null )
                {
                    v = pv;
                    System.out.println("null value found in (" + c + ", " + r + ")");
                }

                if( "number".equals(typeStr) || v == null )
                {
                    sb.append(v);

                    if( minMax == null )
                    {
                        minMax = new double[] { (Double) v, (Double) v };
                        extentMap.put(c, minMax);
                    }
                    else
                    {
                        minMax[0] = Math.min(minMax[0], (Double) v);
                        minMax[1] = Math.max(minMax[1], (Double) v);
                    }
                }
                else
                    sb.append("\"").append(v).append("\"");
                
                pv = v;
                assigned = true;
            }

            sb.append("]}");
        }
        
        sb.append("]");
        sb.append(",\"editable\":false");

        if( markerOn[0] || markerOn[1] )
        {
            boolean assigned = false;
            sb.append(", \"marker\": [");
            
            for(int i = 0; i < 2; ++i)
            {
                if( !markerOn[i] )
                    continue;
                
                if( assigned )
                    sb.append(",");

                sb.append("{ \"point\":[").append(sbMarker[i].toString()).append("]")
                  .append(", \"color\":\"").append(i == 0 ? "red" : "green").append("\" }");
                
                assigned = true;
            }
            
            sb.append("]");
        }

        sb.append("}");
        
        return sb.toString();
    }
}
