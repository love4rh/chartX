import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { isundef, makeid } from '../util/tool.js';

import { RiArrowGoBackFill, RiRefreshLine } from 'react-icons/ri';

import { SearchBar } from './SearchBar.js';
import { ChartFrame } from './ChartFrame.js';

import './viewStyle.scss';



class CompanyChartView extends Component {
  static propTypes = {
    appTitle: PropTypes.string.isRequired,
    appData: PropTypes.object.isRequired,
    goBack: PropTypes.func.isRequired,
    compCode: PropTypes.string.isRequired,
  };

  constructor (props) {
    super(props);

    const { appData, compCode } = props;

    this.state = {
      compCode,
      cw: 1130,
      ch: 760,
      appData,
      drawKey: makeid(6),
      dataList: [],
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
    const { compCode } = this.state;

    this.fetchCodeData(compCode);
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

  handleGoBack = () => {
    this.props.goBack();
  }

  handleFilter = (keyword) => {
    const { appData } = this.state;

    return appData.getFilteredCodes(keyword);
  }

  makeBarTitle = (d) => {
    const { appData } = this.state;

    if( isundef(d) ) { return ''; }

    return appData.isHideMode() ? 'title here': `${d.name} / ${d.code} / ${d.business}`;
  }

  onBarChanged = (code, cb) => {
    this.fetchCodeData(code, cb);
  }

  render () {
    const { drawKey, cw, appData, compCode, dataList } = this.state;
    const hw = Math.min(1130, cw);

    return (
      <div ref={this._mainDiv} className="mainWrap">
        <div className="mainHeader">
          <div className="mainTitleBox" style={{ left: Math.max(0, (cw - hw) / 2), width: hw }}>
            <div className="mainTitle" onClick={this.handleGoBack}>{this.props.appTitle}</div>
            <div className="mainMiddle">
              <SearchBar
                itemList={appData.getCodeList()}
                onGetList={this.handleFilter}
                selected={appData.getCodeData(compCode)}
                onChange={this.onBarChanged}
                makeTitle={this.makeBarTitle}
              />
            </div>
            <div className="mainMenuButton" onClick={this.refreshData}><RiRefreshLine size="24" /></div>
            <div className="mainMenuButton" onClick={this.handleGoBack}><RiArrowGoBackFill size="24" /></div>
          </div>
        </div>
        <div className="scrollLock">
          <ChartFrame key={`chart-${drawKey}`} appData={appData} dataList={dataList} showDetail={false} />
        </div>
      </div>
    );
  }
}

export default CompanyChartView;
export { CompanyChartView };
