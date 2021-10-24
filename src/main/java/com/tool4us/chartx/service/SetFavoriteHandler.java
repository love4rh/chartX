package com.tool4us.chartx.service;

import static com.tool4us.common.Util.UT;

import java.util.Date;

import org.json.JSONObject;

import static com.tool4us.common.AccountManager.AM;

import com.tool4us.net.http.TomyRequestor;
import com.tool4us.net.http.TomyResponse;

import lib.turbok.util.UsefulTool;

import com.tool4us.chartx.util.ChartTool;
import com.tool4us.net.http.ApiError;
import com.tool4us.net.http.ApiHandler;
import com.tool4us.net.http.TomyApi;



/**
 * Favorites의 속성 변경. 지정 여부, 관심일자 조정
 * @author TurboK
 */
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
        String returnData = req.bodyParameter("returnData");
        JSONObject obj = (JSONObject) req.bodyParameterAsObject("values");
        
        if( obj == null || emptyCheck(id, compCode) )
            return makeResponseJson(ApiError.MissingHeader);

        JSONObject compObj = AM.setFavorite(id, compCode, obj);
        
        if( "true".equals(returnData) )
        {
            String yyyymmdd = UsefulTool.ConvertDateToString(new Date(), "yyyyMMdd");
            
            // 변경된 값을 추려서 같이 보냄
            JSONObject priceObj = ChartTool.queryPrice( new String[] { compCode },
                new String[] {
                      compObj.has("start") ? compObj.getString("start") : compObj.getString("modified")
                    , compObj.has("last") ? compObj.getString("last") : yyyymmdd
                }
            );
            
            JSONObject retObj = new JSONObject();
            
            retObj.put("favorite", compObj);
            retObj.put("price", priceObj);
            retObj.put("lastDate", yyyymmdd);
            
            return makeResponseJson(retObj);
        }

        return makeResponseJson(ApiError.Success);
    }
}
