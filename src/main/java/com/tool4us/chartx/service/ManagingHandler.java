package com.tool4us.chartx.service;

import static com.tool4us.chartx.AppSetting.OPT;
import static com.tool4us.chartx.AppResource.RES;

import com.tool4us.net.http.TomyRequestor;
import com.tool4us.net.http.TomyResponse;
import com.tool4us.net.http.ApiError;
import com.tool4us.net.http.ApiHandler;
import com.tool4us.net.http.TomyApi;



@TomyApi(paths={ "/manage" })
public class ManagingHandler extends ApiHandler
{
    @Override
    public String call(TomyRequestor req, TomyResponse res) throws Exception
    {
        // 파라미터 가져오기
        String checkCode = req.getParameter("checkCode");
        String actType = req.getParameter("actType");
        
        // 값 존재 여부 체크
        if( emptyCheck(checkCode, actType) )
        {
            // 없다면 파라미터 오류 반환
            return makeResponseJson(ApiError.MissingParameter);
        }
        
        if( !"rh".equals(checkCode) )
        {
            return makeResponseJson(ApiError.NotAuthorized);
        }
        
        if( "reload".equals(actType) )
        {
            OPT.reload();
            RES.reload();
        }
        

        return makeResponseJson(ApiError.Success);
    }
}
