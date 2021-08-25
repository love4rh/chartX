package com.tool4us.chartx.service;

import static com.tool4us.chartx.AppSetting.OPT;

import java.io.File;

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
        
        // chart --> X: 0, Y1:[1, 2], Y2:[3, 4, 5]
        sb.append("\"chart\":{ \"X\": 0, \"Y1\":[1, 2], \"Y2\":[3, 4, 5, 6] }");
        
        // data --> title, columns( { name, type(string, number, datetime), data[] }), editable(false)
        sb.append(", \"data\":[");
        
        boolean assigned = false;
        for(int i = 0; i < years.length; ++i)
        {
            String dataBlock = this.makeDataBlock(years[i], ds, 0);

            if( dataBlock != null )
            {
                if( assigned )
                    sb.append(",");
                
                sb.append(dataBlock);
                assigned = true;
            }
        }
        sb.append("]");
        
        sb.append("}");
        
        ds.close();
        
        return makeResponseJson(sb.toString());
    }
    
    private String makeDataBlock(String year, FileMapStore ds, int dateColumn) throws Exception
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
        
        int columnCount = 7; // (int) ds.getColumnSize();
        int buyPosIdx = 7; // 구매 가능성 컬럼
        
        StringBuilder sb = new StringBuilder();
        StringBuilder sbMarker = new StringBuilder();

        sb.append("{");
        
        sb.append("\"title\":\"").append(year).append("\"");
        sb.append(",\"columns\":[");
        
        boolean markerOn = false;
        for(int c = 0; c < columnCount; ++c)
        {
            if( c > 0 )
                sb.append(",");
            
            ValueType vt = ds.getColumnType(c);
            String typeStr = "string";
            
            if( vt == ValueType.DateTime )
                typeStr = "datetime";
            else if( vt == ValueType.Integer || vt == ValueType.Real )
                typeStr = "number";

            sb.append("{ \"name\":\"").append(ds.getColumnName(c)).append("\"");
            sb.append(", \"type\":\"").append(typeStr).append("\"");
            sb.append(", \"data\":[");
            
            boolean assigned = false;
            for(long r = startRow; r < ds.getRowSize(); ++r)
            {
                String dStr = (String) ds.getCell(dateColumn, r);

                if( !dStr.startsWith(year) )
                    break;
                
                if( c == 0)
                {
                    Double bFlag = (Double) ds.getCell(buyPosIdx, r);
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
                    sb.append(v);
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
