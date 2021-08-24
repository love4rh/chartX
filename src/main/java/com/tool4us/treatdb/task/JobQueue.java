package com.tool4us.treatdb.task;

import java.util.Map;
import java.util.concurrent.ConcurrentSkipListMap;

import com.tool4us.common.Logs;

import lib.turbok.task.ITask;
import lib.turbok.task.ITaskMonitor;
import lib.turbok.task.TaskQueue;



public enum JobQueue implements ITaskMonitor
{
    JQ;
    
    private TaskQueue   _taskMgr = null;
    
    private Map<String, Integer> _working = null;

    private JobQueue()
    {
        _taskMgr = new TaskQueue(this);
        _working = new ConcurrentSkipListMap<String, Integer>();
    }
    
    public void begin()
    {
        _taskMgr.startQueue(4, "treatdb-job-queue");
    }
    
    public void end()
    {
        _taskMgr.endQueue();
    }
    
    public void pushTask(ITask task)
    {
    	_taskMgr.pushTask(task);
    }

    @Override
    public boolean isContinuing(ITask task)
    {
        // TODO Auto-generated method stub
        return false;
    }

    @Override
    public void stopTask(ITask task)
    {
        // TODO Auto-generated method stub
        
    }

    @Override
    public void OnStartTask(ITask task)
    {
        // TODO Auto-generated method stub
        
    }

    @Override
    public boolean OnProgress(ITask task, long progress)
    {
        // TODO Auto-generated method stub
        return false;
    }

    @Override
    public void OnEndTask(ITask task)
    {
        // TODO
    }

    @Override
    public void OnErrorRaised(ITask task, Throwable e)
    {
        if( e instanceof JobException )
        {
            JobException xe = (JobException) e;

            _working.remove(xe.getKey());

            Logs.warn("Error occured: {}", task.toString());
            Logs.trace(xe);
        }
    }
}
