import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';

import { isvalid, istrue, makeid, numberWithCommas, yyymmddToHuman, dateToYYYYMMDD } from '../grid/common.js';

import { SiNaver } from 'react-icons/si';
import { RiDeleteBin6Line, RiLineChartLine } from 'react-icons/ri';

import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/esm/locale';

import './TableFrame.scss'
import 'react-datepicker/dist/react-datepicker.css';


const SDatePicker = styled(DatePicker)`
  outline: none;
  width: 110px;
  border: 1px solid lightgray;
  background-color: ${props => props.bgColor || 'white'};
  text-align: center;
`;



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

  handleMenuClick = (compCode, type) => () => {
    const { appData } = this.props;

    if( 'naver' === type ) {
      window.open(`https://finance.naver.com/item/main.naver?code=${compCode}`, '_blank');
    } else if( 'jump' === type ) {
      // appData.gotoPage(compCode);
      const url = window.location.href;
      const pRoot = url.indexOf('/', 10);
      window.open(url.substring(0, pRoot) + '/year/' + compCode, '_blank');
    } else if( 'delete' === type ) {
      appData.setFavorite(compCode, false);
    }
  }

  handleDateChanged = (type) => (dt) => {
    console.log('handleDateChanged', type, dateToYYYYMMDD(dt));
  }

  makeTable = (cw) => {
    const { appData } = this.props;
    const { data } = this.state;
    const { favorites, price, comment, lastDate } = data;

    // const title = ['#', '종목', '최초 등록일', '최근 수정일', '수정시 종가', '코멘트', '액션'];

    return (<>{
      favorites && Object.keys(favorites)
        .filter(k => favorites[k] && istrue(favorites[k].isSet))
        .map((k, i) => {
          const d = favorites[k];
          const c = comment && comment[k];
          const p1 = price[k + '@' + d.modified];
          const last = d.last ? d.last : lastDate;
          const p2 = price[k + '@' + last];

          const ratio = p1 && p2 ? Math.round((p2[1] - p1[1]) / p1[1] * 10000) / 100 : null;

          return (
            <div key={`favBox-${k}-${i}`} className="favCompCard" style={{ width: cw }}>
              <div className="favCardHeader">
                <div className="favHeaderNo">{i + 1}</div>
                <div className="favHeaderName">{appData.getCodeTitle(k)}</div>
                <div className="favHeaderAction">
                  <div className="favAction favNormalAction" onClick={this.handleMenuClick(k, 'jump')}><RiLineChartLine size="18" /></div>
                  <div className="favAction favNormalAction" onClick={this.handleMenuClick(k, 'naver')}><SiNaver size="18" /></div>
                  <div className="favAction favDeleteAction" onClick={this.handleMenuClick(k, 'delete')}><RiDeleteBin6Line size="18" /></div>
                </div>
              </div>
              <div className="favCardBody">
                <div className="favCardInfo">
                  <div className="favDataName">{'시작일 / '}</div>
                  <div className="favCalendar">
                    <SDatePicker
                      selected={new Date(Date.parse(yyymmddToHuman(d.modified)))}
                      onChange={this.handleDateChanged('start')}
                      locale={ko}
                      dateFormat="yyyy-MM-dd"
                      maxDate={new Date()}
                      bgColor="whitesmoke"
                    />
                  </div>
                  <div className="favDataValue">{p1 ? '₩ ' + numberWithCommas(p1[1]) : '-'}</div>
                </div>
                <div className="favCardInfo" style={{ backgroundColor:'white' }}>
                  <div className="favDataName">{'종료일 / '}</div>
                  <div className="favCalendar">
                    <SDatePicker
                      selected={new Date(Date.parse(yyymmddToHuman(last)))}
                      onChange={this.handleDateChanged('end')}
                      locale={ko}
                      dateFormat="yyyy-MM-dd"
                      maxDate={new Date()}
                    />
                  </div>
                  <div className="favDataValue">{p2 ? '₩ ' + numberWithCommas(p2[1]) : '-'}</div>
                </div>
                <div className="favCardInfo">
                  <div className="favDataName">{'증감비율'}</div>
                  <div className="favDataValue" style={{ color:`${ratio && ratio > 0 ? 'red' : 'blue'}`}}>{ratio ? ratio + ' %' : '-'}</div>
                </div>
                <div className="favCardComment">
                  <div className="favCardCommentBody">
                    { isvalid(c) ? decodeURIComponent(c).split('\n').map((t, j) => <div key={`cmt-${k}-${j}`} className="favCommentLine">{t}</div>) : '코멘트 없음.' }
                  </div>
                </div>
              </div>
            </div>
          );
        })
      } </>
    );
  }

  render() {
    const { clientWidth } = this.state;

    const adjW = Math.min(clientWidth - 4, 1130);

    return (
      <div ref={this._mainDiv} className="favoriteTable">
        <h4 className="favTitleBox" style={{ width:`${adjW - 20}px`}}>{'My Interests'}</h4>
        <div className="favDataBody" style={{ width:`${adjW - 20}px`}}>
          { this.makeTable(Math.max(400, adjW / 2 - 20)) }
        </div>
      </div>
    );
  }
}
export default FavoriteTable;
export { FavoriteTable };
