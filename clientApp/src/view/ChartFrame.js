import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { convertToChartData } from '../chart/chartTool.js';
import { RunTooltipChart } from '../chart/RunTooltipChart.js';

import { makeid } from '../grid/common.js';

import './ChartFrame.scss';



class ChartFrame extends Component {
  static propTypes = {
    appData: PropTypes.object.isRequired,  // Application 전반에 걸쳐 사용되는 데이터 객체. redux 컨셉으로 사용할 객체임
    dataList: PropTypes.array.isRequired
  };

  constructor (props) {
    super(props);

    this.state = {
      drawKey: makeid(8),
      clientWidth: 800,
      clientHeight: 400,
      zoomIndex: -1 // 확대된 차트 번호. -1이면 전체 표시
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
    // console.log('ChartFrame onResize', clientWidth, clientHeight, window.innerWidth, window.innerHeight );
    this.setState({ clientWidth, clientHeight });
  }

  handleChartEvent = (idx) => (type, ev) => {
    // console.log('handleChartEvent', idx, type);

    // const { zoomIndex } = this.state;

    if( 'doubleClick' === type ) {
      // this.setState({ zoomIndex: (zoomIndex !== -1 ? -1 : idx) });
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
    const { dataList } = this.props;
    const { clientWidth, clientHeight } = this.state;

    const adjW = clientWidth - 4, adjH = clientHeight - 4;
    const chartWidth = Math.min(adjW, 1130),
      chartHeight = Math.min(adjH, 460); // 기본 크기

    return (
      <div ref={this._mainDiv} className="chartFrame">
        { dataList.map((ds, i) => this.makeChartComponent(ds, i, chartWidth, chartHeight)) }
      </div>
    );
  }
}

export default ChartFrame;
export { ChartFrame };
