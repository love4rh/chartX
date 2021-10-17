import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { makeid } from '../grid/common.js';

import Table from 'react-bootstrap/Table'

import './TableFrame.scss'


const mockData = {
  "title": "2021-08-26 / 2021-09-15",
  "columns": ["종목", "자산총계", "시가총액", "RISK", "매수가", "매도가", "수익률"],
  "records": [
    ["원방테크 (053080)", 2374.651576, 1110.035966, 56, 25850, 18950, -26.69],
    ["한국종합기술 (023350)", 3321.194868, 949.365, 74, 8670, 8760, 1.04],
    ["DSR (155660)", 2529.374474, 1094.4, 86, 6840, 10650, 55.70],
    ["화신정공 (126640)", 1466.685441, 745.6646835, 87, 2050, 3105, 51.46],
    ["한국큐빅 (021650)", 1387.112436, 820.7982626, 97, 5020, 4930, -1.79],
    ["한솔PNS (010420)", 1071.263963, 453.9202158, 100, 2215, 2300, 3.84],
    ["DSR제강 (069730)", 2062.528157, 950.4, 114, 6600, 10200, 54.55],
    ["원일특강 (012620)", 2309.013452, 686.4, 122, 15600, 16200, 3.85],
    ["무림SP (001810)", 2965.51754, 775.919375, 132, 3505, 3630, 3.57],
    ["푸드웰 (005670)", 1417.500119, 896, 145, 8960, 9750, 8.82],
    ["오스템 (031510)", 2136.439521, 898.8, 146, 3210, 3100, -3.43],
    ["한국가구 (004590)", 1556.352786, 1012.5, 149, 6750, 7160, 6.07],
    ["세진티에스 (067770)", 445.7683992, 472.7281859, 154, 5630, 6190, 9.95],
    ["에이치케이 (044780)", 829.7961408, 446.9147561, 156, 2415, 2300, -4.76],
    ["에스씨디 (042110)", 1560.342613, 1024.586757, 159, 2120, 2045, -3.54],
    ["성우테크론 (045300)", 801.2751788, 576.1576049, 159, 6010, 6600, 9.82],
    ["KBI메탈 (024840)", 2148.26529, 771.0498432, 162, 2340, 2355, 0.64],
    ["진양산업 (003780)", 707.2258381, 764.4, 179, 5880, 6000, 2.04],
    ["신송홀딩스 (006880)", 1678.290104, 677.7935634, 187, 5730, 5650, -1.40],
    ["웰크론한텍 (076080)", 1444.705636, 836.8331892, 189, 4020, 5520, 37.31]
  ]
};



class TableFrame extends Component {
  static propTypes = {
    appData: PropTypes.object.isRequired
  };

  constructor (props) {
    super(props);

    this.state = {
      drawKey: makeid(8),
      clientWidth: 800,
      clientHeight: 400
    };

    this._mainDiv = React.createRef();
  }

  componentDidMount() {
    this.onResize();
    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    const { clientWidth, clientHeight } = this._mainDiv.current;
    this.setState({ clientWidth, clientHeight });
  }

  makeTable = (cw) => {
    const data = mockData;
    const { columns, records, title } = data;

    // 날짜
    // 순번, 종목, 자산총계, 시가총액, RISK, 매수가, 매도가, 손익
    return (
      <div style={{ flexBasis:`${cw - 20}px`}}>
        <h4 className="tableTitleBox">{title}</h4>
        <Table hover responsive>
          <thead>
            <tr>
              <th>#</th>
              { columns.map((d, i) => <th key={`hk-${i}`}>{d}</th>) }
            </tr>
          </thead>
          <tbody>
            { records.map((d, i) => {
                return (
                  <tr key={`dk-${i}`}>
                    <td>{i + 1}</td>
                    { d.map((c, j) => <td key={`ck-${j}`}>{j === 1 || j === 2 ? Math.round(c) : c}</td>) }
                  </tr>
                );
            })}
          </tbody>
        </Table>
      </div>
    );
  }

  render() {
    const { clientWidth } = this.state;

    const adjW = Math.min(clientWidth - 4, 1130);

    return (
      <div ref={this._mainDiv} className="tableFrame">
        { this.makeTable(adjW) }
      </div>
    );
  }
}
export default TableFrame;
export { TableFrame };
