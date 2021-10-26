import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';

import { isvalid, isundef, makeid, numberWithCommas, yyymmddToHuman, dateToYYYYMMDD, getDayName } from '../grid/common.js';

import { SiNaver } from 'react-icons/si';
import { RiDeleteBin6Line, RiLineChartLine, RiEditBoxLine } from 'react-icons/ri';

import { MemoPanel } from '../chart/MemoPanel.js';

import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/esm/locale';

import './FavoriteTable.scss'
import 'react-datepicker/dist/react-datepicker.css';


const SDatePicker = styled(DatePicker)`
  outline: none;
  width: 110px;
  border: 1px solid lightgray;
  background-color: ${props => props.bgColor || 'white'};
  text-align: center;
`;


const CalendarCustomInput = ({ value, onClick, bgColor }) => ( <button className="favCalOpener" style={{ backgroundColor:bgColor }} onClick={onClick}> {value} </button> );


class FavoriteCard extends Component {
  static propTypes = {
    appData: PropTypes.object.isRequired,
    favData: PropTypes.object.isRequired,
    compCode: PropTypes.string.isRequired,
    comment: PropTypes.string,
    cw: PropTypes.number,
    onEvent: PropTypes.func
  };
  
  constructor (props) {
    super(props);

    const { index, cw, appData, favData, comment, compCode } = this.props;

    const d = favData;
    const msg = comment;
    const detail = this.makeState(d);

    this.state = {
      favData,
      drawKey: makeid(6),
      index, appData, cw, compCode, msg,
      memoPanelOn: false,
      ...detail
    };
  }

  componentDidMount () {
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if( nextProps.cw !== prevState.cw ) {
      return { cw: nextProps.cw };
    }

    return null;
  }

  makeState = (d) => {
    // d has: start, last, 
    const rl = d.stat;
    const d1 = d.start;
    const p1 = rl && rl[0] && rl[0].price;
    const d2 = d.last ? d.last : dateToYYYYMMDD(new Date());
    const p2 = rl && rl[rl.length - 1] && rl[rl.length - 1].price;
    const dt1 = new Date(Date.parse(yyymmddToHuman(d1)));
    const dt2 = new Date(Date.parse(yyymmddToHuman(d2)));

    return {
      dateStart: dt1,
      dateLast: dt2,
      p1, p2
    };
  }

  makeRatioTag = () => {
    const { favData } = this.state;

    const rl = favData.stat;
    if( isundef(rl) || rl.length === 0 ) {
      return <div className="favRatioItem">{'-'}</div>
    }

    const tags = [];

    for(let i = Math.max(1, rl.length - 5); i < rl.length; ++i) {
      const it = rl[i];
      const ratio = Math.round(it.ratio * 100) / 100;

      tags.push(
        <div key={`favratio-${i}`} className="favRatioItem">
          { i < rl.length - 1
            ? <><span style={{ color:`${ratio && ratio > 0 ? 'red' : 'blue'}`}}>{`${isvalid(ratio) ? ratio + ' %' : '-'}`}</span><span style={{ color:'black' }}> | </span></>
            : <span style={{ color:`${ratio && ratio > 0 ? 'red' : 'blue'}`}}>{`${ratio ? ratio + ' %' : '-'} (${it.dayDiff}일)`}</span> }
        </div>
      );
    }

    return (<>{ tags.map(t => t) }</>);
  }

  handleMenuClick = (type) => () => {
    const { onEvent } = this.props;
    const { compCode, memoPanelOn } = this.state;

    if( 'naver' === type ) {
      window.open(`https://finance.naver.com/item/main.naver?code=${compCode}`, '_blank');
    } else if( 'jump' === type ) {
      // appData.gotoPage(compCode);
      const url = window.location.href;
      const pRoot = url.indexOf('/', 10);
      window.open(url.substring(0, pRoot) + '/year/' + compCode, '_blank');
    } else if( 'delete' === type && onEvent ) {
      onEvent(compCode, 'delete');
    } else if( 'memo' === type ) {
      this.setState({ memoPanelOn: !memoPanelOn });
    }
  }

  handleDateChanged = (type) => (dt) => {
    const { appData, compCode } = this.state;
    const dtStr = dateToYYYYMMDD(dt);
    
    if( 'start' === type ) {
      appData.setFavorite(compCode, { start: dtStr }, (data) => {
        if( data.returnCode === 0 ) {
          const { favorite } = data.response;
          this.setState( { favData: favorite, dateStart: dt, ...this.makeState(favorite) } );
        }
      });
    } else if( 'end' === type ) {
      appData.setFavorite(compCode, { last: dtStr }, (data) => {
        if( data.returnCode === 0 ) {
          const { favorite } = data.response;
          this.setState({ favData: favorite, dateLast: dt, ...this.makeState(favorite) } );
        }
      });
    }
  }

  // 실제 처리는 MemoPanel에서 모두 수행하고 결과만 리턴함
  handleMemoPanel = (type, text) => {
    const { appData, compCode } = this.props;
    appData.getComment(compCode, (msg) => {
      this.setState({ drawKey: makeid(6), msg, memoPanelOn: false });
    });
  }

