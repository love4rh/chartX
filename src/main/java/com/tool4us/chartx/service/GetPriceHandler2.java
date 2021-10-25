package com.tool4us.chartx.service;

import com.tool4us.net.http.TomyRequestor;
import com.tool4us.net.http.TomyResponse;

import lib.turbok.util.UsefulTool;

import org.json.JSONArray;
import org.json.JSONObject;

import com.tool4us.chartx.util.ChartTool;
import com.tool4us.net.http.ApiError;
import com.tool4us.net.http.ApiHandler;
import com.tool4us.net.http.TomyApi;



// 지정한 코드, 날짜의 시가, 종가 반환
// http://localhost:8080/pr?code=066570&dates=20211001,20211025
@TomyApi(paths={ "/pr" })
public class GetPriceHandler2 extends ApiHandler
{
    @Override
    public String call(TomyRequestor req, TomyResponse res) throws Exception
    {
        String code = req.getParameter("code");
        String dates = req.getParameter("dates"); // 콤마 구분

        if( emptyCheck(code, dates) )
        	return makeResponseJson(ApiError.MissingParameter);
        
        String[] dt = UsefulTool.SplitLineText(dates, ",", false);
        
        if( dt == null || dt.length != 2 )
            return makeResponseJson(ApiError.InvalidParameter);

        JSONArray prList = ChartTool.getPriceFromExternal(code, dt[0], dt[1]);
        
        JSONObject retObj = new JSONObject();

        retObj.put("prices", prList);

        return makeResponseJson(retObj);
    }
}
