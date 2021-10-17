package com.tool4us.chartx.service;

import static com.tool4us.common.Util.UT;
import static com.tool4us.common.AccountManager.AM;

import com.tool4us.net.http.TomyRequestor;
import com.tool4us.net.http.TomyResponse;

import com.tool4us.net.http.ApiError;
import com.tool4us.net.http.ApiHandler;
import com.tool4us.net.http.TomyApi;



@TomyApi(paths={ "/edit" })
public class SetCommentHandler extends ApiHandler
{
    @Override
    public String call(TomyRequestor req, TomyResponse res) throws Exception
    {
        if( !UT.checkAuthCode(req, false) )
            return makeResponseJson(ApiError.InvalidAuthCode);
        
        String uid = req.bodyParameter("id");
        String pCode = req.bodyParameter("code");
        String type = req.bodyParameter("act"); // add, remove
        String comment = req.bodyParameter("comment");
        
        if( emptyCheck(pCode, uid, type) )
        	return makeResponseJson(ApiError.MissingParameter);

        if( "remove".equals(type) )
        {
            AM.removeComments(uid, pCode);
        }
        else if( "add".equals(type) )
        {
            if( emptyCheck(comment) )
                return makeResponseJson(ApiError.MissingParameter);
            
            AM.addComments(uid, pCode, UT.decodeURIComponent(comment));
        }

        return makeResponseJson(ApiError.Success);
    }
}
