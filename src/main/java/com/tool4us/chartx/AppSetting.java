package com.tool4us.chartx;

import java.io.File;
import java.util.Map;
import java.util.TreeMap;

import com.tool4us.common.AppOptions;

import lib.turbok.util.UsefulTool;



/**
 * AppSetting manages Application Setting Values.
 * 
 * @author TurboK
 */
public enum AppSetting
{
    OPT;
    
    private AppOptions  _options = null;
    
    private String  _serverID = null;
    
    /**
     * Listening Port for Web-Service
     */
    private int     _port = 8888;
    
    private int     _bossThreadNum = 1;
    
    private int     _serviceThreadNum = 4;
    
    /**
     * 0: Information Level
     * 1: Debug Level
     * 2: Debug Level + Network Debug Level
     */
    private String      _configFile = null;

    private String      _temporaryFolder = null;

    private boolean     _withConsole = false;
    
    private boolean     _fileLogging = true;
    
    // 이전에 만들어진 PMLog 파일 유지 여부
    private boolean     _keepOld = true;
    
    private Map<String, String>     _param = new TreeMap<String, String>();

    
    private AppSetting()
    {
        _options = new AppOptions();
    }
    
    public void initialize(String configFile) throws Exception
    {
        _configFile = configFile;
        
        reload();
    }
    
    public void reload() throws Exception
    {
        _options.initialize(_configFile);
        load();
    }
    
    private void load() throws Exception
    {
        String[] pathName = new String[] { "folder/temporary", "folder/vroot", "folder/data" };

        for(String key : pathName)
        {
            String value = _options.getAsString(key);
            
            if( value == null )
                continue;
            
            if( value.startsWith("./") )
            {
                value = UsefulTool.GetModulePath() + File.separator + value.substring(2);
            }
            
            _param.put(key, value);
        }

        _serverID = _options.getAsString("setting/id");
        _port = _options.getAsInteger("network/port", 8080);
        
        _bossThreadNum = _options.getAsInteger("network/bossThread", 1);
        _serviceThreadNum = _options.getAsInteger("/network/workerThread", 4);
        
        _withConsole = _options.getAsBoolean("setting/withConsole", false);
        _fileLogging = _options.getAsBoolean("logging/useFile", true);

        _temporaryFolder = parameter("folder", "temporary");

        if( _temporaryFolder == null )
            _temporaryFolder = UsefulTool.GetModulePath() + File.separator + "temporary";
    }
    
    public int port()
    {
        return _port;
    }
    
    public int bossThreadNum()
    {
        return _bossThreadNum;
    }
    
    public int serviceThreadNum()
    {
        return _serviceThreadNum;
    }
    
    public String id()
    {
        return _serverID;
    }
    
    private String parameter(String category, String type)
    {
        return _param.get(UsefulTool.concat(category, "/", type));
    }

    public String temporaryFolder()
    {
        return _temporaryFolder;
    }

    public boolean withConsole()
    {
        return _withConsole;
    }
    
    public boolean loggingFile()
    {
        return _fileLogging;
    }
    
    public String dataFolder()
    {
        return this.parameter("folder", "data");
    }
    
    public String virtualRoot()
    {
        return this.parameter("folder", "vroot");
    }

    public String virtualDir(String vDir)
    {
        return this.parameter("folder", vDir);
    }

    public boolean isKeepOldMade()
    {
        return this._keepOld;
    }
}
