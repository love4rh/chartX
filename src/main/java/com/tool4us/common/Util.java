package com.tool4us.common;

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Base64.Decoder;
import java.util.Base64.Encoder;
import java.util.Map;
import java.util.TreeMap;

import org.json.JSONArray;
import org.json.JSONObject;

import com.tool4us.net.http.TomyRequestor;

import lib.turbok.common.ITabularData;
import lib.turbok.data.Column;
import lib.turbok.data.Columns;



public enum Util
{
    UT;
    
    private Map<String, String>     _mimeTypeMap;
    
    
    private Util()
    {
        _mimeTypeMap = new TreeMap<String, String>();
        
        // https://3jini.tistory.com/39 참고
        _mimeTypeMap.put(".html",    "text/html");
        _mimeTypeMap.put(".htm",     "text/html");
        _mimeTypeMap.put(".shtml",   "text/html");
        _mimeTypeMap.put(".css",     "text/css");
        _mimeTypeMap.put(".xml",     "text/xml");
        _mimeTypeMap.put(".mml",     "text/mathml");
        _mimeTypeMap.put(".txt",     "text/plain");
        _mimeTypeMap.put(".csv",     "text/plain");
        _mimeTypeMap.put(".jad",     "text/vnd.sun.j2me.app-descriptor");
        _mimeTypeMap.put(".wml",     "text/vnd.wap.wml");
        _mimeTypeMap.put(".htc",     "text/x-component");
        
        _mimeTypeMap.put(".gif",     "image/gif");
        _mimeTypeMap.put(".jpeg",    "image/jpeg");
        _mimeTypeMap.put(".jpg",     "image/jpeg");
        _mimeTypeMap.put(".png",     "image/png");
        _mimeTypeMap.put(".tif",     "image/tiff");
        _mimeTypeMap.put(".tiff",    "image/tiff");
        _mimeTypeMap.put(".wbmp",    "image/vnd.wap.wbmp");
        _mimeTypeMap.put(".ico",     "image/x-icon");
        _mimeTypeMap.put(".jng",     "image/x-jng");
        _mimeTypeMap.put(".bmp",     "image/x-ms-bmp");
        _mimeTypeMap.put(".svg",     "image/svg+xml");
        _mimeTypeMap.put(".svgz",    "image/svg+xml");
        _mimeTypeMap.put(".webp",    "image/webp");
        
        _mimeTypeMap.put(".js",      "application/x-javascript");
        _mimeTypeMap.put(".atom",    "application/atom+xml");
        _mimeTypeMap.put(".rss",     "application/rss+xml");
        _mimeTypeMap.put(".jar",     "application/java-archive");
        _mimeTypeMap.put(".war",     "application/java-archive");
        _mimeTypeMap.put(".ear",     "application/java-archive");
        _mimeTypeMap.put(".hqx",     "application/mac-binhex40");
        _mimeTypeMap.put(".doc",     "application/msword");
        _mimeTypeMap.put(".pdf",     "application/pdf");
        _mimeTypeMap.put(".ps",      "application/postscript");
        _mimeTypeMap.put(".eps",     "application/postscript");
        _mimeTypeMap.put(".ai",      "application/postscript");
        _mimeTypeMap.put(".rtf",     "application/rtf");
        _mimeTypeMap.put(".xls",     "application/vnd.ms-excel");
        _mimeTypeMap.put(".ppt",     "application/vnd.ms-powerpoint");
        _mimeTypeMap.put(".wmlc",    "application/vnd.wap.wmlc");
        _mimeTypeMap.put(".kml",     "application/vnd.google-earth.kml+xml");
        _mimeTypeMap.put(".kmz",     "application/vnd.google-earth.kmz");
        _mimeTypeMap.put(".7z",      "application/x-7z-compressed");
        _mimeTypeMap.put(".cco",     "application/x-cocoa");
        _mimeTypeMap.put(".jardiff", "application/x-java-archive-diff");
        _mimeTypeMap.put(".jnlp",    "application/x-java-jnlp-file");
        _mimeTypeMap.put(".run",     "application/x-makeself");
        _mimeTypeMap.put(".pl",      "application/x-perl");
        _mimeTypeMap.put(".pm",      "application/x-perl");
        _mimeTypeMap.put(".prc",     "application/x-pilot");
        _mimeTypeMap.put(".pdb",     "application/x-pilot");
        _mimeTypeMap.put(".rar",     "application/x-rar-compressed");
        _mimeTypeMap.put(".rpm",     "application/x-redhat-package-manager");
        _mimeTypeMap.put(".sea",     "application/x-sea");
        _mimeTypeMap.put(".swf",     "application/x-shockwave-flash");
        _mimeTypeMap.put(".sit",     "application/x-stuffit");
        _mimeTypeMap.put(".tcl",     "application/x-tcl");
        _mimeTypeMap.put(".tk",      "application/x-tcl");
        _mimeTypeMap.put(".der",     "application/x-x509-ca-cert");
        _mimeTypeMap.put(".pem",     "application/x-x509-ca-cert");
        _mimeTypeMap.put(".crt",     "application/x-x509-ca-cert");
        _mimeTypeMap.put(".xpi",     "application/x-xpinstall");
        _mimeTypeMap.put(".xhtml",   "application/xhtml+xml");
        _mimeTypeMap.put(".zip",     "application/zip");
        
        _mimeTypeMap.put(".mid",     "audio/midi");
        _mimeTypeMap.put(".midi",    "audio/midi");
        _mimeTypeMap.put(".kar",     "audio/midi");
        _mimeTypeMap.put(".mp3",     "audio/mpeg");
        _mimeTypeMap.put(".ogg",     "audio/ogg");
        _mimeTypeMap.put(".m4a",     "audio/x-m4a");
        _mimeTypeMap.put(".ra",      "audio/x-realaudio");
        
        _mimeTypeMap.put(".3gpp",    "video/3gpp");
        _mimeTypeMap.put(".3gp",     "video/3gpp");
        _mimeTypeMap.put(".mp4",     "video/mp4");
        _mimeTypeMap.put(".mpeg",    "video/mpeg");
        _mimeTypeMap.put(".mpg",     "video/mpeg");
        _mimeTypeMap.put(".mov",     "video/quicktime");
        _mimeTypeMap.put(".webm",    "video/webm");
        _mimeTypeMap.put(".flv",     "video/x-flv");
        _mimeTypeMap.put(".m4v",     "video/x-m4v");
        _mimeTypeMap.put(".mng",     "video/x-mng");
        _mimeTypeMap.put(".asx",     "video/x-ms-asf");
        _mimeTypeMap.put(".asf",     "video/x-ms-asf");
        _mimeTypeMap.put(".wmv",     "video/x-ms-wmv");
        _mimeTypeMap.put(".avi",     "video/x-msvideo");
    }
    
