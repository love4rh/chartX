import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { istrue, makeid, numberWithCommas } from '../grid/common.js';

import Table from 'react-bootstrap/Table'

import './TableFrame.scss'
import { isvalid } from '../util/tool.js';



class FavoriteTable extends Component {
  static propTypes = {
    appData: PropTypes.object.isRequired,
    favData: PropTypes.object,
  };

  constructor (props) {
    super(props);

    const { appData, favData } = this.props;

    this.state = {
      appData,
      drawKey: makeid(8),
      clientWidth: 800,
      clientHeight: 400,
      data: favData
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
    const { appData } = this.props;
    const { data } = this.state;
    const { favorites, price, comment } = data;

    const title = ['#', '종목', '최초 등록일', '최근 수정일', '수정시 종가', '코멘트'];

    return (
      <div style={{ flexBasis:`${cw - 20}px`}}>
        <h4 className="tableTitleBox">{'My Interests'}</h4>
        <Table hover responsive>
          <thead>
            <tr>
              { title.map((d, i) => <th key={`hk-${i}`}>{d}</th>) }
            </tr>
          </thead>
          <tbody>
            { favorites && Object.keys(favorites).map((k, i) => {
                const d = favorites[k];
                const c = comment && comment[k];
                const p = price[k + '@' + d.modified];

                return (istrue(d.isSet) &&
                  <tr key={`fk-${i}`}>
                    <td>{i + 1}</td>
                    <td>{appData.getCodeTitle(k)}</td>
                    <td>{d.created}</td>
                    <td>{d.modified}</td>
                    <td>{ p ? numberWithCommas(p[1]) : '-' }</td>
                    <td>{ isvalid(c) ? <pre>{decodeURIComponent(c)}</pre> : '' }</td>
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
      <div ref={this._mainDiv} className="favoriteTable">
        { this.makeTable(adjW) }
      </div>
    );
  }
}
export default FavoriteTable;
export { FavoriteTable };
