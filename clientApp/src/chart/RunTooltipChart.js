import React, { Component } from 'react';
import PropTypes from 'prop-types';

import * as d3 from 'd3';

import { makeid, isundef, isvalid, istrue, numberWithCommas } from '../grid/common.js';

import { IoMdOptions } from 'react-icons/io';
import { SiNaver } from "react-icons/si";
import { RiCheckboxBlankLine, RiCheckboxLine, RiHeartFill, RiHeartLine, RiLineChartLine, RiEditBoxLine } from 'react-icons/ri';

import { RangeSlider, sliderSize } from '../component/RangeSlider.js';

import { OptionPanel } from './OptionPanel.js';
import { MemoPanel } from './MemoPanel.js';

import './styles.scss';



/**
 * Run Chart
 * 참고: https://github.com/adamjanes/udemy-d3/blob/master/06/6.10.0/js/main.js
 */ 
class RunTooltipChart extends Component {
  static propTypes = {
    onEvent: PropTypes.func, // 차트에서 발생하는 이벤트 핸들러
    width: PropTypes.number, // 차트 가로 너비
    height: PropTypes.number, // 차트 세로 넢이
    title: PropTypes.string, // 차트 제목
    data: PropTypes.object.isRequired, // 차팅 데이터. convertToChartData 참고
    showingRangeX: PropTypes.array, // X축 표시 범위. 없으면 전체
    showingRangeY1: PropTypes.array, // Left축 표시 범위. 없으면 전체
    showingRangeY2: PropTypes.array, // Right축 표시 범위. 없으면 전체
    withSlider: PropTypes.bool, // 데이터 조정을 위한 슬라이더 포함 여부 (가로축)
    withYSlider: PropTypes.bool, // 데이터 조정을 위한 슬라이더 포함 여부 (세로축)
    withLegend: PropTypes.bool, // 범례 표시 여부
    markerData: PropTypes.array, // Marker 데이터. [{ point:[ Marking 할 X 축 인덱스, ...], color:'red' }, ... ]. Y는 첫 번째 시리즈의 값을 이용함
    appData: PropTypes.object,
    compCode: PropTypes.string, // My Company 여부
    showDetail: PropTypes.bool, // 종목 차트 보기 버튼 표시 여부
  }

  constructor(props) {
    super(props);

    const {
      width, height, data, showingRangeX, showingRangeY1, showingRangeY2,
      withLegend, markerData, appData, compCode
    } = this.props;

    const withSlider = istrue(this.props.withSlider);
    const withYSlider = istrue(this.props.withYSlider);

    const useY2 = data && data.yData.length > 1;

    // data {
    // dataSize: 데이터 크기, xData: X축 데이터(없을 수 있음), yData: Y축 데이터 [Y1, Y2],
    // dateTimeAxis: X축 시간축 여부, extentX: X축 범위, extentY: Y축 범위 목록
    // }

    const { dataSize, xData, dateTimeAxis, extentX, extentY, xLabel } = data;
    const yData = [];
    data.yData.map((dl, idx) => {
      dl.map(dd => {
        yData.push({ ...dd, shown: (!appData.isCheckerMode() || yData.length > 0), useY2: (idx > 0) }); // TODO yData.length > 0 --> true
        return true;
      });
      return true;
    });

    this.state = {
      compID: 'tk' + makeid(8),
      chartDiv: React.createRef(),
      data: { dataSize, xLabel, xData, dateTimeAxis, extentX, yData, extentY1:extentY[0], extentY2:extentY[1] },
      useY2,
      margin: { LEFT: 70, RIGHT: (useY2 ? 70 : 10), TOP: 5, BOTTOM: 70 },
      canvasWidth: width - (withYSlider ? (sliderSize + (useY2 ? sliderSize : 0)) : 0),
      canvasHeight: height - (withSlider ? sliderSize : 0) - (withLegend ? 36 : 0),
      chartElement: {},
      withSlider,
      withYSlider,
      withLegend,
      userXExtent: showingRangeX,
      userY1Extent: showingRangeY1,
      userY2Extent: showingRangeY2,
      markerData,
      optionPanelOn: false,
      memoPanelOn: false,
      favorite: appData.isFavorite(compCode)
    };

    // console.log('RunChart construct', this.state);
  }
  
