import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { isvalid, isundef, makeid, setGlobalMessageHandle } from '../util/tool.js';

import { RiArrowGoBackFill, RiRefreshLine } from 'react-icons/ri';
import { GoTriangleLeft, GoTriangleRight } from 'react-icons/go';

import { ImTable2, ImStatsDots } from "react-icons/im";

import Toast from 'react-bootstrap/Toast'

import { SearchBar } from '../view/SearchBar.js';
import { ChartFrame } from './ChartFrame.js';
import { TableFrame} from './TableFrame.js';
import { FavoriteTable } from './FavoriteTable.js';

import './MainFrame.scss';



class MainFrame extends Component {
  static propTypes = {
    goBack: PropTypes.func,
    pageType: PropTypes.string,
    compCode: PropTypes.string
  };

  constructor (props) {
    super(props);

    const { pageType, compCode, appData } = props;

    this.state = {
      pageType, // year, count, guessBP, ...
      compCode,
      compType: '',
      pageNo: 0,
      totalPage: 1,
      message: null,
      waiting: false,
      redrawCount: 0,
      cw: 1130,
      ch: 760,
      appData,
      drawKey: makeid(6),
      dataList: [],
      asTable: true,
      favData: {},
    };

    this._mainDiv = React.createRef();
  }

  componentDidMount() {
    setGlobalMessageHandle(this.showInstanceMessage);

    this.onResize();
    window.addEventListener('resize', this.onResize);

    this.fetchInitialData();
    // this.fetchSampleData();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    const { clientWidth, clientHeight } = this._mainDiv.current;
    this.setState({ cw: clientWidth, ch: clientHeight });
  }

  showInstanceMessage = (msg) => {
    // console.log('showInstanceMessage', msg);
    this.setState({ waiting: false, message: msg });
  }

  fetchSampleData = () => {
    const { appData } = this.state;

    appData.makeSampleData();

    this.setState({ compCode: 'sample', dataList: appData.getDataList() });
  }

  fetchInitialData = () => {
    const { pageType, compCode, compType } = this.state;

    if( 'guessBP' === pageType ) {
      this.fetchGuessBP(0);
    } else if( 'year' === pageType && isvalid(compCode) ) {
      this.fetchCodeData(compCode);
    } else if( 'business' === pageType && isvalid(compType) && compType !== '' ) {
      this.fetchBusinessData(compType);
    } else if( 'interest' === pageType ) {
      this.fetchFavoritesData();
    }
  }

  fetchCodeData = (code, cb) => {
    const { appData } = this.state;

    appData.fetchAnnualDataByCode(code, (isOk) => {
      if( cb ) { cb(isOk); }

      if( isOk ) {
        this.setState({ drawKey: makeid(6), compCode: code, dataList: appData.getDataList() });
      }
    });
  }

  fetchBusinessData = (bType, cb) => {
    const { appData } = this.state;
    const codes = appData.getCodeInBusiness(bType);

    if( isundef(codes) || codes.length <= 0 ) {
      if( cb ) { cb(false); }
    } else {
      appData.fetchCountedDataByCodes(codes, (isOk) => {
        if( cb ) { cb(isOk); }
  
        if( isOk ) {
          this.setState({ drawKey: makeid(6), compType: bType, dataList: appData.getDataList() });
        }
      });
    }
  }

  fetchGuessBP = (page, cb) => {
    const { appData } = this.state;

    appData.fetchBuyPointData(page, (isOk) => {
      if( cb ) { cb(isOk); }

      if( isOk ) {
        const pageInfo = appData.getPageInfo();
        this.setState({ drawKey: makeid(6), pageNo: page, totalPage: pageInfo[1], dataList: appData.getDataList() });
      }
    });
  }

  fetchFavoritesData = (cb) => {
    const { appData } = this.state;
    const codes = appData.getFavoritesCodes();

    // console.log('fetchFavoritesData', codes);

    if( isundef(codes) || codes.length <= 0 ) {
      if( cb ) { cb(false); }
    } else {
      appData.getFavoriteList((favData) => {
        appData.fetchCountedDataByCodes(codes, (isOk) => {
          if( cb ) { cb(isOk); }

          if( isOk ) {
            this.setState({ drawKey: makeid(6), dataList: appData.getDataList(), favData });
          }
        });
      });
    }
  }

  handleGoBack = () => {
    const { goBack } = this.props;

    if( goBack ) {
      goBack();
    }
  }

  hideToastShow = () => {
    this.setState({ message: null });
  }

  handleFilter = (keyword) => {
    const { appData, pageType } = this.state;

    if( pageType === 'business' ) {
      return appData.getFilteredBusinessList(keyword);
    }

    return appData.getFilteredCodes(keyword);
  }

  handlePageTextFocus = (focused) => (ev) => {
    const { pageNo, totalPage } = this.state;

    if( !focused ) {
      const pNo = parseInt(ev.target.value);
      if( !isNaN(pNo) ) {
        if( !this._movePage(pNo - 1) ) {
          ev.target.value = '' + (pageNo + 1) + ' / ' + totalPage;
        }
      }
    } else {
      ev.target.value = '' + (pageNo + 1);
      ev.target.setSelectionRange(0, ev.target.value.length);
    }
  }

