package com.tool4us.chartx.service;

import org.json.JSONObject;

import com.tool4us.net.http.TomyRequestor;
import com.tool4us.net.http.TomyResponse;
import com.tool4us.net.http.ApiHandler;
import com.tool4us.net.http.TomyApi;



@TomyApi(paths={ "/ping" })
public class PingHandler extends ApiHandler
{
    @Override
    public String call(TomyRequestor req, TomyResponse res) throws Exception
    {
        // 있다면 정상 루틴 실행
        JSONObject retObj = new JSONObject();

        retObj.put("greetings", "Hello pingger!!");
        
        return makeResponseJson(retObj);
    }
}
