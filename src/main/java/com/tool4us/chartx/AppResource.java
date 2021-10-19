package com.tool4us.chartx;

import static com.tool4us.chartx.AppSetting.OPT;

import java.util.ArrayList;
import java.util.List;
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
    
    private List<String>    _bpList = null;
    private List<String>    _newBPList = null;
    
    
    private AppResource()
    {
        //
    }
    
    public void reload()
    {
        Logs.info("Application Resource Loading...");
        
        loadCodes();
        loadBuyPoint();
    }
    
    public void loadCodes()
    {   
        String codesFile = OPT.getCodesFile();
        
        TextFileLineReader in = null;
        
        try
        {
            Map<String, String[]> itemMap = new ConcurrentSkipListMap<String, String[]>();
            
            in = new TextFileLineReader(codesFile, "UTF-8");
            String lineText = in.getNextLine(); // 제목
            
            lineText = in.getNextLine();
            while( lineText != null )
            {
                String[] ar = UsefulTool.SplitLineText(lineText, "\t", false, true);
                
                if( ar[0].endsWith("0") && !ar[0].startsWith("9") )
                {
                    itemMap.put(ar[0], ar);
                }
                
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
    
    public void loadBuyPoint()
    {   
        _bpList = _loadBuyPoint( OPT.getBuyPointFile() );
        _newBPList = _loadBuyPoint( OPT.getNewBuyPointFile() );
    }
    
    public List<String> _loadBuyPoint(String bpFile)
    {
        TextFileLineReader in = null;
        List<String> itemList = new ArrayList<String>();
        
        try
        {
            in = new TextFileLineReader(bpFile, "UTF-8");
            String lineText = in.getNextLine(); // 제목
            
            lineText = in.getNextLine();
            while( lineText != null )
            {
                String[] ar = UsefulTool.SplitLineText(lineText, "\t", false, true);
                
                itemList.add(ar[0]);
                
                lineText = in.getNextLine();
            }
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
        
        return itemList;
    }
    
    // 반환값: 단축코드(0), 표준코드, 한글 종목명(2), 한글 종목약명, 영문명, 상장일(5), 시장구분, 증권구분, 소속부, 주식종류, 액면가(10), 상장주식수, 업종(12)
    public String[] getCodeDetail(String code)
    {
        return _itemCodes.get(code);
    }
    
    public String getCodeTitle(String code)
    {
        if( code.endsWith("B") )
            code = code.substring(0, code.length() - 1);
        
        String[] compInfo = getCodeDetail(code);
        
        return (compInfo == null ? "Unknown" : compInfo[3]) + " (" + code + ")";
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
            sb.append(", \"name\":\"").append(v[3]).append("\"");
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
    
    // all - true: 전체, false: 신규 항목만
    public List<String> getBuyPointCodes(boolean all)
    {
        return all ? _bpList : _newBPList;
    }
    
}
