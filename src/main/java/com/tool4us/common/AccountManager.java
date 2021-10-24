package com.tool4us.common;

import static com.tool4us.chartx.AppSetting.OPT;
import static com.tool4us.common.Util.UT;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.util.Date;
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.ConcurrentSkipListMap;
import java.util.concurrent.atomic.AtomicBoolean;

import org.json.JSONArray;
import org.json.JSONObject;

import lib.turbok.util.UsefulTool;



public enum AccountManager
{
    AM;
    
    private String      _accountFile;
    
    private Map<String, JSONObject>    _accountMap = null;
    private Map<String, JSONObject>    _accountData = null;
    private Map<String, Boolean>       _accountModified = null;
    
    private AtomicBoolean   _modified = new AtomicBoolean(false);
    
    
    private AccountManager()
    {
        _accountMap = new ConcurrentSkipListMap<String, JSONObject>();
        _accountData = new ConcurrentSkipListMap<String, JSONObject>();
        _accountModified = new ConcurrentSkipListMap<String, Boolean>();
        
        // TODO REMOVE
        this.addAccount("a", "a");
        this.addAccount("b", "b");
    }
    
    public JSONObject readJSONFromFile(String jsonFile)
    {
        BufferedReader in = null;
        JSONObject jsonObj = null;
        File f = new File(jsonFile);
        
        if( !f.exists() )
            return jsonObj;
        
        try
        {
            in = new BufferedReader(new InputStreamReader(new FileInputStream(f), "UTF-8"));
            
            StringBuilder sb = new StringBuilder();
            String lineText = in.readLine();
            while( lineText != null )
            {
                sb.append( lineText ).append("\n");
                lineText = in.readLine();
            }

            jsonObj = new JSONObject(sb.toString());

            
        }
        catch(Exception xe)
        {
            Logs.trace(xe);
        }
        finally
        {
            if( in != null )
            {
                try { in.close(); } catch(Exception xe) {}
            }
        }
        
        return jsonObj;
    }
    
