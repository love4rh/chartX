package com.tool4us.chartx.service;

import static com.tool4us.chartx.AppResource.RES;

import com.tool4us.net.http.TomyRequestor;
import com.tool4us.net.http.TomyResponse;

import com.tool4us.net.http.ApiHandler;
import com.tool4us.net.http.TomyApi;



@TomyApi(paths={ "/codes" })
public class GetCodesHandler extends ApiHandler
{
    @Override
    public String call(TomyRequestor req, TomyResponse res) throws Exception
    {
//        String authCode = req.getHeaderValue("x-auth-code");
//        
//        if( emptyCheck(authCode) )
//            return makeResponseJson(ApiError.InvalidAuthCode);

        StringBuilder sb = new StringBuilder();
        
        sb.append("{");
        sb.append("\"codes\":");
        sb.append(RES.getCodesAsJSON());
        sb.append("}");
        
        return makeResponseJson(sb.toString());
    }
}
