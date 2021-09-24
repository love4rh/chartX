package com.tool4us.chartx.util;

import static com.tool4us.chartx.AppSetting.OPT;

import java.util.Map;
import java.util.Map.Entry;
import java.util.TreeMap;

import lib.turbok.common.ValueType;
import lib.turbok.data.FileMapStore;



public class ChartTool
{
    private static String[] _markerColor = {
        "#C0392B", "#6495ED", "#48C9B0", "#F4D03F", "#9B59B6",
        "#EB984E", "#27AE60", "#CDDC39", "#EC407A", "#95A5A6"
    }; // */
    
    /*
    private static String[] _markerColor = {
        "#FE2E2E", "#FE9A2E", "#F7FE2E", "#9AFE2E", "#2EFEF7", "#2E9AFE", "#2E2EFE", "#BF00FF", "#FF00BF", "#848484"
    }; // */
    
    public static String getMarkerColor(int idx)
    {
        return _markerColor[(idx - 1) % _markerColor.length];
    }
    
    public static String makeDataBlock( String title, long startRow, long endRow, FileMapStore ds
                                      , Map<Integer, double[]> extentMap ) throws Exception
    {
        int _suggestIdx  = OPT.getChartSuggest();
        int[] _fetchColumns = OPT.getChartData();

        StringBuilder sb = new StringBuilder();
        // StringBuilder[] sbMarker = { new StringBuilder(), new StringBuilder() };
        Map<Integer, StringBuilder> sbMarker = new TreeMap<Integer, StringBuilder>();

        sb.append("{");
        sb.append("\"title\":\"").append(title).append("\"");
        sb.append(",\"columns\":[");

        for(int i = 0; i < _fetchColumns.length; ++i)
        {
            if( i > 0 )
                sb.append(",");
            
            int c = _fetchColumns[i];
            
            ValueType vt = ds.getColumnType(c);
            String typeStr = "string";

            double[] minMax = null;
            
            if( vt == ValueType.DateTime )
                typeStr = "datetime";
            else if( vt == ValueType.Integer || vt == ValueType.Real )
            {
                typeStr = "number";
                minMax = extentMap.get(c);
            }

            sb.append("{ \"name\":\"").append(ds.getColumnName(c)).append("\"");
            sb.append(", \"type\":\"").append(typeStr).append("\"");
            sb.append(", \"data\":[");
            
            boolean assigned = false;
            Object pv = null;
            for(long r = startRow; r < endRow; ++r)
            {
                if( c == 0 )
                {
                    int bFlag = ((Double) ds.getCell(_suggestIdx, r)).intValue();
                    
                    if( bFlag > 0 )
                    {
                        StringBuilder sbm = sbMarker.get(bFlag);
                        if( sbm == null )
                        {
                            sbm = new StringBuilder();
                            sbMarker.put(bFlag, sbm);
                        }
                        else
                        {
                            sbm.append(",");
                        }
                        
                        sbm.append(r - startRow);
                    }
                }
                    
                if( assigned )
                    sb.append(",");
                
                Object v = ds.getCell(c, r);
                
                if( v == null )
                {
                    v = pv;
                    System.out.println("null value found in (" + c + ", " + r + ")");
                }

                if( "number".equals(typeStr) || v == null )
                {
                    sb.append(v);

                    if( minMax == null )
                    {
                        minMax = new double[] { (Double) v, (Double) v };
                        extentMap.put(c, minMax);
                    }
                    else
                    {
                        minMax[0] = Math.min(minMax[0], (Double) v);
                        minMax[1] = Math.max(minMax[1], (Double) v);
                    }
                }
                else
                    sb.append("\"").append(v).append("\"");
                
                pv = v;
                assigned = true;
            }

            sb.append("]}");
        }
        
        sb.append("]");
        sb.append(",\"editable\":false");
        
        if( !sbMarker.isEmpty() )
        {
            boolean assigned = false;
            sb.append(", \"marker\": [");
            
            for(Entry<Integer, StringBuilder> elem : sbMarker.entrySet())
            {
                if( assigned )
                    sb.append(",");

                sb.append("{ \"point\":[").append(elem.getValue().toString()).append("]")
                  .append(", \"color\":\"").append(getMarkerColor(elem.getKey())).append("\" }");
                
                assigned = true;
            }
            
            sb.append("]");
        }

        sb.append("}");
        
        return sb.toString();
    }
}