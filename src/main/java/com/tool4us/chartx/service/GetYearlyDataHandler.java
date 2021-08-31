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



@TomyApi(paths={ "/ytx" })
public class GetYearlyDataHandler extends ApiHandler
{
    static String[] years = new String[] { "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021" };
    
    static int _xColumn     = 0;
    static int _buyPosIdx   = 1; // 구매 가능성 컬럼
    
    static int[][] _yList   = { { 2, 3 }, { 5, 6, 7, 8} }; // 반환하는 데이터의 인덱스 (아래 _fetchColumns에 정의한 순서임).
    static int[] _fetchColumns = { 0, 1, 2, 3, 4, 5, 6, 7, 8 }; // 반환할 데이터 컬럼 인덱스. 순서대로 반환됨.
    
    
    @Override
    public String call(TomyRequestor req, TomyResponse res) throws Exception
    {
        String authCode = req.getHeaderValue("x-auth-code");
        
        if( emptyCheck(authCode) )
            return makeResponseJson(ApiError.InvalidAuthCode);
        
        // TODO authCode 검증 로직 추가

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
            .append(", \"Y1\":[").append(UT.textWithDelimiter(_yList[0])).append("]")
            .append(", \"Y2\":[").append(UT.textWithDelimiter(_yList[1])).append("]")
            .append("}");

        // data --> title, columns( { name, type(string, number, datetime), data[] }), editable(false)
        sb.append(", \"data\":[");
        
        Map<Integer, double[]> extentMap = new TreeMap<Integer, double[]>();
        
        boolean assigned = false;
        for(int i = 0; i < years.length; ++i)
        {
            String dataBlock = this.makeDataBlock(years[i], ds, _xColumn, extentMap);

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
    
    private String makeDataBlock( String year, FileMapStore ds, int dateColumn
                                , Map<Integer, double[]> extentMap ) throws Exception
    {
        long startRow = -1;
        for(long r = 0; r < ds.getRowSize(); ++r)
        {
            String dStr = (String) ds.getCell(dateColumn, r);
            if( dStr != null && dStr.startsWith(year) )
            {
                startRow = r;
                break;
            }
        }
        
        if( startRow == -1 )
            return null;

        StringBuilder sb = new StringBuilder();
        StringBuilder sbMarker = new StringBuilder();

        sb.append("{");
        
        sb.append("\"title\":\"").append(year).append("\"");
        sb.append(",\"columns\":[");
        
        boolean markerOn = false;
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
            for(long r = startRow; r < ds.getRowSize(); ++r)
            {
                String dStr = (String) ds.getCell(dateColumn, r);

                if( dStr == null || !dStr.startsWith(year) )
                    break;
                
                if( c == 0)
                {
                    Double bFlag = (Double) ds.getCell(_buyPosIdx, r);
                    if( bFlag > 0 )
                    {
                        if( markerOn )
                            sbMarker.append(",");
    
                        sbMarker.append(r - startRow);
                        markerOn = true;
                    }
                }
                    
                if( assigned )
                    sb.append(",");
                
                Object v = ds.getCell(c, r);

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
                
                assigned = true;
            }

            sb.append("]}");
        }
        
        sb.append("]");
        sb.append(",\"editable\":false");

        if( markerOn )
            sb.append(", \"marker\": [").append(sbMarker.toString()).append("]");

        sb.append("}");
        
        return sb.toString();
    }
}
