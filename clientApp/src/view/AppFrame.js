import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { convertToChartData } from '../chart/chartTool.js';
import { RunTooltipChart } from '../chart/RunTooltipChart.js';

import { makeid } from '../grid/common.js';

import BasicDataSource from '../grid/BasicDataSource.js';

import './AppFrame.scss';



class AppFrame extends Component {
  static propTypes = {
    appData: PropTypes.object.isRequired  // Application 전반에 걸쳐 사용되는 데이터 객체. redux 컨셉으로 사용할 객체임
  };

  constructor (props) {
    super(props);

    const { appData } = this.props;

    this.state = {
      drawKey: makeid(8),
      clientWidth: 800,
      clientHeight: 400,
      dataList: [ new BasicDataSource(appData.getSampleData()) ],
      zoomIndex: -1 // 확대된 차트 번호. -1이면 전체 표시
    };

    this._mainDiv = React.createRef();
  }

  componentDidMount() {
    const { appData } = this.props;
    appData.addEventListener(this.handleDataEvent);

    this.onResize();
    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    const { clientWidth, clientHeight } = this._mainDiv.current;
    console.log('AppFrame onResize', clientWidth, clientHeight, window.innerWidth, window.innerHeight );
    this.setState({ clientWidth, clientHeight });
  }

  // DataSource에 변경이 있을 경우 발생하는 이벤트 처리
  handleDataEvent = (sender, evt) => {
    const { appData } = this.props;

    if( sender === 'appData' ) {
      const sl = appData.getDataList();
      this.setState({ drawKey: makeid(8), dataList: sl.map(d => new BasicDataSource(d)) });
    } else {
      this.setState({ drawKey: makeid(8) });
    }
  }

  handleChartEvent = (idx) => (type, ev) => {
    // console.log('handleChartEvent', idx, type);

    const { zoomIndex } = this.state;

    if( 'doubleClick' === type ) {
      this.setState({ zoomIndex: (zoomIndex !== -1 ? -1 : idx) });
    }
  }

  makeChartComponent = (ds, i, chartWidth, chartHeight) => {
    const { appData } = this.props;
    const { drawKey } = this.state;

    const { X, Y1, Y2 } = appData.getChartOption();
    const chartData = convertToChartData({ ds, time: X, y1: Y1, y2: Y2 }, appData.getColorMap());

    return (
      <div key={`chart${i}-${drawKey}`} style={{ flexBasis:`${chartWidth}px`}}>
        <RunTooltipChart
          title={ds.title}
          data={chartData}
          showingRangeY1={appData.getExtentY(0)}
          showingRangeY2={appData.getExtentY(1)}
          withLegend={true} withSlider={false} withYSlider={false}
          width={chartWidth} height={chartHeight}
          markerData={appData.getMarkerList(i)}
          onEvent={this.handleChartEvent(i)}
        />
      </div>
    );
  }

  render() {
    const { clientWidth, clientHeight, dataList, zoomIndex } = this.state;

    const adjW = clientWidth - 4, adjH = clientHeight - 4;
    const chW = Math.min(adjW, 900), chH = Math.min(adjH, 460); // 기본 크기

    const cntW = Math.round(adjW / chW),
          cntH = Math.round(adjH / chH);

    const scrollOn = dataList.length > cntW * cntH;

    const chartWidth = (adjW - (scrollOn ? 16 : 0)) / cntW;
    const chartHeight = adjH / cntH - 2;

    // console.log('chart dim', zoomIndex, adjW, adjH, { cntW, cntH, scrollOn, chartWidth, chartHeight });

    return (
      <div ref={this._mainDiv} className="appFrame">
        { zoomIndex !== -1 && this.makeChartComponent(dataList[zoomIndex], zoomIndex, adjW, adjH) }
        { zoomIndex === -1 && dataList.map((ds, i) => this.makeChartComponent(ds, i, chartWidth, chartHeight)) }
      </div>
    );
  }
}

export default AppFrame;
export { AppFrame };