  componentDidMount() {
    const { canvasWidth, canvasHeight } = this.state;
    const chartElement = this.initializeD3Area(canvasWidth, canvasHeight);

    this.setState({ chartElement });
  }

  componentWillUnmount() {
    //
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if( nextProps.width !== prevState.canvasWidth || nextProps.height !== prevState.canvasHeight ) {
      const withSlider = istrue(prevState.withSlider);
      const withYSlider = istrue(prevState.withYSlider);
      const withLegend = istrue(prevState.withLegend);
      const hasY2 = nextProps.data.yData.length > 1;

      return {
        withSlider, withYSlider,
        canvasWidth: nextProps.width - (withYSlider ? (sliderSize + (hasY2 ? sliderSize : 0)) : 0),
        canvasHeight: nextProps.height - (withSlider ? sliderSize : 0) - (withLegend ? 36 : 0)
      };
    }

    return null;
  }

  // eslint-disable-next-line
  shouldComponentUpdate(nextProps, nextState) {
    // element를 갱신해야 하는 경우라면
    if( this.state.canvasWidth !== nextState.canvasWidth || this.state.canvasHeight !== nextState.canvasHeight ) {
      this.setState({
        chartElement: this.initializeD3Area(nextState.canvasWidth, nextState.canvasHeight)
      });
    }

    return true;
  }

  componentDidUpdate() {
    this.updateD3Chart();
  }

  initializeD3Area = (canvasWidth, canvasHeight) => {
    // const { title } = this.props;
    const { compID, chartDiv, margin, data, useY2 } = this.state;

    const { dateTimeAxis, xLabel } = data;

    const WIDTH = canvasWidth - margin.LEFT - margin.RIGHT;
    const HEIGHT = canvasHeight - margin.TOP - margin.BOTTOM;

    if( isvalid(this._svg) ) {
      this._svg.remove();
    }

    const svg = d3.select(chartDiv.current).append('svg')
      .attr('class', compID)
      .attr('width', canvasWidth)
      .attr('height', canvasHeight);

    this._svg = svg;
    this._g = svg.append('g')
      .attr('transform', `translate(${margin.LEFT}, ${margin.TOP})`);

    const g = this._g;

    // to find x position
    const bisectDate = d3.bisector(d => d).left;

    // create element for x-axis: label, scale, axis, axisCall
    const axisX = {};

    axisX['label'] = g.append('text')
      .attr('class', 'x axisLabel')
      .attr('y', HEIGHT + 50)
      .attr('x', WIDTH / 2)
      .attr('font-size', '20px')
      .attr('text-anchor', 'middle')
      .text(xLabel);

    axisX['scale'] = dateTimeAxis ? d3.scaleTime().range([0, WIDTH]) : d3.scaleLinear().range([0, WIDTH]);
    axisX['axis'] = g.append('g').attr('class', 'x axis').attr('transform', `translate(0, ${HEIGHT})`);
    axisX['axisCall'] = d3.axisBottom();

    // create element for y-axis
    const axesY = [];
    const tmpObj = {};

    tmpObj['label'] = g.append('text')
      .attr('class', 'y axisLabel') // 
      .attr('y', -60)
      .attr('x', - (HEIGHT - 70) / 2)
      .attr('font-size', '20px')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .text('Y2');

    tmpObj['scale'] = d3.scaleLinear().range([HEIGHT, 0]);
    tmpObj['axis'] = g.append('g').attr('class', 'y axis');
    tmpObj['axisCall'] = d3.axisLeft();

    axesY.push(tmpObj);

    if( useY2 ) {
      const tmpObj2 = {};

      tmpObj2['label'] = g.append('text')
        .attr('class', 'y axisLabel')
        .attr('y', WIDTH + 60)
        .attr('x', - (HEIGHT - 70) / 2)
        .attr('font-size', '20px')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .text('Y2');

      tmpObj2['scale'] = d3.scaleLinear().range([HEIGHT, 0]);
      tmpObj2['axis'] = g.append('g').attr('class', 'y y2 axis').attr('transform', `translate(${WIDTH}, 0)`);;
      tmpObj2['axisCall'] = d3.axisRight();

      axesY.push(tmpObj2);
    }

    return { bisectDate, axisX, axesY };
  }