  render() {
    const { drawKey, index, appData, cw, compCode, msg, p1, p2, dateStart, dateLast, memoPanelOn } = this.state;

    const dateList = [
      { title: '시작일', date: dateStart, keyStr: 'start', bgColor: 'whitesmoke', pr: p1 },
      { title: '종료일', date: dateLast, keyStr: 'end', bgColor: 'white', pr: p2 }
    ];

    return (
      <div className="favCompCard" style={{ width: cw }}>
        <div className="favCardHeader">
          <div className="favHeaderNo">{index + 1}</div>
          <div className="favHeaderName">{appData.getCodeTitle(compCode)}</div>
          <div className="favHeaderAction">
            <div className="favAction favNormalAction" onClick={this.handleMenuClick('memo')}><RiEditBoxLine size="18" /></div>
            <div className="favAction favNormalAction" onClick={this.handleMenuClick('jump')}><RiLineChartLine size="18" /></div>
            <div className="favAction favNormalAction" onClick={this.handleMenuClick('naver')}><SiNaver size="18" /></div>
            <div className="favAction favDeleteAction" onClick={this.handleMenuClick('delete')}><RiDeleteBin6Line size="18" /></div>

            { memoPanelOn &&
              <div className="favMemoPanel" style={{ width: 380, height: 250 }}>
                <MemoPanel appData={appData} compCode={compCode} onApply={this.handleMemoPanel} />
              </div> 
            }
          </div>
        </div>
        <div className="favCardBody">
          { dateList.map((d, i) => {
            return (
              <div key={`fcard-${i}`} className="favCardInfo" style={{ backgroundColor:d.bgColor }}>
                <div className="favDataName">{`${d.title} / `}</div>
                <div className="favCalendar">
                  <SDatePicker
                    selected={d.date}
                    onChange={this.handleDateChanged(d.keyStr)}
                    locale={ko}
                    dateFormat="yyyy-MM-dd"
                    maxDate={new Date()}
                    bgColor={d.bgColor}
                    customInput={<CalendarCustomInput bgColor={d.bgColor} />}
                    dayClassName={dt => getDayName(dt) === '토' ? 'saturday' : getDayName(dt) === '일' ? 'sunday' : undefined }
                  />
                </div>
                <div className="favDataValue">{d.pr ? '₩ ' + numberWithCommas(d.pr) : '-'}</div>
              </div>
            );
          })}
          <div className="favCardInfo">
            <div className="favDataName">{'증감비율'}</div>
            <div className="favDataValue">{ this.makeRatioTag() }</div>
          </div>
          <div key={`fav-cmt-${drawKey}`} className="favCardComment">
            <div className="favCardCommentBody">
              { isvalid(msg) ? decodeURIComponent(msg).split('\n').map((t, j) => <div key={`cmt-${compCode}-${j}`} className="favCommentLine">{t}</div>) : '코멘트 없음.' }
            </div>
          </div>
        </div>
      </div>
    );
  }
};


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
      drawKey: makeid(6),
      clientWidth: 800,
      clientHeight: 400,
      data: favData,
      selectedDate: 'All',
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

  onChildEvent = (compCode, type, param) => {
    const { appData } = this.props;
    const { data } = this.state;

    if( 'delete' === type ) {
      data.favorites[compCode].isSet = false;
      appData.setFavorite(compCode, { isSet: false });
      this.setState({ data: data, drawKey: makeid(6) });
    }
  }

  handleDateChanged = (ev) => {
    this.setState({ selectedDate: ev.target.value });
  }

  makeTable = (cw, drawKey, favList) => {
    const { appData } = this.props;
    const { data } = this.state;
    const { comment } = data;

    return (favList &&
      favList.map((d, i) => (
        <FavoriteCard key={`favBox-${drawKey}-${d.code}`}
          index={i}
          appData={appData}
          compCode={d.code}
          favData={d}
          comment={comment && comment[d.code]}
          cw={cw}
          onEvent={this.onChildEvent}
        />)
      )
    );
  }

  render() {
    const { drawKey, data, clientWidth, selectedDate } = this.state;
    const { favorites } = data;

    const adjW = Math.min(clientWidth - 4, 1130);

    const favList = favorites && favorites.filter(d => selectedDate ==='All' || d.start === selectedDate);
    const tmpList = favorites && favorites.map(d => d.start);
    const dateSet = new Set(tmpList);
    const dateList = ['0', ...dateSet].sort();

    dateList[0] = 'All';

    return (
      <div ref={this._mainDiv} className="favoriteTable">
        <div className="favTitleBox">
          <h4 style={{ width:`${adjW - 20}px`}}>{'Interests'}</h4>
          <div className="favTitleDate">
            <select className="favDateSelector" name="dateSelector" onChange={this.handleDateChanged} value={selectedDate}>
              { dateList.map((d, i) => {
                const dtStr = i === 0 ? d : yyymmddToHuman(d);
                if( dtStr === '-' ) {
                  return null;
                }
                return (<option key={`dt-sel-${i}`} value={d}>{dtStr}</option>);
              })}
            </select>
          </div>
        </div>
        <div className="favDataBody" style={{ width:`${adjW - 20}px`}}>
          { this.makeTable(Math.max(400, adjW / 2 - 20), drawKey, favList) }
        </div>
      </div>
    );
  }
}

export default FavoriteTable;
export { FavoriteTable };
