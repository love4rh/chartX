// eslint-disable-next-line
import { istrue, isundef, isvalid, tickCount, randomReal, randomInteger } from '../util/tool.js';
import { cp, dateToString } from '../grid/common.js';

import { apiProxy } from '../util/apiProxy.js';

// import sample from '../resource/sample.json';


class AppData {
  constructor (appObj) {
    this._app = appObj;

    this._colorMap = null;
    this._useCommonRange = false;
    this._userExtentY = [null, null];
    this._dataExtentY = [[0, 100], [0, 100]];

    this.clear();
  }

  unmount = () => {
    // TODO unmount 시 해야 할 일들
  }

  gotoPage = (code) => {
    this._app.goTo('year')(code);
  }

  initialize = (uid, data) => {
    this._uid = uid;
    this.setCodeList(data.codes);
    this._favoriteMap = isvalid(data.favorites) ? data.favorites : {};
    this._favoriteData = {};
  }

  clear = () => {
    this._uid = null;
    this._dataList = [];
    this._chart = {};
    this._pageInfo = [];
    this._comments = {};

    this._favoriteMap = {
      '066570': { isSet: true },
    };

    this.setCodeList([ {code: '066570', name: 'LG전자', english: 'LGELECTRONICS', ipoDate: '2002/04/22', market: 'KOSPI', business: '전기전자(전자제품)' } ]);
  }

  setCodeList = (codes) => {
    this._codeList = codes;
    this._business = {};
    this._businessList = [];

    // business 형태로 구분
    codes.map((d) => {
      if( !(d.business in this._business) ) {
        this._business[d.business] = { name:d.business, codes:[ d.code ] };
        this._businessList.push(d.business);
      } else {
        this._business[d.business].codes.push(d.code);
      }
      return true;
    });
  }

  getFilteredCodes = (keyword) => {
    const pattern = new RegExp(keyword, 'gi');

    // d: { code, name, business }
    return this._codeList.filter((d) => pattern.test(d.code) || pattern.test(d.name) || pattern.test(d.business));
  }

  getCodeTitle = (code) => {
    const d = this.getCodeData(code);
    return isundef(d) ? '' : `${d.name} / ${d.code} / ${d.business}`;
  }

  getCodeData = (code) => {
    const item = this._codeList.filter((d) => d.code === code);

    if( item.length === 1 ) {
      return item[0];
    }

    return null;
  }

  getCodeList = () => {
    return this._codeList;
  }

  getBusinessList = () => {
    return this._businessList;
  }

  getFilteredBusinessList = (keyword) => {
    const pattern = new RegExp(keyword, 'gi');
    return this._businessList.filter(d => pattern.test(d));
  }

  getCodeInBusiness = (compType) => {
    if( compType in this._business ) {
      return this._business[compType].codes;
    }

    return []
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
      code: 'CODE1',
      columns: columns,
      editable: false,
      marker: [{ point: rindex.filter(d => d % 10 === 0), color: 'red' }, { point: rindex.filter(d => d % 7 === 0), color: 'blue' }]
    }, {
      title: 'sample2',
      code: 'CODE2',
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

  fetchCountedDataByCodes = (codes, cb) => {
    apiProxy.getCountedDataByCodes(codes, 380,
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

  isFavorite = (pCode) => {
    const obj = this._favoriteMap[pCode];

    return isvalid(pCode) && isvalid(obj) && istrue(obj.isSet);
  }

  setFavorite = (pCode, flag) => {
    this._favoriteMap[pCode] = { isSet: flag };

    // 서버에 알리기
    apiProxy.postFavorite(this._uid, pCode, flag);
  }

  getFavoritesCodes = () => {
    return Object.keys(this._favoriteMap).filter(k => this.isFavorite(k));
  }
  
  getFavoriteList = (cb) => {
    apiProxy.getFavorite(this._uid,
      (data) => {
        this._favoriteData = data;
        if( cb ) cb(data);
      },
      (err) => {
        if( cb ) cb(null);
      }
    );
  }

  getFavoriteData = () => {
    return this._favoriteData;
  }

  getComment = (pCode, cb) => {
    if( pCode in this._comments ) {
      cb( this._comments[pCode] );
      return;
    }

    apiProxy.getComment(this._uid, pCode, (cmt) => {
      this._comments[pCode] = cmt;
      cb(cmt);
    },
    (err) => {
      console.log(err);
      cb('');
    })
  }

  addComment = (pCode, comment, cb) => {
    // console.log('addComment', pCode, comment, this._comments);
    let msg = '';
    if( pCode in this._comments ) {
      msg = this._comments[pCode];
    }

    const newMsg = '<' + dateToString(new Date(), false) + '>\n' + comment + '\n';

    apiProxy.postComment(this._uid, pCode, 'add', newMsg,
      (res) => {
        msg += newMsg;
        this._comments[pCode] = msg;
        cb(msg);
      },
      (err) => {
        cb(msg);
      }
    );
  }

  removeComment = (pCode, cb) => {
    apiProxy.postComment(this._uid, pCode, 'remove', '',
      (res) => {
        delete this._comments[pCode];
        cb();
      },
      (err) => {
        cb();
      }
    );
  }
};

export default AppData;
export {AppData};
