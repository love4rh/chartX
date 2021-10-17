package com.tool4us.chartx.service;

import static com.tool4us.common.Util.UT;
import static com.tool4us.common.AccountManager.AM;

import com.tool4us.net.http.TomyRequestor;
import com.tool4us.net.http.TomyResponse;

import com.tool4us.net.http.ApiError;
import com.tool4us.net.http.ApiHandler;
import com.tool4us.net.http.TomyApi;



@TomyApi(paths={ "/set" })
public class SetFavoriteHandler extends ApiHandler
{
    @Override
    public String call(TomyRequestor req, TomyResponse res) throws Exception
    {
        if( !UT.checkAuthCode(req, false) )
            return makeResponseJson(ApiError.InvalidAuthCode);
        
        String id = req.bodyParameter("id");
        String compCode = req.bodyParameter("code");
        String flag = req.bodyParameter("flag");
        
        if( emptyCheck(id, compCode, flag) )
            return makeResponseJson(ApiError.MissingHeader);
        
        AM.setFavorite(id, compCode, "true".equals(flag));
        
        return makeResponseJson(ApiError.Success);
    }
}
