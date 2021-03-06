import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { isundef, cp, istrue, isvalid, dateToString, nvl } from '../grid/common';

import './RangeSlider.scss';


export const sliderSize = 30; // 28 이상 짝수로 지정


/**
 * https://material-ui.com/components/slider/ 와 비슷한 슬라이더.
 * Thumb을 이동할 수 있는 것이 차이가 있음.
 * 발생하는 이벤트
 * onEvent('rangeChanged', [r1, r2]) --> 선택 영역 바뀜
 */
class RangeSlider extends Component {
	static propTypes = {
    valueRange: PropTypes.array.isRequired, // 선택할 수 있는 값의 범위
    selectedRange: PropTypes.array, // 전체(range) 중 현재 선택된 범위. 없으면 전체가 선택된 것으로 처리함
    onEvent: PropTypes.func, // 이벤트 발생 시 전달할 핸들러. 상위 객체와의 소통을 위하여 사용됨
    vertical: PropTypes.bool, // 세로 여부
    labelData: PropTypes.array, // Label 데이터 여부
    dateTime: PropTypes.bool, // 날짜 (Date 객체) 여부 반환
    tipTextPos: PropTypes.string, // Tip Text 표시 위치. top, bottom, left, right. 기본값 top
    alwaysShow: PropTypes.bool, // Tooltip 항상 표시 여부
  };

  constructor (props) {
    super(props);

    const { valueRange, selectedRange, vertical, labelData, dateTime, tipTextPos, alwaysShow } = props;

    const range = istrue(dateTime) ? valueRange.map(d => d.getTime()) : valueRange;

    this.state = {
      range,
      selectedRange: cp(isundef(selectedRange) ? range : selectedRange),
      vertical: istrue(vertical),
      mouseState: null,
      labelData,
      dateTime: istrue(dateTime),
      tipTextPos: nvl(tipTextPos, 'top'),
      alwaysShow: istrue(alwaysShow)
    };

    this._mainDiv = React.createRef();

    this._mouseHandler = {
      'left': { 'move': this.handleMouseMove('left'), 'up': this.handleMouseUp('left') },
      'right': { 'move': this.handleMouseMove('right'), 'up': this.handleMouseUp('right') },
      'track': { 'move': this.handleMouseMove('track'), 'up': this.handleMouseUp('track') }
    };
  }

  componentDidMount () {
    //
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    //

    return null; // null을 리턴하면 따로 업데이트 할 것은 없다라는 의미
  }

  // pixel --> value
  // pos: mouse postion
  calculateValue = (pos) => {
    const { vertical, range } = this.state;

    let rp;

    if( vertical ) {
      const { offsetTop, offsetHeight } = this._mainDiv.current;
      rp = (offsetHeight - (pos - offsetTop)) / offsetHeight * (range[1] - range[0]);
    } else {
      const { offsetLeft, offsetWidth } = this._mainDiv.current;
      rp = (pos - offsetLeft) / offsetWidth * (range[1] - range[0]);
    }

    rp += range[0];

    return Math.max(range[0], Math.min(rp, range[1]));
  }

  // value --> pixel
  calculatePosition = (value) => {
    const { vertical, range } = this.state;

    let pos = 0;
    if( vertical ) {
      const { offsetTop, offsetHeight } = this._mainDiv.current;
      pos = (value - range[0]) / (range[1] - range[0]) * offsetHeight + offsetTop;
    } else {
      const { offsetLeft, offsetWidth } = this._mainDiv.current;
      pos = (value - range[0]) / (range[1] - range[0]) * offsetWidth + offsetLeft;
    }

    return pos;
  }

  calculateGap = (gap) => {
    const { vertical, range } = this.state;

    return vertical
      ? - gap / this._mainDiv.current.offsetHeight * (range[1] - range[0])
      : gap / this._mainDiv.current.offsetWidth * (range[1] - range[0]);
  }

