package com.tool4us.chartx.service;

import static com.tool4us.common.Util.UT;

import java.util.ArrayList;
import java.util.List;

import com.tool4us.net.http.TomyRequestor;
import com.tool4us.net.http.TomyResponse;

import lib.turbok.util.UsefulTool;

import com.tool4us.chartx.util.ChartTool;
import com.tool4us.net.http.ApiError;
import com.tool4us.net.http.ApiHandler;
import com.tool4us.net.http.TomyApi;



// 지정한 코드, 날짜의 시가, 종가 반환
@TomyApi(paths={ "/price" })
public class GetPriceHandler extends ApiHandler
{
    @Override
    public String call(TomyRequestor req, TomyResponse res) throws Exception
    {
        if( !UT.checkAuthCode(req, false) )
            return makeResponseJson(ApiError.InvalidAuthCode);
        
        String codes = req.getParameter("codes"); // 콤마 구분
        String dates = req.getParameter("dates"); // 콤마 구분

        if( emptyCheck(codes, dates) )
        	return makeResponseJson(ApiError.MissingParameter);
        
        List<String> codeList = new ArrayList<String>();
        List<String> dateList = new ArrayList<String>();
        
        String[] ar = UsefulTool.SplitLineText(codes, ",", false);
        for(String tmpStr : ar)
        {
            codeList.add(tmpStr);
        }
        
        ar = UsefulTool.SplitLineText(dates, ",", false);
        for(String tmpStr : ar)
        {
            dateList.add(tmpStr);
        }

        return makeResponseJson( ChartTool.queryPrice(codeList, dateList) );
    }
}