  updateD3Chart = () => {
    const {
      chartDiv, canvasWidth, canvasHeight,
      compID, margin, data, chartElement, useY2,
      userXExtent, userY1Extent, userY2Extent, markerData
    } = this.state;

    const { bisectDate, axisX, axesY } = chartElement;

    // xData가 null이면 data index임. xData가 null이 아니고 dateTimeAxis가 false이면 label임.
    const { dateTimeAxis, dataSize, xData, extentX, yData, extentY1, extentY2, xLabel } = data;

    const WIDTH = canvasWidth - margin.LEFT - margin.RIGHT;
    const HEIGHT = canvasHeight - margin.TOP - margin.BOTTOM;

    // axis props: label, scale, axis, axisCall

    axisX['scale'].domain(isvalid(userXExtent) ? userXExtent : extentX);
    axisX['axisCall'].scale(axisX['scale']);

    const indexAxisHasLabel = isvalid(xData) && !dateTimeAxis;

    const act = axisX['axis']
      .transition()
      .call(!indexAxisHasLabel ? axisX['axisCall'] : axisX['axisCall'].tickFormat(idx => idx < 1 || idx > xData.length ? '' : xData[idx - 1]))
      .selectAll('text')
      .attr('y', '10');

    if( dateTimeAxis || indexAxisHasLabel ) {
      act.attr('x', '-5')
        .attr('text-anchor', 'end')
        .transition().attr('transform', 'rotate(-45)');
    } else {
      act.attr('x', '0')
        .attr('text-anchor', 'middle');
    }

    axesY.map((axis, idx) => {
      if( idx === 1 ) {
        axis['scale'].domain(isvalid(userY2Extent) ? userY2Extent : extentY2);
      } else {
        axis['scale'].domain(isvalid(userY1Extent) ? userY1Extent : extentY1);
      }
      axis['axisCall'].scale(axis['scale']);
      axis['axis'].transition().call( axis['axisCall'].tickFormat(v => numberWithCommas(v)) );
      return true;
    });

    const g = this._g;

    const xScaler = axisX['scale'];

    // Overlay for handling mouse event
    const guideID = compID + '_guider';
    const focusDivID = compID + '_focus';
    const overlayDivID = compID + '_overlay';

    d3.selectAll('.' + guideID).remove();
  
    if( useY2 ) {
      const zeroPos =  axesY[1]['scale'](0);

      g.append('g').classed(guideID, true)
        .classed('zero-line', true)
        .append('line')
        .attr('x1', 0).attr('x2', WIDTH)
        .attr('y1', zeroPos).attr('y2', zeroPos);
    }

    // add guidance line
    const hoverLine = g.append('g').classed(guideID, true)
      .classed('focus', true).classed(focusDivID, true)
      .style('display', 'none');

    hoverLine.append('line')
      .attr('class', 'x-hover-line hover-line')
      .attr('y1', 0).attr('y2', HEIGHT);

    hoverLine.append('line')
      .attr('class', 'y-hover-line hover-line')
      .attr('x1', 0).attr('x2', WIDTH);

    const tipHalf = 100 / 2;
    
    const axisTipX = g.append('g')
      .classed(guideID, true).classed(compID + '_tipX', true)
      .style('display', 'none');

    axisTipX.append('polygon')
      .attr('points', `0,5 ${tipHalf - 5},5 ${tipHalf},0 ${tipHalf + 5},5 ${tipHalf * 2},5 ${tipHalf * 2},28 0,28`)
      .attr('fill', 'black').attr('stoke', 'none');
    
    axisTipX.append('text')
      .classed('axis-tip-x', true)
      .attr('x', `${tipHalf}`).attr('y', '21')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .text('2021-12-22');

    const tipSize = margin.LEFT;
    const axisTipY1 = g.append('g')
      .classed(guideID, true).classed(compID + '_tipY1', true)
      .style('display', 'none');

    axisTipY1.append('polygon')
      .attr('points', `0,0 ${tipSize},0 ${tipSize + 12},12 ${tipSize},24 0,24`)
      .attr('fill', 'black').attr('stoke', 'none');

    axisTipY1.append('text')
      .classed('axis-tip-x', true)
      .attr('x', `${tipSize - 5}`).attr('y', '16')
      .attr('text-anchor', 'end')
      .attr('fill', 'white')
      .text(' ');

    const tipElements = [ hoverLine, axisTipX, axisTipY1 ];

    let axisTipY2 = null;

    if( useY2 ) { // Y2 축을 사용한다면
      axisTipY2 = g.append('g')
        .classed(guideID, true).classed(compID + '_tipY2', true)
        .style('display', 'none');

      axisTipY2.append('polygon')
        .attr('points', `0,12 12,0 ${tipSize + 12},0 ${tipSize + 12},24 12,24`)
        .attr('fill', 'black').attr('stoke', 'none');

      axisTipY2.append('text')
        .classed('axis-tip-x', true)
        .attr('x', `15`).attr('y', '16')
        .attr('text-anchor', 'start')
        .attr('fill', 'white')
        .text(' ');

      tipElements.push(axisTipY2);
    }

    // Mouse Over시 Tooltip / Guide Line 처리
    const cbGuiderShown = (ev) => {
      let dataIdx = 0;
      const x0 = xScaler.invert(ev.offsetX - margin.LEFT);

      // 날짜 축인 경우
      if( dateTimeAxis ) {
        dataIdx = bisectDate(xData, x0, 1);
        const v0 = xData[dataIdx - 1], v1 = xData[dataIdx];

        if( !v0 || !v1 ) { return; }

        hoverLine.select('.x-hover-line').attr('transform', `translate(${xScaler(x0 - v0 > v1 - x0 ? v1 : v0)}, 0)`);
        axisTipX.attr('transform', `translate(${xScaler(x0 - v0 > v1 - x0 ? v1 : v0)}, ${HEIGHT})`);
      } else {
        dataIdx = Math.max(0, Math.min(Math.round(x0) - 1, dataSize - 1));
        hoverLine.select('.x-hover-line').attr('transform', `translate(${xScaler(dataIdx + 1)}, 0)`);
        axisTipX.attr('transform', `translate(${xScaler(dataIdx + 1) - tipHalf}, ${HEIGHT})`);
      }

      hoverLine.select('.y-hover-line').attr('transform', `translate(0, ${ev.offsetY - margin.TOP})`);

      axisTipX.select('.axis-tip-x').text(`${xData ? xData[dataIdx] : dataIdx} (${dataIdx + 1})`); // TODO DateTime 처리

      const y1Val = Math.round(axesY[0]['scale'].invert(ev.offsetY - margin.TOP));
      
      axisTipY1.attr('transform', `translate(-80, ${ev.offsetY - margin.TOP - 12})`);
      axisTipY1.select('.axis-tip-x').text(`${numberWithCommas(y1Val)}`);

      if( isvalid(axisTipY2) ) {
        const y2Val =  Math.round(axesY[1]['scale'].invert(ev.offsetY - margin.TOP) * 10000) / 10000;
      
        axisTipY2.attr('transform', `translate(${WIDTH}, ${ev.offsetY - margin.TOP - 12})`);
        axisTipY2.select('.axis-tip-x').text(`${y2Val}`);
      }
    } // end of callback for showing tooptip


    let mouseDown = -1; // -1: not mouse down, -2: need define down point, 0이상: 시작 포인트

    // 마우스 클릭시 나타날 툴팁
    const tooltipDivID = compID + '_tooltip';
    const chartTag = chartDiv.current;
    const tooltipBox = d3.select(chartTag)
      .append('div').classed(guideID, true)
      .classed('chartToolTip', true).classed(tooltipDivID, true)
      .style('display', 'none');

    // Mouse Down 처리용 핸들러
    const cbTooltipShown = (ev) => {
      let dataIdx = 0;
      const x0 = xScaler.invert(ev.offsetX - margin.LEFT);

      // 날짜 축인 경우
      if( dateTimeAxis ) {
        dataIdx = bisectDate(xData, x0, 1);
        const v0 = xData[dataIdx - 1], v1 = xData[dataIdx];
        if( !v0 || !v1 ) { return; }
      } else {
        dataIdx = Math.max(0, Math.min(Math.round(x0) - 1, dataSize - 1));
      }

      // Tooltip box
      tooltipBox.html(''); // 기존 툴팁 삭제

      tooltipBox.append('div')
        .classed('tooltipItem', true)
        .text(`${xLabel}: ${xData ? xData[dataIdx] : dataIdx} (${dataIdx + 1}${mouseDown >= 0 ? '/' + (dataIdx - mouseDown) : ''})`); // TODO DateTime 처리

      yData.map(dd => {
        const cv = Math.round(dd.data[dataIdx] * 10000) / 10000;
        const tipTag = tooltipBox.append('div').classed('tooltipItem', true).style('color', dd.color);

        if( mouseDown >= 0 ) {
          const pv = Math.round(dd.data[mouseDown] * 10000) / 10000;
          if( dd.title.startsWith('S/') || dd.title.startsWith('SLOPE') ) {
            tipTag.text(`${dd.title}: ${numberWithCommas(cv)} (${numberWithCommas(Math.round((cv - pv) * 1000) / 1000 )})`);
          } else {
            tipTag.text(`${dd.title}: ${numberWithCommas(cv)} (${numberWithCommas(Math.round(cv / pv * 1000) / 1000 )})`);
          }
        } else {
          tipTag.text(`${dd.title}: ${numberWithCommas(cv)}`);
        }

        return true;
      });

      if( mouseDown === -2 ) {
        mouseDown = dataIdx;
      }

      const guideBoxWidth = 125 + 10;
      const guideBoxHeight = yData.length * 28 + 10;
      const maxX = chartTag.offsetLeft + chartTag.offsetWidth;
      const maxY = chartTag.offsetTop + chartTag.offsetHeight;
      const pX = ev.clientX + guideBoxWidth + margin.LEFT > maxX ? ev.clientX - guideBoxWidth + 5 : ev.clientX + 10;
      const pY = ev.clientY + guideBoxHeight + margin.BOTTOM > maxY ? ev.clientY - guideBoxHeight + 10 : ev.clientY + 10;

      tooltipBox.attr('style', `left: ${pX}px; top: ${pY}px;`);
      tooltipBox.style('display', null);
    }

    g.append('rect').classed(guideID, true)
      .classed('overlay', true).classed(overlayDivID, true)
      .attr('width', WIDTH).attr('height', HEIGHT)
      .on('mouseenter', () => { tipElements.map(e => e.style('display', null)) })
      .on('mouseleave', (ev) => {
        const mX = ev.offsetX - margin.LEFT, mY = ev.offsetY - margin.TOP;
        if( mX <= 0 || mX >= WIDTH || mY <= 0 || mY >= HEIGHT ) {
          tipElements.map(e => e.style('display', 'none'));
        }
      })
      .on('mousemove', (ev) => {
        cbGuiderShown(ev);
        if( mouseDown !== -1 ) {
          cbTooltipShown(ev);
        }
      })
      .on('mousedown', () => mouseDown = -2 )
      .on('mouseup', () => { tooltipBox.style('display', 'none'); mouseDown = -1; } )
    ;// end of overlay

    const clipBoxID = compID + '_clip';

    g.append('clipPath')
      .attr('id', clipBoxID)
      .append('rect')
      .attr('width', WIDTH)
      .attr('height', HEIGHT);

    // Line Series Path generator
    yData.map((dd, idx) => {
      const yScaler = axesY[dd.useY2 ? 1 : 0]['scale'];
      const line = d3.line().x((_, i) => xScaler(dateTimeAxis ? xData[i] : i + 1)).y(d => yScaler(d));
      const lineID = compID + '_line_' + idx;

      d3.select('.' + lineID).remove();

      if( !dd.shown ) {
        return false;
      }

      g.append('g')
        .attr('clip-path', `url(#${clipBoxID})`)
        .append('path')
        .classed(lineID, true)
        .on('mouseenter', () => d3.select('.' + lineID).classed('selectedLine', true) )
        .on('mouseleave',  () => d3.select('.' + lineID).classed('selectedLine', false) )
        .on('mousedown', () => mouseDown = -2 )
        .on('mouseup', () => { tooltipBox.style('display', 'none'); mouseDown = -1; } )
        .attr('fill', 'none')
        .attr('stroke', dd.color)
        .attr('stroke-width', '2px')
        .attr('opacity', '0.8')
        .transition()
        .attr('d', line(dd.data));

      return true;
    });

    // 시점 마커 추가
    const markerID = compID + '_marker';

    d3.select('.' + markerID).remove();

    if( isvalid(markerData) && markerData.length > 0 ) {
      const mg = g.append('g')
        .attr('clip-path', `url(#${clipBoxID})`)
        .classed(markerID, true)
      ;

      // const y1Scale = axesY[0]['scale'];
      // const y1Data = yData[0].data;
      const zeroPos =  axesY[1]['scale'](0);

      markerData.map(md => {
        md.point.map(idx => {
          mg.append('circle')
            .attr('cx', xScaler(idx + 1))
            .attr('cy', zeroPos) // y1Scale(y1Data[idx])) // TODO 사용자 정의로 확장
            .attr('r', 4)
            .attr('fill', md.color)
            .attr('stroke', 'black')
            .attr('stroke-width', '1')
            .on('mousedown', () => mouseDown = -2 )
            .on('mouseup', () => { tooltipBox.style('display', 'none'); mouseDown = -1; } )
          ;
          return true;
        });
        return true;
      });
    } // end of marker-if
  }