  handleMouseDown = (type) => (ev) => {
    if( isvalid(this._mainDiv.current) ) {
      this._mainDiv.current.focus();
    }

    ev.preventDefault();
    ev.stopPropagation();

    // capturing mouse event (refer: http://code.fitness/post/2016/06/capture-mouse-events.html)
    document.body.style['pointer-events'] = 'none';
    document.addEventListener('mousemove', this._mouseHandler[type]['move'], { capture: true });
    document.addEventListener('mouseup', this._mouseHandler[type]['up'], { capture: true });

    const { vertical, selectedRange } = this.state;
    const ptRange = selectedRange.map(v => this.calculatePosition(v));

    this.setState({ mouseState: { type, beginPos: (vertical ? ev.clientY : ev.clientX), ptRange, sRange: cp(selectedRange) } });
  }

  handleMouseMove = (type) => (ev) => {
    const { vertical, mouseState } = this.state;

    if( isundef(mouseState) || mouseState.type !== type ) {
      return;
    }

    ev.preventDefault();
    ev.stopPropagation();

    const { beginPos, sRange, ptRange } = mouseState;
    const move = (vertical ? ev.clientY : ev.clientX) - beginPos;

    if( 'track' === type ) {
      this._moveSlider(type, move, false, sRange);
    } else {
      this._moveSlider(type, ptRange['left' === type ? 0 : 1] + move, false);
    }
  }

  handleMouseUp = (type) => (ev) => {
    const { vertical, mouseState } = this.state;

    if( isundef(mouseState) || mouseState.type !== type ) {
      return;
    }

    document.body.style['pointer-events'] = 'auto';
    document.removeEventListener('mousemove', this._mouseHandler[type]['move'], { capture: true });
    document.removeEventListener('mouseup', this._mouseHandler[type]['up'], { capture: true });

    const { beginPos, sRange, ptRange } = mouseState;
    const move = (vertical ? ev.clientY : ev.clientX) - beginPos;

    if( 'track' === type ) {
      this._moveSlider(type, move, true, sRange);
    } else {
      this._moveSlider(type, ptRange['left' === type ? 0 : 1] + move, true);
    }
  }

  // type이 both이면 value는 이동 비율((0, 1))임
  _moveSlider = (type, pos, trigger, sRange) => {
    const { onEvent } = this.props;
    const { selectedRange, range } = this.state;

    if( type === 'track' ) {
      let gap = this.calculateGap(pos);
      if( sRange[0] + gap < range[0] ) {
        gap = range[0] - sRange[0];
      } else if( range[1] < sRange[1] + gap ) {
        gap = range[1] - sRange[1];
      } 
      selectedRange[0] = sRange[0] + gap;
      selectedRange[1] = sRange[1] + gap;
    } else if( type === 'both' ) {
      const mv = (range[1] - range[0]) * pos;
      selectedRange[0] = Math.max(range[0], Math.min(selectedRange[0] - mv, range[1]));
      selectedRange[1] = Math.max(range[0], Math.min(selectedRange[1] + mv, range[1]));
    } else {
      selectedRange[type === 'left' ? 0 : 1] = this.calculateValue(pos);
    }

    if( trigger && onEvent ) {
      onEvent('rangeChanged', [ Math.min(selectedRange[0], selectedRange[1]), Math.max(selectedRange[0], selectedRange[1]) ]);
    }

    if( trigger ) {
      this.setState({ mouseState: null, selectedRange: selectedRange });
    } else {
      this.setState({ selectedRange: selectedRange });
    }
  }

  handleKeyDown = (ev) => {
    const { vertical, selectedRange } = this.state;
    const { keyCode, shiftKey } = ev; // ctrlKey

    // console.log('keyDown', keyCode);

    const r = shiftKey ? 0.05 : 0.01;
    const m = shiftKey ? 10 : 5;

    if( vertical ) {
      // const { offsetHeight } = this._mainDiv.current;

      if( keyCode === 37 ) { // left (선택 범위 10% 감소)
        this._moveSlider('both', -r, true);
      } else if( keyCode === 39 ) { // right (선택 범위 10% 증가)
        this._moveSlider('both', r, true);
      } else if( keyCode === 38 ) { // up (위로 이동)
        this._moveSlider('track', - m, true, selectedRange);
      } else if( keyCode === 40 ) { // down (아래로 이동)
        this._moveSlider('track', m, true, selectedRange);
      }
    } else {
      // const { offsetWidth } = this._mainDiv.current;

      if( keyCode === 37 ) { // left (왼쪽 이동)
        this._moveSlider('track', - m, true, selectedRange);
      } else if( keyCode === 39 ) { // right (오른쪽 이동)
        this._moveSlider('track', m, true, selectedRange);
      } else if( keyCode === 38 ) { // up (선택 범위 10% 증가)
        this._moveSlider('both', r, true);
      } else if( keyCode === 40 ) { // down (선택 범위 10% 감소)
        this._moveSlider('both', -r, true);
      }
    }
  }

