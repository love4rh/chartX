package com.tool4us.chartx.service;

import static com.tool4us.chartx.AppSetting.OPT;

import java.io.File;

import com.tool4us.net.http.TomyRequestor;
import com.tool4us.net.http.TomyResponse;

import lib.turbok.common.ValueType;
import lib.turbok.data.FileMapStore;

import com.tool4us.net.http.ApiError;
import com.tool4us.net.http.ApiHandler;
import com.tool4us.net.http.TomyApi;



@TomyApi(paths={ "/gtx" })
public class GetDataHandler extends ApiHandler
{
    @Override
    public String call(TomyRequestor req, TomyResponse res) throws Exception
    {
        String authCode = req.getHeaderValue("x-auth-code");
        
        if( emptyCheck(authCode) )
            return makeResponseJson(ApiError.InvalidAuthCode);
        
        // TODO authCode 검증 로직 추가

        String pCode = req.getParameter("pCode");
        
        if( emptyCheck(pCode ) )
        	return makeResponseJson(ApiError.MissingParameter);
        
        // 데이터 가져오기
        String pathName = OPT.dataFolder() + File.separator + "P" + pCode + ".pmd";
        
        FileMapStore ds = FileMapStore.newInstance(pathName);
        if( ds == null )
            return makeResponseJson(ApiError.InvalidParameter);

        StringBuilder sb = new StringBuilder();
        
        sb.append("{");
        
        // chart --> X: 0, Y1:[1, 2], Y2:[3, 4, 5]
        sb.append("\"chart\":{ \"X\": 0, \"Y1\":[1, 2], \"Y2\":[3, 4, 5] }");
        
        // data --> title, columns( { name, type(string, number, datetime), data[] }), editable(false)
        sb.append(", \"data\":{");
        
        sb.append("\"title\":\"").append(pCode).append("\"");
        sb.append(",\"columns\":[");
        
        for(int c = 0; c < (int) ds.getColumnSize(); ++c)
        {
            if( c > 0 )
                sb.append(",");
            
            ValueType vt = ds.getColumnType(c);
            String typeStr = "string";
            
            if( vt == ValueType.DateTime )
                typeStr = "datetime";
            else if( vt == ValueType.Integer || vt == ValueType.Real )
                typeStr = "number";

            sb.append("{ \"name\":\"").append(ds.getColumnName(c)).append("\"");
            sb.append(", \"type\":\"").append(typeStr).append("\"");
            sb.append(", \"data\":[");
            
            for(long r = 0; r < ds.getRowSize(); ++r)
            {
                if( r > 0 )
                    sb.append(",");
                
                Object v = ds.getCell(c, r);
                if( "number".equals(typeStr) || v == null )
                    sb.append(v);
                else
                    sb.append("\"").append(v).append("\"");
            }

            sb.append("]}");
        }
        
        sb.append("]");
        sb.append(",\"editable\":false");
        sb.append("}");
        
        sb.append("}");
        
        ds.close();
        
        return makeResponseJson(sb.toString());
    }
}