    public long tickCount()
    {
        return System.currentTimeMillis();
    }

    /**
     * JSON 문자열을 받아 파싱하여 JSONObject로 반환. Exception 등이 발생하면 null.
     * 코드 상에서 try ~ catch 하기 애매한 경우 사용.
     */
    public JSONObject parseJSON(String jsonStr)
    {
        JSONObject obj = null;
        
        try
        {
            obj = new JSONObject(jsonStr);
        }
        catch(Exception xe)
        {
            obj = null;
        }
        
        return obj;
    }
    
    /**
     * 확장자만 분리하여 반환. '.' 포함.
     */
    public String getExtension(String filePath)
    {
        int pos = filePath.lastIndexOf(".");
        
        return pos != -1 ? filePath.substring(pos) : "";
    }
    
    /**
     * 확장자에 따른 MIME type 반환. '.txt' --> 'plain/text'
     */
    public String getExtensionMimeType(String extension)
    {
        String mimeType = _mimeTypeMap.get(extension);
        return mimeType != null ? mimeType : "application/octet-stream";
    }

    /**
     * 지정한 자리수의 랜덤 문자열 생성. ID 등을 임의로 생성할 때 유용.
     */
    public String makeRandomeString(int length)
    {
        final String possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        
        StringBuilder sb = new StringBuilder(length);

        for(int i = 0; i < length; ++i)
        {
            sb.append( possible.charAt( (int) Math.floor(Math.random() * possible.length()) ) );
        }
        
        return sb.toString();
    }
    
    /**
     * Carriage Return을 제거하여 한 줄로 만든 문자열 반환. 로깅 등에 활용. 
     */
    public String makeSingleLine(String text)
    {
        if( text == null || text.isEmpty() )
            return "";

        return text.replace("\r\n", "").replace("\r", "").replace("\n", "");
    }
    
    public boolean isValidString(String text)
    {
        return text != null && !text.isEmpty();
    }
    
    public Object NVL(Object value, Object defVal)
    {
    	return value == null ? defVal : value;
    }
    
    public String makeEllipsis(String text, int limit)
    {
        return text.length() <= limit ? text : text.substring(0, limit - 3) + "...";
    }
    
    /**
     * Exception 없는 숫자 변환. 변환할 수 없는 경우에는 null 반환함.
     */
    public Long parseLong(String s)
    {
        Long l = null;
        
        try
        {
            l = Long.parseLong(s);
        }
        catch(Exception xe)
        {
            l = null;
        }
        
        return l;
    }

    /**
     * Exception 없는 실수 변환. 변환할 수 없는 경우에는 null 반환함.
     */
    public Double parseDouble(String s)
    {;
        Double d = null;
        
        try
        {
            d = Double.parseDouble(s);
        }
        catch(Exception xe)
        {
            d = null;
        }
        
        return d;
    }
    
