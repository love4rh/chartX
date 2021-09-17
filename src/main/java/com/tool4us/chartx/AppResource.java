package com.tool4us.chartx;

import static com.tool4us.chartx.AppSetting.OPT;

import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.ConcurrentSkipListMap;

import com.tool4us.common.Logs;

import lib.turbok.util.TextFileLineReader;
import lib.turbok.util.UsefulTool;



public enum AppResource
{
    RES;
    
    
    private Map<String, String[]>   _itemCodes = new ConcurrentSkipListMap<String, String[]>();
    
    
    private AppResource()
    {
        //
    }
    
    public void reload()
    {
        Logs.info("Application Resource Loading...");
        
        String codesFile = OPT.getCodesFile();
        
        TextFileLineReader in = null;
        
        try
        {
            Map<String, String[]> itemMap = new ConcurrentSkipListMap<String, String[]>();
            
            System.out.println(codesFile);
            
            in = new TextFileLineReader(codesFile, "UTF-8");
            String lineText = in.getNextLine(); // 제목
            
            lineText = in.getNextLine();
            while( lineText != null )
            {
                String[] ar = UsefulTool.SplitLineText(lineText, "\t", false, true);
                
                itemMap.put(ar[0], ar);
                
                lineText = in.getNextLine();
            }
            
            _itemCodes = itemMap;
        }
        catch( Exception xe )
        {
            Logs.trace(xe);
        }
        finally
        {
            if( in != null )
                in.close();
        }
    }
    
    public String getCodesAsJSON()
    {
        StringBuilder sb = new StringBuilder();
        
        sb.append("[");
        
        int count = 0;
        for(Entry<String, String[]> item : _itemCodes.entrySet())
        {
            String[] v = item.getValue();
            
            if( count > 0 )
                sb.append(",");
            
            sb.append("{");
            
            sb.append("\"code\":\"").append(item.getKey()).append("\"");
            sb.append(", \"name\":\"").append(v[2]).append("\"");
            sb.append(", \"english\":\"").append(v[4]).append("\"");
            sb.append(", \"ipoDate\":\"").append(v[5]).append("\"");
            sb.append(", \"market\":\"").append(v[6]).append("\"");
            sb.append(", \"category\":\"").append(v[8]).append("\""); // 소속부
            // sb.append(", \"kind\":\"").append(v[9]).append("\""); // 주식 종류 (보통주, 우선주)
            sb.append(", \"business\":\"").append(v[12]).append("\""); // 업종

            sb.append("}");
            
            count += 1;
        }
        
        sb.append("]");
        
        
        return sb.toString();
    }
    
}