    public void saveJSONToFile(JSONObject obj, String pathName)
    {
        BufferedWriter out = null;
        
        try
        {
            out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(pathName), "UTF-8"));
            out.write(obj.toString());
        }
        catch(Exception xe)
        {
            Logs.trace(xe);
        }
        finally
        {
            if( out != null )
            {
                try { out.close(); } catch(Exception xe) {}
            }
        }
    }

    public void initialize(String dataFile)
    {
        _accountFile = dataFile;
        
        JSONObject jsonObj = this.readJSONFromFile(dataFile);
        
        if( jsonObj == null )
            return;
        
        JSONArray accountList = (JSONArray) jsonObj.get("accounts");

        for(int i = 0; i < accountList.length(); ++i)
        {
            JSONObject account = (JSONObject) accountList.get(i);
            _accountMap.put((String) account.get("id"), account) ;
        }
    }
    
    public void save()
    {
        if( !_accountModified.isEmpty() )
        {
            for(Entry<String, Boolean> elem : _accountModified.entrySet())
            {
                String id = elem.getKey();
                JSONObject accObj = _accountMap.get(id);
    
                if( accObj == null )
                    continue;
                
                String userFile = OPT.getUserFolder() + File.separator + accObj.getString("hash") + ".json";
    
                Logs.info("[Account] save data of {}", id);
                saveJSONToFile(_accountData.get(id), userFile);
            }
            
            _accountModified = new ConcurrentSkipListMap<String, Boolean>();
        }

        if( _modified.getAndSet(false) )
            return;
        
        BufferedWriter out = null;
        
        try
        {
            out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(_accountFile), "UTF-8"));
            
            out.write("{\"accounts\":[");
            
            boolean written = false;
            for(Entry<String, JSONObject> elem : _accountMap.entrySet())
            {
                if( written )
                    out.write("\n,");
                
                out.write( elem.getValue().toString() );
                written = true;
            }

            out.write("]}");
        }
        catch(Exception xe)
        {
            Logs.trace(xe);
        }
        finally
        {
            if( out != null )
            {
                try { out.close(); } catch(Exception xe) {}
            }
        }
    }
    
    public boolean addAccount(String id, String pw)
    {
        if( _accountMap.containsKey(id) )
            return false;
        
        JSONObject obj = new JSONObject();
        
        obj.put("id", id);
        obj.put("pw", UT.generateSHA256(pw));
        obj.put("hash", UT.generateMD5(id));
        obj.put("created", System.currentTimeMillis());
        obj.put("valid", true);

        _accountMap.put(id, obj);
        _modified.set(true);

        return true;
    }
    
    public boolean checkAccountValidity(String id, String userToken, String pwHash)
    {
        // TODO 계정 확인
        JSONObject obj = _accountMap.get(id);
        if( obj == null )
            return false;
        
        String pwComp = UT.generateSHA256((String) obj.get("pw") + "/" + userToken);
        
        obj.put("lastestCheck", System.currentTimeMillis());
        
        Logs.info("[Account] check account of {}", id);
        
        _modified.set(true);
        
        return pwComp.equals(pwHash);
    }
    
    public JSONObject getAcccountData(String id)
    {
        JSONObject accObj = _accountMap.get(id);
        
        if( accObj == null )
            return null;
        
        JSONObject dataObj = _accountData.get(id);
        
        if( dataObj == null )
        {
            String userFile = OPT.getUserFolder() + File.separator + accObj.getString("hash") + ".json";
            dataObj = this.readJSONFromFile(userFile);
            
            if( dataObj == null )
                dataObj = new JSONObject();
            
            _accountData.put(id, dataObj);
        }

        return dataObj;
    }

    /**
     * 
     * @param id 사용자
     * @param compCode 대상 코드
     * @param values 변경할 값. isSet, start, last
     */
    public JSONObject setFavorite(String id, String compCode, JSONObject values)
    {
        final String keyName = "favorites";
        
        JSONObject accObj = getAcccountData(id);
        if( accObj == null )
            return null;
        
        JSONObject favorites = null;
        
        // 관심 종목 저장 객체가 없는 경우
        if( !accObj.has(keyName) )
        {
            favorites = new JSONObject();
            accObj.put(keyName, favorites);
        }
        else
            favorites = accObj.getJSONObject(keyName);

        String ymd = UsefulTool.ConvertDateToString(new Date(), "yyyyMMdd");
        
        JSONObject compObj;
        if( !favorites.has(compCode) )
        {
            compObj = new JSONObject();
            favorites.put(compCode, compObj);
            compObj.put("created", ymd);
            compObj.put("start", ymd);
            compObj.put("isSet", true);
        }
        else
        {
            compObj = favorites.getJSONObject(compCode);
            // 초반에 등록된 애들은 없을 수 있어서 방어코드로 넣었음.
            if( !compObj.has("start") )
            {
                compObj.put("start", compObj.get("modified"));
            }
        }
        
        compObj.put("modified", ymd);
        
        // Favorite 여부, 관심일, 종료일
        final String[] keys = new String[] { "isSet", "start", "last" };
        
        // Favorite에서 빠지는 경우임
        if( values.has(keys[0]) && !values.getBoolean(keys[0]) )
        {
            // 히스토리에 현재 Favorite 상태를 넣고 여기서는 삭제합시다.
            pushFavoriteToHistory(accObj, compCode, compObj);
            favorites.remove(compCode);
        }
        else
        {
            for(String kn : keys)
            {
                if( values.has(kn) )
                    compObj.put(kn, values.get(kn));
            }
        }
        
        _accountModified.put(id, true);
        
        return compObj;
    }

    public JSONObject getFavorites(String id)
    {
        final String keyName = "favorites";
        JSONObject obj = getAcccountData(id);
        if( obj == null || !obj.has(keyName) )
            return null;
        
        return obj.getJSONObject(keyName);
    }
    
    private void pushFavoriteToHistory(JSONObject accObj, String compCode, JSONObject compObj)
    {
        final String keyName = "favHistory";
        
        JSONObject history = null;
        
        if( accObj.has(keyName) )
        {
            history = accObj.getJSONObject(keyName);
        }
        else
        {
            history = new JSONObject();
            accObj.put(keyName, history);
        }
        
        JSONArray compHistory = null;
        if( history.has(compCode) )
        {
            compHistory = history.getJSONArray(compCode);
        }
        else
        {
            compHistory = new JSONArray();
            history.put(compCode, compHistory);
        }

        compHistory.put( new JSONObject(compObj.toString()) ); // 복사해서 넣기
    }
    
    public String getComments(String id, String pCode)
    {
        final String keyName = "comments";
        JSONObject obj = getAcccountData(id);
        
        if( obj == null || !obj.has(keyName) )
            return null;

        JSONObject cmtObj = obj.getJSONObject(keyName);
        
        if( !cmtObj.has(pCode) )
            return null;
        
        return UT.decodeURIComponent(cmtObj.getString(pCode));
    }
    
    public void removeComments(String id, String pCode)
    {
        final String keyName = "comments";
        JSONObject obj = getAcccountData(id);
        
        if( obj == null || !obj.has(keyName) )
            return;
        
        JSONObject cmtObj = obj.getJSONObject(keyName);
        
        if( !cmtObj.has(pCode) )
            return;
        
        cmtObj.remove(pCode);
        
        _accountModified.put(id, true);
    }
    
    public void addComments(String id, String pCode, String comment)
    {
        final String keyName = "comments";
        JSONObject obj = getAcccountData(id);
        
        if( obj == null )
            return;
        
        JSONObject cmtObj = null;
        if( !obj.has(keyName) )
        {
            cmtObj = new JSONObject();
            obj.put(keyName, cmtObj);
        }
        
        cmtObj = obj.getJSONObject(keyName);
        
        if( !cmtObj.has(pCode) )
            cmtObj.put(pCode, UT.encodeURIComponent(comment));
        else
            cmtObj.put(pCode, cmtObj.getString(pCode) +  UT.encodeURIComponent(comment));
        
        _accountModified.put(id, true);
    }
}
