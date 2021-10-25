package com.tool4us.net.http;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.json.JSONObject;

/**
 * Apache HttpClient를 사용하기 쉽게  wrapping한 클래스.
 * 호출 후 종료 시 close() 꼭 호출해야 함.
 * 
 * @author TurboK
 */
public class TomyHttpClient
{
    private CloseableHttpClient     _client = null;
    private RequestConfig           _reqConfig = null;

    
    public TomyHttpClient()
    {
        _client = HttpClients.createDefault();
        
        _reqConfig = RequestConfig.custom()
            .setSocketTimeout(30 * 1000)
            .setConnectTimeout(30 * 1000)
            .setConnectionRequestTimeout(30 * 1000)
            .build();
    }
    
    public void close()
    {
        if( _client == null )
            return;

        try
        {
            _client.close();
            _client = null;
        }
        catch( IOException e )
        {
            // e.printStackTrace();
        }
    }
    
    // Apache HttpClient 용 Parameter Entity로 변경
    private List<NameValuePair> convertParam(Map<String, String> params)
    {
        List<NameValuePair> paramList = new ArrayList<NameValuePair>();
        
        for(Entry<String, String> elem : params.entrySet())
        {
            paramList.add( new BasicNameValuePair(elem.getKey(), elem.getValue()) );
        }

        return paramList;
    }
    
    public int statusCode(HttpResponse res)
    {
        return res.getStatusLine().getStatusCode();
    }
    
    public String responseText(HttpResponse res) throws Exception
    {   
        return EntityUtils.toString(res.getEntity());
    }

    /**
     * call by GET
     * @param url
     * @param headers
     * @param params    url 뒤에 ?param=value&... 형태로 추가됨
     * @param encoding  파라미터 인코딩 방식. UTF-8
     * @return
     * @throws IOException
     */
    public HttpResponse GET(String url, Map<String, String> headers, Map<String, String> params, String encoding) throws IOException
    {
        HttpGet httpMethod = null;
        
        if( params != null )
        {
            List<NameValuePair> paramList = convertParam(params);
            url = url + "?" + URLEncodedUtils.format(paramList, encoding);
        }

        httpMethod = new HttpGet(url);
        
        if( headers != null )
        {
            for(Entry<String, String> elem : headers.entrySet())
            {
                httpMethod.setHeader(elem.getKey(), elem.getValue());
            }
        }
        
        if( _reqConfig != null )
        {
            httpMethod.setConfig(_reqConfig);
        }

        return _client.execute(httpMethod);
    }
    
    public HttpResponse GET(String url, Map<String, String> headers, Map<String, String> params) throws IOException
    {
        return this.GET(url, headers, params, "UTF-8");
    }

    public HttpResponse GET(String url, Map<String, String> headers) throws IOException
    {
        return this.GET(url, headers, null, "UTF-8");
    }

    public HttpResponse GET(String url) throws IOException
    {
        return this.GET(url, null, null, "UTF-8");
    }

    /**
     * call by POST
     * @param url
     * @param headers
     * @param params    Form 형태의 parameter로 전송됨
     * @param encoding  파라미터 값 인코딩 방식. UTF-8
     * @return
     * @throws IOException
     */
    public HttpResponse POST(String url, Map<String, String> headers, Map<String, String> params, String encoding) throws IOException
    {
        HttpPost httpMethod = new HttpPost(url);
        
        if( headers != null )
        {
            for(Entry<String, String> elem : headers.entrySet())
            {
                httpMethod.setHeader(elem.getKey(), elem.getValue());
            }
        }

        if( params != null )
        {
            List<NameValuePair> httpParamList = convertParam(params);
            UrlEncodedFormEntity entity = new UrlEncodedFormEntity(httpParamList, encoding);
            httpMethod.setEntity(entity);
        }
        
        if( _reqConfig != null )
        {
            httpMethod.setConfig(_reqConfig);
        }

        return _client.execute(httpMethod);
    }
    
    public HttpResponse POST(String url, Map<String, String> headers, Map<String, String> params) throws IOException
    {
        return this.POST(url, headers, params, "UTF-8");
    }
    
    public HttpResponse POST(String url, Map<String, String> headers) throws IOException
    {
        return this.POST(url, headers, null, "UTF-8");
    }
    
    public HttpResponse POST(String url) throws IOException
    {
        return this.POST(url, null, null, "UTF-8");
    }
    
    public HttpResponse POST(String url, Map<String, String> headers, String bodyText) throws IOException
    {
        HttpPost httpMethod = new HttpPost(url);
        
        if( headers != null )
        {
            for(Entry<String, String> elem : headers.entrySet())
            {
                httpMethod.setHeader(elem.getKey(), elem.getValue());
            }
        }
        
        httpMethod.setEntity( new StringEntity(bodyText));
        
        if( _reqConfig != null )
        {
            httpMethod.setConfig(_reqConfig);
        }

        return _client.execute(httpMethod);
    }
    
    public HttpResponse POST(String url, String bodyText) throws IOException
    {
        return POST(url, null, bodyText);
    }
    
    public HttpResponse POST(String url, Map<String, String> headers, JSONObject jsonData) throws IOException
    {
        HttpPost httpMethod = new HttpPost(url);
        
        httpMethod.setHeader("Content-type", "application/json");
        
        if( headers != null )
        {
            for(Entry<String, String> elem : headers.entrySet())
            {
                httpMethod.setHeader(elem.getKey(), elem.getValue());
            }
        }
        
        httpMethod.setEntity( new StringEntity(jsonData.toString()));
        
        if( _reqConfig != null )
        {
            httpMethod.setConfig(_reqConfig);
        }

        return _client.execute(httpMethod);
    }
    
    public HttpResponse POST(String url,JSONObject jsonData) throws IOException
    {
        return POST(url, null, jsonData);
    }
}
