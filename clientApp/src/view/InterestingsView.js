import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { isundef, istrue, makeid } from '../util/tool.js';

import { RiArrowGoBackFill } from 'react-icons/ri';

import { ImTable2, ImStatsDots } from "react-icons/im";

import { ChartFrame } from './ChartFrame.js';
import { FavoriteCard } from './FavoriteCard.js';

import './viewStyle.scss';



class InterestingsView extends Component {
  static propTypes = {
    appTitle: PropTypes.string.isRequired,
    appData: PropTypes.object.isRequired,
    goBack: PropTypes.func.isRequired,
  };

  constructor (props) {
    super(props);

    const { appData } = props;

    this.state = {
      cw: 1130,
      ch: 760,
      appData,
      drawKey: makeid(6),
      dataList: [],
      asTable: true,
      favData: {},
      dateList: [],
      selectedDate: '전체',
      showDateList: false,
    };

    this._mainDiv = React.createRef();
  }

  componentDidMount() {
    this.onResize();
    window.addEventListener('resize', this.onResize);

    this.refreshData();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    const { clientWidth, clientHeight } = this._mainDiv.current;
    this.setState({ cw: clientWidth, ch: clientHeight });
  }

  refreshData = () => {
    this.fetchFavoritesData();
  }

  fetchFavoritesData = (cb) => {
    const { appData } = this.state;
    
    appData.getFavoriteList((favData) => {
      const codes = appData.getFavoritesCodes();

      appData.fetchCountedDataByCodes(codes, (isOk) => {
        if( cb ) { cb(isOk); }

        if( isOk ) {
          const { favorites } = favData;
          
          const tmpList = favorites && favorites.map(d => d.start);
          const dateSet = new Set(tmpList);
          const dateList = ['0', ...dateSet].sort();
          dateList[0] = '전체';

          this.setState({ drawKey: makeid(6), dataList: appData.getDataList(), favData, dateList });
        }
      });
    });
  }

  handleGoBack = () => {
    this.props.goBack();
  }

  toggleShowType = () => {
    const { asTable } = this.state;
    this.setState({ asTable: !asTable });
  }

  toggleShowOption = () => {
    const { showDateList }= this.state;
    this.setState({ showDateList: !showDateList });
  }

  onChildEvent = (compCode, type, param) => {
    const { appData } = this.props;
    const { favorites } = this.state.favData;

    if( 'delete' === type ) {
      for(let i = 0; i < favorites.length; ++i) {
        if( favorites[i].code === compCode ) {
          favorites[i].isSet = false;
          break;
        }
      }
      appData.setFavorite(compCode, { isSet: false });
      this.setState({ drawKey: makeid(6) });
    }
  }

  handleDateChanged = (dt) => () => {
    this.setState({ selectedDate: dt, showDateList: false });
  }

  makeTable = (cw, drawKey, favList) => {
    const { appData, favData } = this.state;
    const { comment } = favData;

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
  
  renderTable = () => {
    const { drawKey, cw, favData, selectedDate } = this.state;
    const { favorites } = favData;

    if( isundef(favorites) ) {
      return null;
    }

    const favList = favorites && favorites.filter(d => selectedDate ==='전체' || d.start === selectedDate);

    const adjW = Math.min(cw - 4, 1130);

    return (
      <div key={`fav-${drawKey}`} className="favTableBox">
        <div className="favDataBody" style={{ width:`${adjW - 20}px`}}>
          { this.makeTable(Math.max(400, adjW / 2 - 20), drawKey, favList) }
        </div>
      </div>
    );
  }

  renderChart = () => {
    const { drawKey, appData, favData, dataList, selectedDate} = this.state;
    const { favorites } = favData;

    if( isundef(favorites) ) {
      return null;
    }

    const checker = {};
    favorites.map(d => {
      if( selectedDate ==='전체' || d.start === selectedDate ) {
        checker[d.code] = true;
      }
      return true;
    });

    const dl = dataList.filter(d => istrue(checker[d.code]));
    return ( <ChartFrame key={`chart-${drawKey}`} appData={appData} dataList={dl} showDetail={true} /> );
  }

  render () {
    const { cw, asTable, selectedDate, showDateList, dateList } = this.state;
    const hw = Math.min(1130, cw);

    return (
      <div ref={this._mainDiv} className="mainWrap">
        <div className="mainHeader">
          <div className="mainTitleBox" style={{ left: Math.max(0, (cw - hw) / 2), width: hw }}>
            <div className="mainTitle" onClick={this.handleGoBack}>{this.props.appTitle}</div>
            <div className="mainMiddle"> </div>
            <div className="favDateBox">
              <div className="favDateSelector" onClick={this.toggleShowOption}>{selectedDate}</div>
              { showDateList &&
                <div className="favDateListBox">
                  { dateList.map((d, i) => <div key={`date-item-${i}`} className="favDateListItem" onClick={this.handleDateChanged(d)}>{d}</div>) }
                </div>
              }
            </div>
            <div className="mainMenuButton" onClick={this.toggleShowType}>{ asTable ? <ImStatsDots size="22" /> : <ImTable2 size="22" /> }</div>
            <div className="mainMenuButton" onClick={this.handleGoBack}><RiArrowGoBackFill size="24" /></div>
          </div>
        </div>
        <div className="scrollLock">
          { asTable ? this.renderTable() : this.renderChart() }
        </div>
      </div>
    );
  }
}

export default InterestingsView;
export { InterestingsView };