  handleSliderEvent = (axisType) => (type, param) => {
    // console.log('handleSliderEvent', axisType, type, param);

    if( axisType === 'X' ) {
      this.setState({ userXExtent: param });
    } else if( axisType === 'Y1' ) {
      this.setState({ userY1Extent: param });
    } else if( axisType === 'Y2' ) {
      this.setState({ userY2Extent: param });
    }
  }

  handleLengendItemClick = (sIdx) => () => {
    const { data } = this.state;
    const { yData } = data;

    yData[sIdx].shown = !yData[sIdx].shown;

    this.setState({ data: data });
  }

  handleMouseOut = (ev) => {
    const { compID } = this.state;
    ['_focus', '_tooltip'].map(s => d3.select('.' + compID + s).style('display', 'none'));
  }

  handleDblClick = (ev) => {
    const { onEvent } = this.props;

    if( onEvent ) {
      onEvent('doubleClick', ev);
    }
  }

  handleClickOption = () => {
    const { optionPanelOn } = this.state;
    this.setState({ optionPanelOn: !optionPanelOn, memoPanelOn: false });
  }

  handleOptionPanel = (type, userExtent) => {
    let update = false;
    const newState = { optionPanelOn: false, memoPanelOn: false };

    if( 'apply' === type ) {
      newState['userY1Extent'] = userExtent[0];
      if( userExtent.length >= 2 ) {
        newState['userY2Extent'] = userExtent[1];
      }
      update = true;
    }

    this.setState(newState);

    if( update ) { this.updateD3Chart(); }
  }