  handlePageTextKeyDown = (ev) => {
    if( ev.keyCode === 13 ) {
      this.handlePageTextFocus(false)(ev);
    }
  }

  _movePage = (pNo) => {
    const { pageNo, totalPage } = this.state;

    if( pageNo === pNo || pNo < 0 || pNo >= totalPage ) {
      return false;
    }

    this.fetchGuessBP(pNo);
    return true;
  }

  movePage = (gap) => () => {
    this._movePage( this.state.pageNo + gap );
  }

  makeBarTitle = (d) => {
    if( isundef(d) ) {
      return '';
    }

    return this.state.pageType === 'business' ? d : `${d.name} / ${d.code} / ${d.business}`;
  }

  onBarChanged = (d, cb) => {
    const { pageType } = this.state;

    if( pageType === 'business' ) {
      this.fetchBusinessData(d, cb);
    } else {
      this.fetchCodeData(d, cb);
    }
  }

  switchShowType = () => {
    const { asTable } = this.state;
    this.setState({ asTable: !asTable });
  }

  render () {
    const {
      drawKey, cw, pageType, message, appData, compCode, compType, dataList, pageNo, totalPage, asTable, favData
    } = this.state;

    const toastOn = isvalid(message);
    const hw = Math.min(1130, cw);

    const isType = pageType === 'business';
    const chartOn = pageType === 'year' || isType || pageType === 'guessBP' || (!asTable && pageType === 'interest');
    const tableOn = pageType === '4pxx' || (asTable && pageType === 'interest');

    const hasSearchBox = isType || pageType === 'year';
    const hasNaviBox = pageType === 'guessBP' && totalPage >= 2;

    const dwOn = hasNaviBox && pageNo > 0;
    const upOn = hasNaviBox && pageNo < totalPage - 1;

    return (
      <div ref={this._mainDiv} className="mainWrap">
        <div className="mainHeader">
          <div className="mainTitleBox" style={{ left: Math.max(0, (cw - hw) / 2), width: hw }}>
            <div className="mainTitle" onClick={this.handleGoBack}>{this.props.appTitle}</div>
            <div className="mainMiddle">
              { hasSearchBox &&
                <SearchBar
                  itemList={isType ? appData.getBusinessList() : appData.getCodeList()}
                  onGetList={this.handleFilter}
                  selected={isType ? compType : appData.getCodeData(compCode)}
                  onChange={this.onBarChanged}
                  makeTitle={this.makeBarTitle}
                />
              }
            </div>
            { hasNaviBox &&
              <div className="mainNaviBox">
                <div className={dwOn ? "mainMenuButton" : "mainMenuButtonDisabled"} onClick={dwOn ? this.movePage(-1) : null}>
                  <GoTriangleLeft size="24" />
                </div>
                <input key={`pageNo-box-${drawKey}`}
                  className="mainNaviPosition"
                  type="text" defaultValue={(pageNo + 1) + ' / ' + totalPage}
                  onFocus={this.handlePageTextFocus(true)}
                  onBlur={this.handlePageTextFocus(false)}
                  onKeyDown={this.handlePageTextKeyDown}
                />
                <div className={upOn ? "mainMenuButton" : "mainMenuButtonDisabled"} onClick={upOn ? this.movePage(1) : null}>
                  <GoTriangleRight size="24" />
                </div>
                <div className="mainMenuSeparator" />
              </div>
            }
            { pageType === 'year' && <div className="mainMenuButton" onClick={this.fetchInitialData}><RiRefreshLine size="24" /></div> }
            { pageType === 'interest' &&
              <div className="mainMenuButton" onClick={this.switchShowType}>{ tableOn ? <ImStatsDots size="22" /> : <ImTable2 size="22" /> }</div>
            }
            <div className="mainMenuButton" onClick={this.handleGoBack}><RiArrowGoBackFill size="24" /></div>
          </div>
        </div>
        <div className="scrollLock">
          { chartOn && <ChartFrame key={`chart-${drawKey}`} appData={appData} dataList={dataList} showDetail={pageType !== 'year'} /> }
          { tableOn && pageType !== 'interest' && <TableFrame key={`table-${drawKey}`} appData={appData} /> }
          { tableOn && pageType === 'interest' && <FavoriteTable key={`fav-${drawKey}`} appData={appData} favData={favData} /> }
        </div>
        { toastOn &&
          <div className="blockedLayer" onClick={this.hideToastShow}>
            <Toast className="toastBox" onClose={this.hideToastShow} show={toastOn} delay={3000} autohide animation>
              <Toast.Header>
                <strong className="mr-auto">Message</strong>
              </Toast.Header>
              <Toast.Body>{message}</Toast.Body>
            </Toast>
          </div>
        }
      </div>
    );
  }
}

export default MainFrame;
export { MainFrame };