  render () {
    const { vertical, range, selectedRange, mouseState, labelData, dateTime, tipTextPos, alwaysShow } = this.state;

    const thumbId = ['left', 'right'];

    let valueText;
    const sRange = selectedRange;

    // 시간 (Date 이용)
    if( dateTime ) {
      valueText = sRange.map(v => dateToString(new Date(Math.round(v))) );
    } else if( isvalid(labelData) ) {
      valueText = sRange.map(v => labelData[Math.min(labelData.length - 1, Math.max(0, Math.floor(v) - 1))] );
    } else {
      valueText = sRange.map(v => '' + Math.round(v * 100) / 100);
    }

    const thumbPos = sRange.map(v => (vertical ? (range[1] - v) : (v - range[0])) / (range[1] - range[0]) * 100 );
    const actType = isvalid(mouseState) && mouseState.type;

    const L = (sliderSize - 24) / 2; // 28 --> 2, 32 --> 4
    const M1 = 20 + L, M2 = 32 + L;
    const TS = L + 10;

    // set up dimension depending on vertical
    let styleMain = {}, styleRail = {}, styleTrack = {};
    if( vertical ) {
      styleMain = { width:`${L}px`, height:`100%`, padding:`0 13px` };
      styleRail = { width:`${L}px`, height:`100%` };
      styleTrack = { width:`${L}px`, top:`${Math.min(thumbPos[1], thumbPos[0])}%`, height:`${Math.abs(thumbPos[1] - thumbPos[0])}%` };
    } else {
      styleMain = { width:`100%`, height:`${L}px`, padding:`13px 0` };
      styleRail = { width:`100%`, height:`${L}px` };
      styleTrack = { height:`${L}px`, left:`${Math.min(thumbPos[1], thumbPos[0])}%`, width:`${Math.abs(thumbPos[1] - thumbPos[0])}%` };
    }

  	return (
  		<div
        ref={this._mainDiv}
        tabIndex="1"
        className="rangeSliderMain"
        style={styleMain}
        onKeyDown={this.handleKeyDown}
      >
        <span className="rangeRail" style={styleRail} />
        <span
          className="rangeTrack"
          style={styleTrack}
          onMouseDown={this.handleMouseDown('track')}
        />
        { thumbId.map((id, idx) => {
          const stylePos = vertical
            ? { top:`${thumbPos[idx]}%`, margin:`-6px 0 0 -5px`, width:`${TS}px`, height:`${TS}px` }
            : { left:`${thumbPos[idx]}%`, margin:`-5px 0 0 -6px`, width:`${TS}px`, height:`${TS}px` };

          const textPos = { width:`${valueText[idx].length * 0.5}rem` };

          if( tipTextPos === 'top') {
            textPos.top = `-${M2}px`;
          } else if( tipTextPos === 'bottom') {
            textPos.bottom = `-${M2}px`;
          } else if( tipTextPos === 'right') {
            textPos.left = `${M1}px`;
          } else if( tipTextPos === 'left') {
            textPos.right = `${M1}px`;
          }

          return (
            <span
              key={`thumb-${id}`}
              className="rangeThumb"
              style={stylePos}
              onMouseDown={this.handleMouseDown(id)}
            >
              <span
                className={['thumbText', (alwaysShow || actType === id || actType === 'track' ? 'showThumbText' : '')].join(' ')}
                style={textPos}
              >
                {valueText[idx]}
              </span>
            </span>
          );
        })}
  		</div>
  	);
  }
}

export default RangeSlider;
export { RangeSlider };
