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



@TomyApi(paths={ "/ytx" })
public class GetYearlyDataHandler extends ApiHandler
{     
    @Override
    public String call(TomyRequestor req, TomyResponse res) throws Exception
    {
        int _xColumn = OPT.getChartX();
        int[][] _yList = OPT.getChartY();
        
        String authCode = req.getHeaderValue("x-auth-code");
        
        if( !OPT.checkAuthCode(authCode) )
            return makeResponseJson(ApiError.InvalidAuthCode);
        
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
        sb.append(", \"colorMap\":").append(OPT.getColorMap());

        // data --> title, columns( { name, type(string, number, datetime), data[] }), editable(false)
        sb.append(", \"data\":[");
        
        Map<Integer, double[]> extentMap = new TreeMap<Integer, double[]>();
        
        ChartTool.attachAnnualDataBlock(sb, RES.getCodeTitle(pCode), ds, extentMap);
        
        sb.append("]");
        
        // Extent Value
        ChartTool.attachExtent(sb, extentMap);

        sb.append("}");
        
        ds.close();
        
        return makeResponseJson(sb.toString());
    }
}