    public JSONArray columnsToJsonArray(Columns columns)
    {
    	JSONArray ar = new JSONArray();
    	
    	for(int i = 0; i < columns.size(); ++i)
    	{
    		JSONObject obj = new JSONObject();
    		Column col =  columns.getColumn(i);
    		
    		obj.put("name", col.getName());
    		obj.put("type", col.getValueType().toString());
    		
    		ar.put(obj);
    	}
    	
    	return ar;
    }
    
    public JSONArray columnsToJsonArray(ITabularData ds)
    {
    	JSONArray ar = new JSONArray();
    	
    	for(int i = 0; i < ds.getColumnSize(); ++i)
    	{
    		JSONObject obj = new JSONObject();
    		
    		obj.put("name", ds.getColumnName(i));
    		obj.put("type", ds.getColumnType(i).toString());
    		
    		ar.put(obj);
    	}
    	
    	return ar;
    }
    
    public JSONObject recordsToJsonArray(JSONObject obj, ITabularData ds, long begin, long end)
    {
    	JSONArray ar = new JSONArray();
    	
    	long r = begin;
    	long recCount = ds.getRowSize();
    	while( r < recCount && r <= end )
    	{
    		JSONArray rec = new JSONArray();
    		for(long c = 0; c < ds.getColumnSize(); ++c)
    		{
    			Object value = null;
    			
    			try
    			{
    				value = ds.getCell(c, r);
    			}
    			catch(Exception xe)
    			{
    				value = null;
    			}
    			
    			if( value != null )
					rec.put(value);
    			else
    				rec.put("$$null$$"); // I need a fancy way to represent null value.
    		}
    		
    		ar.put(rec);
    		r += 1;
    	}
    	
    	obj.put("dataBegin", begin);
    	obj.put("dataEnd", r - 1);
    	obj.put("data", ar);
    	
    	return obj;
    }
    
    public String textWithDelimiter(int[] list)
    {
        StringBuilder sb = new StringBuilder();
        
        for(int i = 0; i < list.length; ++i)
        {
            if( i > 0 )
                sb.append(", ");
                
            sb.append(list[i]);
        }
        
        return sb.toString();
    }
    
    public String generateMD5(String data)
    {
        String mdCode = "";

        try
        {
            MessageDigest md = MessageDigest.getInstance("MD5");
            md.update(data.getBytes());

            byte[] bytes = md.digest();
            
            StringBuilder sb = new StringBuilder();

            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            
            mdCode = sb.toString();
        }
        catch( Exception xe )
        {
            
        }
        
        return mdCode;
    }
    
    public String generateSHA256(String data)
    {
        String mdCode = "";

        try
        {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(data.getBytes());

            byte[] bytes = md.digest();
            
            StringBuilder sb = new StringBuilder();

            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            
            mdCode = sb.toString();
        }
        catch( Exception xe )
        {
            
        }
        
        return mdCode;
    }
    
    public boolean checkAuthCode(TomyRequestor req, boolean first)
    {
        String authCode = req.getHeaderValue("x-auth-code");
        String userRandom = req.getHeaderValue("x-user-token");
        String timestamp = req.getHeaderValue("x-timestamp");
        
        if( authCode == null || authCode.isEmpty() 
            || userRandom == null || userRandom.isEmpty()
            || timestamp == null || timestamp.isEmpty() )
        {
            return false;
        }
        
        String compCode = first
            ? generateSHA256(timestamp + userRandom + timestamp)
            : generateSHA256(timestamp + userRandom + timestamp); // TODO user-token별 발급된 코드를 활용하도록 수정
        
        return authCode.equals(compCode);
    }
    
    public String encodeBase64(String msg)
    {
        byte[] target = msg.getBytes();
        
        Encoder encoder = Base64.getEncoder();
        byte[] encodedBytes = encoder.encode(target);

        return new String(encodedBytes);
    }
    
    public String decodeBase64(String encoded)
    {
        byte[] target = encoded.getBytes();
        
        Decoder decoder = Base64.getDecoder();
        byte[] decodedBytes = decoder.decode(target);
        
        return new String(decodedBytes);
    }
    
    public String encodeURIComponent(String s)
    {
        String result = null;
   
        try
        {
            result = URLEncoder.encode(s, "UTF-8")
               .replaceAll("\\+", "%20")
               .replaceAll("\\%21", "!")
               .replaceAll("\\%27", "'")
               .replaceAll("\\%28", "(")
               .replaceAll("\\%29", ")")
               .replaceAll("\\%7E", "~");
        }
        catch( Exception xe )
        {
            result = s;
        }
   
        return result;
    }
    
    public String decodeURIComponent(String s)
    {
        String r = null;
        
        try
        {
            r = URLDecoder.decode(s, "UTF-8");
        }
        catch(Exception xe)
        {
            r = s;
        }
        
        return r;
    }
}
