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
    
    public static boolean attachExtent(StringBuilder sb, Map<Integer, double[]> extentMap)
    {
        if( extentMap.isEmpty() )
        {
            return false;
        }
        
        int[][] yList = OPT.getChartY();

        for(int j = 1; j <= 2; ++j)
        {
            int[] list = yList[j - 1];
            
            if( list == null )
                continue;

            double[] minMax = null;;
            for(int i = 0; i < list.length; ++i)
            {
                double[] mm = extentMap.get(list[i]);
                if( mm == null )
                    continue;
                
                if( minMax == null )
                    minMax = mm;
                else
                {
                    minMax[0] = Math.min(minMax[0], mm[0]);
                    minMax[1] = Math.max(minMax[1], mm[1]);
                }
            }
            
            if( minMax != null )
            {
                sb.append(", \"extentY").append(j).append("\":[")
                    .append(minMax[0]).append(", ").append(minMax[1]).append("]");
            }
        }
        
        return true;
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
                    Double vFlag = (Double) ds.getCell(_suggestIdx, r);
                    int bFlag = vFlag == null ? 0 : vFlag.intValue();
                    
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
                
                if( "number".equals(typeStr) && ((Double) v).isNaN() )
                {
                    v = pv;
                    System.out.println("NaN value found in (" + c + ", " + r + ")");
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
                
                if( v != null )
                {
                    pv = v;
                }
                
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
    
    
    public static int attachAnnualDataBlock( StringBuilder sb, String title, FileMapStore ds, Map<Integer, double[]> extentMap ) throws Exception
    {
        int count = 0;
        long bi = -1;
        boolean assigned = false;
        String year = null;
        
        for(long r = 0; r < ds.getRowSize(); ++r)
        {
            String dt = (String) ds.getCell(0, r);
            
            if( dt == null )
                continue;
            
            dt = dt.substring(0, 4);
            
            if( year == null )
            {
                year = dt;
                bi = r;
            }
            
            if( !dt.equals(year) )
            {
                if( assigned )
                    sb.append(",");
                
                sb.append( makeDataBlock(title + " @" + year, bi, r, ds, extentMap) );
                assigned = true;
                count += 1;

                bi = r;
                year = dt;
            }
        }
        
        if( bi != -1 )
        {
            if( assigned )
                sb.append(",");
            
            sb.append( makeDataBlock(title + " @" + year, bi, ds.getRowSize(), ds, extentMap) );
            count += 1;
        }
        
        return count;
    }
}
