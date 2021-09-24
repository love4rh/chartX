// eslint-disable-next-line
import { isvalid, istrue, tickCount, randomReal, randomInteger } from '../util/tool.js';
import { cp } from '../grid/common.js';

import { apiProxy } from '../util/apiProxy.js';

// import sample from '../resource/sample.json';


class AppData {
  constructor (props) {
    const { compCode } = props;

    this._handler = [];
    this._dataList = [];
    this._chart = {};

    this._colorMap = null;

    this._useCommonRange = false;
    this._userExtentY = [null, null];
    this._dataExtentY = [[0, 100], [0, 100]];

    if( isvalid(compCode) && compCode !== '' ) {
      this.setCompCode(compCode);
    }
  }

  // DiosDataSource에서 가져옴
  // { (title), columns, records }
  
  getSampleData = () => {
    const oneDay = 24 * 60 * 60000;
    // eslint-disable-next-line
    const baseTick = tickCount() - oneDay * 30;
    const rindex = [];

    for(let i = 0; i < 100; ++i) {
      rindex.push(i + 1);
    }

    const columns = [
      { name: 'Label', type: 'string', data: rindex.map(d => 'P' + d) },
      { name: 'Y1', type: 'number', data: rindex.map(d => Math.round(randomReal(0, d/2) * 10000) / 10000) },
      { name: 'Y2', type: 'number', data: rindex.map(d => Math.round(randomReal(0, 51 - d/2) * 10000) / 10000) },
      { name: 'Y3', type: 'number', data: rindex.map(d => randomInteger(-50, d * 10)) },
      { name: 'Y4', type: 'number', data: rindex.map(d => randomInteger(-50, (100 - d) * 10)) },
      { name: 'Y5', type: 'number', data: rindex.map(d => randomInteger(-50, (100 - d) * 10)) },
      { name: 'Date', type: 'datetime', data: rindex.map(d => baseTick + d * oneDay) }
    ]; // */

    // const { columns } = sample;

    this._dataList = [{
      title: 'sample',
      columns: columns,
      editable: false,
      marker: [{ point: rindex.filter(d => d % 10 === 0), color: 'red' }, { point: rindex.filter(d => d % 7 === 0), color: 'blue' }]
    }];

    this._chart = { X: 0, Y1: [1, 2], Y2: [3, 4, 5] };

    return this._dataList[0];
  }

  setCompCode = (code) => {
    this._compCode = code;

    if( 'guessBP' === code ) {
      this.getBuyPointData();
    } else {
      this.getChartDataByCode(this._compCode);
    }
  }

  getChartDataByCode = (code) => {
    // apiProxy.getYearlyData(code,
    apiProxy.getCountedData(code, 450,
      (res) => {
        console.log('APPDATA OK', res);
        if( 0 === res.returnCode ) {
          const { data, chart, colorMap, extentY1, extentY2 } = res.response;

          this._dataList = data;
          this._chart = chart;
          this._dataExtentY = [ extentY1, extentY2 ];
          this._userExtentY = cp([ extentY1, extentY2 ]);
          this._colorMap = colorMap;

          this.pulseEvent('data changed');
        }
      },
      (err) => {
        console.log('APPDATA ERR', err);
        // TODO 예외 처리
      }
    );
  }

  getBuyPointData = () => {
    apiProxy.getBuyPointData(
      (res) => {
        console.log('APPDATA OK', res);
        if( 0 === res.returnCode ) {
          const { data, chart, colorMap, extentY1, extentY2 } = res.response;

          this._dataList = data;
          this._chart = chart;
          this._dataExtentY = [ extentY1, extentY2 ];
          this._userExtentY = cp([ extentY1, extentY2 ]);
          this._colorMap = colorMap;

          this.pulseEvent('data changed');
        }
      },
      (err) => {
        console.log('APPDATA ERR', err);
        // TODO 예외 처리
      }
    );
  }

  // handle looks like function(sender, event).
  // sender will be 'appData'
  addEventListener = (handler) => {
    this._handler.push(handler);
  }

  pulseEvent = (evt) => {
    for(var i = 0; i < this._handler.length; ++i) {
      this._handler[i]('appData', evt);
    }
  }

  setUserExtentY = (y1, y2) => {
    if( y1 ) {
      this._userExtentY[0] = y1;
    }

    if( y2 ) {
      this._userExtentY[1] = y2;
    }

    this.pulseEvent('extent changed');
  }

  setCommonRangeUsage = (flag) => {
    this._useCommonRange = flag;
    this.pulseEvent('extent changed');
  }

  getDataList = () => {
    return this._dataList;
  }

  getDataExtentY = (idx) => {
    return this._dataExtentY[idx];
  }

  getUserExtentY = (idx) => {
    return this._userExtentY[idx];
  }

  getExtentY = (idx) => {
    return istrue(this._useCommonRange) ? this.getUserExtentY(idx) : null;
  }

  getChartOption = () => {
    return this._chart;
  }

  getMarkerList = (idx) => {
    const dd = this._dataList[idx];
    return dd && dd.marker;
  }

  isUseCommonRange = () => {
    return this._useCommonRange;
  }

  getColorMap = () => {
    return this._colorMap;
  }
};

export default AppData;
export {AppData};
