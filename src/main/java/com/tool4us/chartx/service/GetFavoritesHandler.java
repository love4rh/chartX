package com.tool4us.chartx.service;

import static com.tool4us.common.Util.UT;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

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

        List<String> codeList = new ArrayList<String>();
        Set<String> dateSet = new TreeSet<String>();
        
        JSONObject commentObj = new JSONObject();
        
        String yyyymmdd = UsefulTool.ConvertDateToString(new Date(), "yyyyMMdd");
        
        dateSet.add(yyyymmdd);

        Set<String> codes = fav.keySet();
        
        for(String code : codes)
        {
            codeList.add(code);
            JSONObject obj = fav.getJSONObject(code);
            
            if( obj.getBoolean("isSet") )
            {
                if( obj.has("start" ))
                    dateSet.add(obj.getString("start"));
                else
                    dateSet.add(obj.getString("modified"));
                
                if( obj.has("last") )
                {
                    dateSet.add(obj.getString("last"));
                }
            }
            
            String comment = AM.getComments(id, code);
            if( comment != null ) {
                commentObj.put(code, UT.encodeURIComponent(comment));
            }
        }
        
        List<String> dateList = new ArrayList<String>();
        for(String tmpStr : dateSet)
        {
            dateList.add(tmpStr);
        }
        
        JSONObject priceObj = ChartTool.queryPrice(codeList, dateList);
        
        JSONObject retObj = new JSONObject();
        retObj.put("favorites", fav);
        retObj.put("price", priceObj);
        retObj.put("comment", commentObj);
        retObj.put("lastDate", yyyymmdd);

        return makeResponseJson(retObj);
    }
}