  // 실제 처리는 MemoPanel에서 모두 수행하고 결과만 리턴함
  handleMemoPanel = (type, text) => {
    const newState = { optionPanelOn: false, memoPanelOn: false };

    if( 'add' === type ) { // 코멘트 추가
      newState.memoPanelOn = true;
    }

    this.setState(newState);
  }

  handleTitleClick = () => {
    const { appData, compCode } = this.props;
    const { favorite } = this.state;

    appData.setFavorite(compCode, { isSet: !favorite });
    this.setState({ favorite: !favorite });
  }

  handleMenuClick = (type) => () => {
    const { compCode } = this.props;

    if( 'naver' === type ) {
      window.open(`https://finance.naver.com/item/main.naver?code=${compCode}`, '_blank');
    } else if( 'jump' === type ) {
      // appData.gotoPage(compCode);
      const url = window.location.href;
      const pRoot = url.indexOf('/', 10);
      window.open(url.substring(0, pRoot) + '/year/' + compCode, '_blank');
    } else if( 'memo' === type ) {
      const { memoPanelOn } = this.state;
      this.setState({ optionPanelOn: false, memoPanelOn: !memoPanelOn });
    }
  }

  renderOptionPanel () {
    const { data, useY2, userY1Extent, userY2Extent } = this.state;
    const { extentY1, extentY2 } = data;

    const extentData = [];

    extentData.push({
      title: '왼쪽 축 범위',
      extent: extentY1,
      value: isvalid(userY1Extent) ? userY1Extent : extentY1
    });

    if( useY2 ) {
      extentData.push({
        title: '오른쪽 축 범위',
        extent: extentY2,
        value: isvalid(userY2Extent) ? userY2Extent : extentY2
      });
    }

    return (
      <OptionPanel extentData={extentData} onApply={this.handleOptionPanel} />
    );
  }

