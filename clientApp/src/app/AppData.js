// eslint-disable-next-line
import { isvalid, tickCount, randomReal, randomInteger } from '../util/tool.js';

import { apiProxy } from '../util/apiProxy.js';

// import sample from '../resource/sample.json';


class AppData {
  constructor (props) {
    const { compCode } = props;

    this._handler = [];
    this._data = {};
    this._chart = {};

    if( isvalid(compCode) ) {
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

    this._data = {
      title: 'sample',
      columns: columns,
      editable: true
    };

    this._chart = { X: 0, Y1: [1, 2], Y2: [3, 4, 5] };

    return this._data;
  }

  setCompCode = (code) => {
    this.compCode = code;

    apiProxy.getCompData(code,
      (res) => {
        // console.log('APPDATA OK', res);
        if( 0 === res.returnCode ) {
          this._data = res.response.data;
          this._chart = res.response.chart;

          this.pulseEvent('data changed');
        }
      },
      (err) => {
        console.log('APPDATA ERR', err);
        // TODO 예외 처리
      }
    );
  }

  addEventListener = (handler) => {
    this._handler.push(handler);
  }

  pulseEvent = (evt) => {
    for(var i = 0; i < this._handler.length; ++i) {
      this._handler[i]('appData', evt);
    }
  }

  getLatestData = () => {
    return this._data;
  }

  getLatestChart = () => {
    return this._chart;
  }

};

export default AppData;
export {AppData};
