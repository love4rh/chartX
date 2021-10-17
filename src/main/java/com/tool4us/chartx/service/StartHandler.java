package com.tool4us.chartx.service;

import static com.tool4us.chartx.AppResource.RES;
import static com.tool4us.common.Util.UT;

import org.json.JSONObject;

import static com.tool4us.common.AccountManager.AM;

import com.tool4us.net.http.TomyRequestor;
import com.tool4us.net.http.TomyResponse;

import com.tool4us.net.http.ApiError;
import com.tool4us.net.http.ApiHandler;
import com.tool4us.net.http.TomyApi;



@TomyApi(paths={ "/start" })
public class StartHandler extends ApiHandler
{
    @Override
    public String call(TomyRequestor req, TomyResponse res) throws Exception
    {
        if( !UT.checkAuthCode(req, true) )
            return makeResponseJson(ApiError.InvalidAuthCode);
        
        String id = req.bodyParameter("id");
        String pw = req.bodyParameter("pw");
        
        if( emptyCheck(id, pw ) )
            return makeResponseJson(ApiError.MissingHeader);
        
        if( !AM.checkAccountValidity(id, req.getHeaderValue("x-user-token"), pw) )
        {
            return makeResponseJson(ApiError.InvalidUser);
        }
        
        JSONObject fav = AM.getFavorites(id);
        
        // 종목 리스트 보내기
        StringBuilder sb = new StringBuilder();
        
        sb.append("{");
        sb.append("\"codes\":")
          .append(RES.getCodesAsJSON()); // code, name, business
        sb.append(",\"favorites\":").append( fav == null ? "{}" : fav.toString());
        sb.append("}");
        
        return makeResponseJson(sb.toString());
    }
}
