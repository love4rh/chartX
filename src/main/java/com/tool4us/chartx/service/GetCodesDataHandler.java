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
import lib.turbok.util.UsefulTool;

import com.tool4us.chartx.util.ChartTool;
import com.tool4us.net.http.ApiError;
import com.tool4us.net.http.ApiHandler;
import com.tool4us.net.http.TomyApi;



// 지정된 코드 데이터 반환
@TomyApi(paths={ "/dtx" })
public class GetCodesDataHandler extends ApiHandler
{
    @Override
    public String call(TomyRequestor req, TomyResponse res) throws Exception
    {
        int _xColumn = OPT.getChartX();
        int[][] _yList = OPT.getChartY();
        
        if( !UT.checkAuthCode(req, false) )
            return makeResponseJson(ApiError.InvalidAuthCode);
        
        String countStr = req.getParameter("count");
        String codes = req.getParameter("codes"); // 콤마 구분

        if( emptyCheck(codes) )
        	return makeResponseJson(ApiError.MissingParameter);
        
        String[] codeList = UsefulTool.SplitLineText(codes, ",", false);

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
        sb.append(", \"colorMap\": ").append(OPT.getColorMap());

        // data --> title, columns( { name, type(string, number, datetime), data[] }), editable(false)
        sb.append(", \"data\":[");
        
        Map<Integer, double[]> extentMap = new TreeMap<Integer, double[]>();
        
        long shownCount = countStr == null || countStr.isEmpty() ? 250 : Long.parseLong(countStr); // 한 차트에 보일 데이터 개수
        
        // 데이터 가져오기
        boolean assigned = false;
        for(String pCode : codeList)
        {
            String pathName = OPT.dataFolder() + File.separator + "P" + pCode + ".pmd";
            
            if( !(new File(pathName).exists()) )
                continue;
            
            FileMapStore ds = FileMapStore.newInstance(pathName);
            if( ds == null )
                continue;
            
            long dataCount = ds.getRowSize();
            String title = RES.getCodeTitle(pCode);

            String dataBlock = ChartTool.makeDataBlock(
                title, pCode, Math.max(0, dataCount - shownCount), dataCount, ds, extentMap);

            if( dataBlock != null )
            {
                if( assigned )
                    sb.append(",");

                sb.append(dataBlock);
                assigned = true;
            }
            ds.close();
        }
        sb.append("]");
        
        // Extent Value
        ChartTool.attachExtent(sb, extentMap);

        sb.append("}");
        
        return makeResponseJson(sb.toString());
    }
}
