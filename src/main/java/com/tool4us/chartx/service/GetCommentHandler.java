package com.tool4us.chartx.service;

import static com.tool4us.common.Util.UT;
import static com.tool4us.common.AccountManager.AM;

import com.tool4us.net.http.TomyRequestor;
import com.tool4us.net.http.TomyResponse;

import com.tool4us.net.http.ApiError;
import com.tool4us.net.http.ApiHandler;
import com.tool4us.net.http.TomyApi;



@TomyApi(paths={ "/comment" })
public class GetCommentHandler extends ApiHandler
{
    @Override
    public String call(TomyRequestor req, TomyResponse res) throws Exception
    {
        if( !UT.checkAuthCode(req, false) )
            return makeResponseJson(ApiError.InvalidAuthCode);
        
        String uid = req.getParameter("uid");
        String pCode = req.getParameter("pCode");
        
        if( emptyCheck(pCode, uid) )
        	return makeResponseJson(ApiError.MissingParameter);
        
        String comment = AM.getComments(uid, pCode);

        StringBuilder sb = new StringBuilder();        
        sb.append("{\"comment\":\"").append(comment == null ? "" : UT.encodeURIComponent(comment)).append("\"}");

        return makeResponseJson(sb.toString());
    }
}
