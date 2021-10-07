import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { isvalid, makeid, setGlobalMessageHandle } from '../util/tool.js';

import { RiArrowGoBackFill } from 'react-icons/ri';
import { GoTriangleLeft, GoTriangleRight } from 'react-icons/go';

import Toast from 'react-bootstrap/Toast'

import { SearchBar } from '../view/SearchBar.js';
import { ChartFrame } from './ChartFrame.js';

import BasicDataSource from '../grid/BasicDataSource.js';

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
      pageNo: 0,
      totalPage: 1,
      message: null,
      waiting: false,
      redrawCount: 0,
      cw: 1130,
      ch: 760,
      appData,
      drawKey: makeid(6),
      dataList: []
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

    const sl = appData.getDataList();
    const dataList = sl.map(d => new BasicDataSource(d));

    this.setState({ compCode: 'sample', dataList });
  }

  fetchInitialData = () => {
    const { pageType, compCode } = this.state;

    if( 'guessBP' === pageType ) {
      this.fetchGuessBP(0);
    } else if( isvalid(compCode) ) {
      this.fetchCodeData(compCode);
    }
  }

  fetchCodeData = (code, cb) => {
    const { appData } = this.state;

    appData.fetchAnnualDataByCode(code, (isOk) => {
      if( cb ) { cb(isOk); }

      if( isOk ) {
        const sl = appData.getDataList();
        const dataList = sl.map(d => new BasicDataSource(d));

        this.setState({ compCode: code, dataList });
      }
    });
  }

  fetchGuessBP = (page, cb) => {
    const { appData } = this.state;

    appData.fetchBuyPointData(page, (isOk) => {
      if( cb ) { cb(isOk); }

      if( isOk ) {
        const sl = appData.getDataList();
        const dataList = sl.map(d => new BasicDataSource(d));
        const pageInfo = appData.getPageInfo();

        this.setState({ pageNo: page, totalPage: pageInfo[1], dataList });
      }
    });
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
    const { appData } = this.state;

    return appData.getFilteredCodes(keyword);
  }

  movePage = (mv) => () => {
    const { pageNo, totalPage } = this.state;
    const np = pageNo + mv;

    if( np < 0 || np >= totalPage ) {
      return;
    }

    this.fetchGuessBP(np);
  }

  render () {
    const { drawKey, cw, pageType, message, appData, compCode, dataList, pageNo, totalPage } = this.state;

    const toastOn = isvalid(message);

    const hw = Math.min(1130, cw);

    const chartOn = pageType === 'year' || pageType === 'count' || pageType === 'guessBP';
    const hasSearchBox = pageType === 'year' || pageType === 'count';
    const hasNaviBox = pageType === 'guessBP' && totalPage >= 2;

    return (
      <div ref={this._mainDiv} className="mainWrap">
        <div className="mainHeader">
          <div className="mainTitleBox" style={{ left: Math.max(0, (cw - hw) / 2), width: hw }}>
            <div className="mainTitle">{this.props.appTitle}</div>
            <div className="mainMiddle">
              { hasSearchBox && <SearchBar onGetList={this.handleFilter} keyword={appData.getCodeTitle(compCode)} changeCode={this.fetchCodeData} /> }
            </div>
            { hasNaviBox &&
              <div className="mainNaviBox">
                { pageNo > 0 && <div className="mainMenuButton" onClick={this.movePage(-1)}><GoTriangleLeft size="24" /></div> }
                { pageNo < totalPage - 1 && <div className="mainMenuButton" onClick={this.movePage(1)}><GoTriangleRight size="24" /></div> }
                <div className="mainMenuSeparator" />
              </div>
            }
            <div className="mainMenuButton" onClick={this.handleGoBack}><RiArrowGoBackFill size="24" /></div>
          </div>
        </div>
        <div className="scrollLock">
          { chartOn && <ChartFrame key={`chart-${compCode}-${drawKey}`} appData={appData} dataList={dataList} /> }
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
