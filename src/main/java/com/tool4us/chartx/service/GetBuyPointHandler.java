package com.tool4us.chartx.service;

import static com.tool4us.chartx.AppSetting.OPT;
import static com.tool4us.chartx.AppResource.RES;
import static com.tool4us.common.Util.UT;

import java.io.File;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import com.tool4us.net.http.TomyRequestor;
import com.tool4us.net.http.TomyResponse;

import lib.turbok.data.FileMapStore;

import com.tool4us.chartx.util.ChartTool;
import com.tool4us.net.http.ApiError;
import com.tool4us.net.http.ApiHandler;
import com.tool4us.net.http.TomyApi;



// 예측한 구매 포인트 데이터 반환
@TomyApi(paths={ "/gbp" })
public class GetBuyPointHandler extends ApiHandler
{
    @Override
    public String call(TomyRequestor req, TomyResponse res) throws Exception
    {
        int _xColumn = OPT.getChartX();
        int[][] _yList = OPT.getChartY();
        
        String authCode = req.getHeaderValue("x-auth-code");
        
        if( !OPT.checkAuthCode(authCode) )
            return makeResponseJson(ApiError.InvalidAuthCode);
        
        String pageStr = req.getParameter("pageNo");
        String countInPage = req.getParameter("count");
        String dpCount = req.getParameter("displyCount");
        
        int pageNo = pageStr == null || pageStr.isEmpty() ? 0 : Integer.parseInt(pageStr);
        int count = countInPage == null || countInPage.isEmpty() ? 10 : Integer.parseInt(countInPage);
        int shownCount = dpCount == null || dpCount.isEmpty() ? 350 : Integer.parseInt(dpCount);
        
        List<String> codes = RES.getBuyPointCodes();
        
        int totalPage = codes.size() / count + (0 != (codes.size() % count) ? 1 : 0); 

        // 데이터 가져오기
        StringBuilder sb = new StringBuilder();
        
        sb.append("{");
        
        sb.append("\"page\":").append(pageNo).append(",\"total\":").append(totalPage);

        sb.append(", \"chart\":{ \"X\": ").append(_xColumn)
          .append(", \"Y1\":[").append(UT.textWithDelimiter(_yList[0])).append("]");
        
        if( _yList[1] != null )
        {
            sb.append(", \"Y2\":[").append(UT.textWithDelimiter(_yList[1])).append("]");
        }
        
        sb.append("}");
        
        // Data Column Index --> Color
        sb.append(", \"colorMap\":").append(OPT.getColorMap());

        // data --> title, columns( { name, type(string, number, datetime), data[] }), editable(false)
        sb.append(", \"data\":[");
        
        boolean assigned = false;
        Map<Integer, double[]> extentMap = new TreeMap<Integer, double[]>();
        
        for(int i = pageNo * count; i < pageNo * count + count; ++i)
        {
            if( i >= codes.size() )
                break;
            
            String pCode = codes.get(i);
            String pathName = OPT.dataFolder() + File.separator + "P" + pCode + ".pmd";
            
            File f = new File(pathName);
            if( !f.exists() )
                continue;
            
            FileMapStore ds = FileMapStore.newInstance(pathName);
            
            if( ds == null )
                continue;
            
            long dataCount = Math.min(shownCount,  ds.getRowSize());

            String dataBlock = ChartTool.makeDataBlock(RES.getCodeTitle(pCode), ds.getRowSize() - dataCount, ds.getRowSize(), ds, extentMap);

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
