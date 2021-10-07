// eslint-disable-next-line
import { isvalid, istrue, tickCount, randomReal, randomInteger } from '../util/tool.js';
import { cp } from '../grid/common.js';

import { apiProxy } from '../util/apiProxy.js';

// import sample from '../resource/sample.json';


class AppData {
  constructor (props) {
    this._handler = [];
    this._dataList = [];
    this._chart = {};

    this._colorMap = null;

    this._useCommonRange = false;
    this._userExtentY = [null, null];
    this._dataExtentY = [[0, 100], [0, 100]];

    this._pageInfo = [];

    this._codeList = [ {code: '066570', name: 'LG전자', english: 'LGELECTRONICS', ipoDate: '2002/04/22', market: 'KOSPI', business: '전기전자(전자제품)' } ];
  }

  setCodeList = (codes) => {
    this._codeList = codes;
  }

  getFilteredCodes = (keyword) => {
    const pattern = new RegExp(keyword, 'gi');

    // d: { code, name, business }
    return this._codeList.filter((d) => pattern.test(d.code) || pattern.test(d.name) || pattern.test(d.business));
  }

  getCodeTitle = (code) => {
    const item = this._codeList.filter((d) => d.code === code);

    if( item.length === 1 ) {
      const d = item[0];
      return `${d.name} / ${d.code} / ${d.business}`;
    }

    return code;
  }

  // DiosDataSource에서 가져옴
  // { (title), columns, records }
  
  makeSampleData = () => {
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
      title: 'sample1',
      columns: columns,
      editable: false,
      marker: [{ point: rindex.filter(d => d % 10 === 0), color: 'red' }, { point: rindex.filter(d => d % 7 === 0), color: 'blue' }]
    }, {
      title: 'sample2',
      columns: columns,
      editable: false,
      marker: [{ point: rindex.filter(d => d % 13 === 0), color: 'red' }, { point: rindex.filter(d => d % 11 === 0), color: 'blue' }]
    }];

    this._chart = { X: 0, Y1: [1, 2], Y2: [3, 4, 5] };

    return this._dataList[0];
  }

  fetchAnnualDataByCode = (code, cb) => {
    apiProxy.getYearlyData(code,
      (res) => {
        this.handleDataOK(res);
        cb(true);
      },
      (err) => {
        this.handleDataError(err);
        cb(false);
      }
    );
  }

  fetchChartDataByCode = (code, cb) => {
    apiProxy.getCountedData(code, 380,
      (res) => {
        this.handleDataOK(res);
        cb(true);
      },
      (err) => {
        this.handleDataError(err);
        cb(false);
      }
    );
  }

  handleDataOK = (res) => {
    console.log('APPDATA OK', res);

    if( 0 === res.returnCode ) {
      const { data, chart, colorMap, extentY1, extentY2 } = res.response;

      this._dataList = data;
      this._chart = chart;
      this._dataExtentY = [ extentY1, extentY2 ];
      this._userExtentY = cp([ extentY1, extentY2 ]);
      this._colorMap = colorMap;
    }
  }

  handleDataError = (err) => {
    // TODO 예외 처리
    console.log('APPDATA ERR', err);
  }

  fetchBuyPointData = (page, cb) => {
    apiProxy.getBuyPointData(page,
      (res) => {
        if( 0 === res.returnCode ) {
          const { data, chart, colorMap, extentY1, extentY2, page, total } = res.response;

          this._dataList = data;
          this._chart = chart;
          this._dataExtentY = [ extentY1, extentY2 ];
          this._userExtentY = cp([ extentY1, extentY2 ]);
          this._colorMap = colorMap;
          this._pageInfo = [ page, total ];

          cb(true);
        }
      },
      (err) => {
        console.log('APPDATA ERR', err);
        cb(false);
      }
    );
  }

  setUserExtentY = (y1, y2) => {
    if( y1 ) {
      this._userExtentY[0] = y1;
    }

    if( y2 ) {
      this._userExtentY[1] = y2;
    }
  }

  setCommonRangeUsage = (flag) => {
    this._useCommonRange = flag;
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

  // returns [ pageNo, totalCount ]
  getPageInfo = () => {
    return this._pageInfo;
  }
};

export default AppData;
export {AppData};
