package com.tool4us.chartx.service;

import static com.tool4us.common.Util.UT;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.List;

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



@TomyApi(paths={ "/fav" })
public class GetFavoritesHandler extends ApiHandler
{
    @Override
    public String call(TomyRequestor req, TomyResponse res) throws Exception
    {
        if( !UT.checkAuthCode(req, false) )
            return makeResponseJson(ApiError.InvalidAuthCode);
        
        String id = req.getParameter("uid");
        
        if( emptyCheck(id) )
        	return makeResponseJson(ApiError.MissingParameter);
        
        JSONObject fav = AM.getFavorites(id);
        
        if( fav == null )
        {
            return makeResponseJson("{}");
        }

        List<JSONObject> retList = new ArrayList<JSONObject>();
        JSONObject commentObj = new JSONObject();

        String yyyymmdd = UsefulTool.ConvertDateToString(new Date(), "yyyyMMdd");

        for(String code : fav.keySet())
        {
            JSONObject obj = fav.getJSONObject(code);

            if( !obj.getBoolean("isSet") )
                continue;

            obj.put("code", code);

            String startDate = obj.has("start") ? obj.getString("start") : obj.getString("created");
            String lastDate = obj.has("last") ? obj.getString("last") : yyyymmdd;

            if( !obj.has("stat") )
            {
                JSONArray prList = ChartTool.getPriceFromExternal(code, startDate, lastDate);

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
                    obj.put("stat", rList);
                }
            }
            
            obj.put("start", startDate);
            obj.put("last", lastDate);

            String comment = AM.getComments(id, code);
            if( comment != null ) {
                commentObj.put(code, UT.encodeURIComponent(comment));
            }
            
            retList.add(obj);
        }
        
        retList.sort(new Comparator<JSONObject>()
        {
            @Override
            public int compare(JSONObject o1, JSONObject o2)
            {
                return o1.getString("start").compareTo( o2.getString("start") );
            }
        });
        
        JSONArray retAr = new JSONArray();
        for(JSONObject tmpObj : retList)
        {
            retAr.put(tmpObj);
        }

        JSONObject retObj = new JSONObject();

        retObj.put("favorites", retAr);
        retObj.put("comment", commentObj);

        return makeResponseJson(retObj);
    }
}
