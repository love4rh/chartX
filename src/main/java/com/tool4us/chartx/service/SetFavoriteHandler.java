package com.tool4us.chartx.service;

import static com.tool4us.common.Util.UT;

import java.util.Date;

import org.json.JSONArray;
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
            
            String startDate = compObj.has("start") ? compObj.getString("start") : compObj.getString("created");
            String lastDate = compObj.has("last") ? compObj.getString("last") : yyyymmdd;
            
            JSONArray prList = ChartTool.getPriceFromExternal(compCode, startDate, lastDate);

            int count = prList == null ? 0 : prList.length();

            long prBasis = -1;
            Date dtBasis = null;
            JSONArray rList = new JSONArray();

            for(int i = 1; i < count; ++i)
            {
                JSONArray rec = prList.getJSONArray(i);

                long pr = rec.getLong(4);
                lastDate = rec.getString(0);
                Date dt = UsefulTool.ConvertStringToDate(lastDate, "yyyyMMdd");

                if( i == 1 )
                {
                    prBasis = pr;
                    startDate = lastDate;
                    dtBasis = dt;
                }

                JSONObject item = new JSONObject();

                item.put("price", pr);
                item.put("dayDiff", Math.round( (dt.getTime() - dtBasis.getTime()) / 86400000 ) );
                item.put("ratio", (double) (pr - prBasis) / (double) prBasis * 100.0 );

                rList.put(item);
            }
            
            if( prBasis > 0 )
            {
                compObj.put("stat", rList);
            }
            
            JSONObject retObj = new JSONObject();
            
            retObj.put("favorite", compObj);
            
            return makeResponseJson(retObj);
        }

        return makeResponseJson(ApiError.Success);
    }
}