  render () {
    const { width, title, showDetail, appData, compCode } = this.props;
    const {
      data, chartDiv, margin,
      withSlider, withYSlider, withLegend,
      useY2, userXExtent, userY1Extent, userY2Extent,
      optionPanelOn, memoPanelOn, favorite
    } = this.state;
    const { xData, yData, dateTimeAxis, extentX, extentY1, extentY2 } = data;

    const a = 9, p = 8;
    const hasY2 = useY2;

    return (
      <div className="chartMain">
        <div className="chartHeader">
          <div className="chartTitleDiv">
            { appData.isHideMode() ? 'title' : title }
            { favorite  && <div className="chartFavorite" onClick={this.handleTitleClick}><RiHeartFill size="22"/></div> }
            { !favorite && <div className="chartNoFavorite" onClick={this.handleTitleClick}><RiHeartLine size="22"/></div> }
          </div>
          <div className="chartOption btnColor01" style={{ right:margin.RIGHT + (showDetail ? 132 : 88) }} onClick={this.handleMenuClick('memo')}><RiEditBoxLine size="22" /></div>          
          { showDetail && <div className="chartOption btnColor01" style={{ right:margin.RIGHT + 88 }} onClick={this.handleMenuClick('jump')}><RiLineChartLine size="22" /></div> }
          <div className="chartOption btnColor01" style={{ right:margin.RIGHT + 44 }} onClick={this.handleMenuClick('naver')}><SiNaver size="22" /></div>
          <div className="chartOption btnColor01" style={{ right:margin.RIGHT }} onClick={this.handleClickOption}><IoMdOptions size="22" /></div>
          { optionPanelOn && <div className="chartOptionPanel" style={{ width: 300 }}>{ this.renderOptionPanel() } </div> }
          { memoPanelOn &&
            <div className="chartOptionPanel" style={{ width: 380, height: 250 }}>
              <MemoPanel appData={appData} compCode={compCode} onApply={this.handleMemoPanel} />
            </div> 
          }
        </div>
        { withLegend &&
          <div className="legendBox" style={{ width:`${width}px` }}>
            { yData.map((dd, idx) => {
              return (
                <div key={`legend-item-${idx}`}
                  className="legendItemBox"
                  style={{ color:`${dd.color}` }}
                  onClick={this.handleLengendItemClick(idx)}
                >
                  <div className="legendCheckBox">
                    { dd.shown ? <RiCheckboxLine size="18" /> : <RiCheckboxBlankLine size="18" /> }
                  </div>
                  <div className="legendTitle">
                    { appData.isHideMode() ? `Series-${idx}` : dd.title }
                  </div>
                </div>
              );
            })}
          </div>
        }
        <div className="chartTopDiv">
          { withYSlider &&
            <div style={{
              'width': `${sliderSize}px`,
              'padding': `${p}px 0`,
              'margin': `${margin.TOP - 10}px 0 ${margin.BOTTOM - 10}px 0`
            }}>
              <RangeSlider
                valueRange={extentY1}
                selectedRange={isundef(userY1Extent) ? extentY1 : userY1Extent}
                onEvent={this.handleSliderEvent('Y1')}
                vertical={true}
                tipTextPos={'right'}
              />
            </div>
          }
          <div ref={chartDiv} onDoubleClick={this.handleDblClick} />
          { hasY2 && withYSlider &&
            <div style={{
              'width': `${sliderSize}px`,
              'padding': `${p}px 0`,
              'margin': `${margin.TOP - 10}px 0 ${margin.BOTTOM - 10}px 0`
            }}>
              <RangeSlider
                valueRange={extentY2}
                selectedRange={isundef(userY2Extent) ? extentY2 : userY2Extent}
                onEvent={this.handleSliderEvent('Y2')}
                vertical={true}
                tipTextPos={'left'}
              />
            </div>
          }
        </div>
        
        { withSlider &&
          <div style={{
            'width': `${width - margin.LEFT - margin.RIGHT + (a - p) * 2 - (withYSlider ? sliderSize : 0) - (hasY2 ? sliderSize : 0)}px`,
            'height': `${sliderSize}px`,
            'flexBasis': `${sliderSize}px`,
            'padding': `0 ${p}px`,
            'margin': `0 ${margin.RIGHT - a + (hasY2 ? sliderSize : 0)}px 0 ${margin.LEFT - a + (withYSlider ? sliderSize : 0)}px`
          }}>
            <RangeSlider
              valueRange={extentX}
              selectedRange={userXExtent}
              labelData={xData}
              onEvent={this.handleSliderEvent('X')}
              dateTime={dateTimeAxis}
            />
          </div>
        }
      </div>
    );
  }
}


export default RunTooltipChart;
export { RunTooltipChart };
