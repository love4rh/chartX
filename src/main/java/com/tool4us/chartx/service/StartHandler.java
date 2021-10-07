package com.tool4us.chartx.service;

import static com.tool4us.chartx.AppResource.RES;
import static com.tool4us.chartx.AppSetting.OPT;

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
        String authCode = req.getHeaderValue("x-auth-code");
        
        if( !OPT.checkAuthCode(authCode) )
            return makeResponseJson(ApiError.InvalidAuthCode);
        
        String id = req.getHeaderValue("x-user-identifier");
        String pw = req.getHeaderValue("x-user-password");
        
        if( emptyCheck(id, pw ) )
            return makeResponseJson(ApiError.MissingHeader);
        
        // TODO id 체크
        if( "unknown".equals(id) )
        {
            return makeResponseJson(ApiError.InvalidUser);
        }
        
        // 종목 리스트 보내기
        StringBuilder sb = new StringBuilder();
        
        sb.append("{");
        sb.append("\"codes\":");
        sb.append(RES.getCodesAsJSON()); // code, name, business
        sb.append("}");
        
        return makeResponseJson(sb.toString());
    }
}
