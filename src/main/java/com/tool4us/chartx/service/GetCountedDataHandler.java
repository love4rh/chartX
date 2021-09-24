package com.tool4us.chartx.service;

import static com.tool4us.chartx.AppResource.RES;
import static com.tool4us.chartx.AppSetting.OPT;
import static com.tool4us.common.Util.UT;

import java.io.File;
import java.util.Map;
import java.util.TreeMap;

import com.tool4us.net.http.TomyRequestor;
import com.tool4us.net.http.TomyResponse;

import lib.turbok.data.FileMapStore;

import com.tool4us.chartx.util.ChartTool;
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
        int _xColumn = OPT.getChartX();
        int[][] _yList = OPT.getChartY();
        
        String authCode = req.getHeaderValue("x-auth-code");
        
        if( !OPT.checkAuthCode(authCode) )
            return makeResponseJson(ApiError.InvalidAuthCode);
        
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
        String title = RES.getCodeTitle(pCode);
        for(long r = missing; r < dataCount; r += shownCount)
        {
            String dataBlock = ChartTool.makeDataBlock(title, r, Math.min(r + shownCount, dataCount), ds, extentMap);

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
                
                if( list == null )
                    continue;

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
}
