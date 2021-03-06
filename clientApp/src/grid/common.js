// const valueTypes = [ 'number', 'datetime', 'boolean', 'string', 'unknown' ];


export const isundef = (o) => {
  return o === null || typeof(o) === 'undefined';
}


export const isvalid = (o) => {
  return o !== null && typeof(o) !== 'undefined';
}


export const isValidString = (s) => {
  return s !== null && typeof(s) !== 'undefined' && s !== '';
}

export const isBetween = (val, f, t) => {
  return f <= val && val < t;
}


export const nvl = (val, def) => {
  return isundef(val) ? def : val;
}


// 출처: https://stove99.tistory.com/113 [스토브 훌로구]
export const numberWithCommas = (x) => {
  var reg = /(^[+-]?\d+)(\d{3})/;
  var n = (x + '');

  while( reg.test(n) )
    n = n.replace(reg, '$1,$2');

  return n;
}


export const calcDigits = (n) => {
  return Math.log(n) * Math.LOG10E + 1 | 0;
}


export const calcDigitsWithCommas = (x) => {
  const d = calcDigits(x)
  return d + Math.floor((d - 1) / 3);
}


export const istrue = (x) => {
  return isvalid(x) && x;
}


export const makeid = (digitNum) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < digitNum; ++i) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}


export const tickCount = () => {
  return new Date().getTime();
}


export const pad2 = (n) => {
  return (n < 10 ? '0' : '') + n;
}


export const pad3 = (n) => {
  return ((n < 10 ? '00' : (n < 100 ? '0' : '')) + n);
}


export const dateToString = (dt, withMilli) => {
  const MM = dt.getMonth() + 1; // getMonth() is zero-based
  const dd = dt.getDate();
  const hh = dt.getHours();
  const mm = dt.getMinutes();
  const ss = dt.getSeconds();
  const mi = dt.getMilliseconds();

  // if( mi > 0 ) {
  //   withMilli = true;
  // }

  return [ dt.getFullYear(), pad2(MM), pad2(dd) ].join('-')
    + ' ' + [ pad2(hh), pad2(mm), pad2(ss) ].join(':') + (istrue(withMilli) ? '.' + pad3(mi) : '');
}

export const dateToYYYYMMDD = (dt) => {
  const MM = dt.getMonth() + 1; // getMonth() is zero-based
  const dd = dt.getDate();

  return [ dt.getFullYear(), pad2(MM), pad2(dd) ].join('');
}

/**
 * 객체 obj에 method가 있으면 호출한 결과를 반환하고 없으면 null 반환
 * @param {*} obj 
 * @param {string} method 
 * @param {*} option 메소드를 호출할 때 인수로 넘길 값 
 */
export const proxyCall = (obj, method, option) => {
  return (method in obj) ? obj[method](option) : null;
}


// [min, max] 내 임의의 숫자 반환
export const genRandomInteger = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max) + 1;
  return Math.floor(Math.random() * (max - min)) + min;
}

export const binarySearch = (sorted, target, compare) => {
  let l = 0, h = sorted.length - 1;

  // console.log('binarySearch', l, h, target);

  while( l <= h ) {
    const m = Math.floor((l + h) / 2);
    const r = compare(sorted[m], target);

    if( r === 0 ) {
      return { m, l, h };
    } else if( r > 0 ) {
      h = m - 1;
    } else {
      l = m + 1;
    }
  }

  return { m:-1, l, h };
}


export const makeRowFilter = (ds, cb) => {
  const sm = [];
  for(let c = 0; c < ds.getColumnCount(); ++c) {
    const fd = ds.getColumnFilterData(c);

    if( isundef(fd) ) {
      sm.push(null);
    } else {
      sm.push( fd.filter((d) => d.selected).reduce((m, d) => ({...m, [d.title]:true}), {}) );
    }
  }

  // console.log('makeRowFilter', sm);

  const ri = [];
  for(let r = 0; r < ds._getRowCount(true); ++r) {
    let selected = true;
    for(let c = 0; selected && c < ds.getColumnCount(); ++c) {
      selected = isundef(sm[c]) || isvalid(sm[c][ds._getRawCellValue(c, r)]);
    }

    if( selected ) {
      ri.push(r);
    }
  }

  // console.log('makeRowFilter result', ri);

  if( cb ) {
    cb({ rowFilter:ri });
  }
}


export const makeOneLine = (str) => {
  return str.replace('\n', ' ');
}


// 현재 Active 상태인 그리드
let _currentActiveGrid = null;

export const setCurrentActiveGrid = (grid) => {
  _currentActiveGrid = grid;
}


export const dismissActiveGrid = (grid) => {
  if( _currentActiveGrid === grid ) {
    _currentActiveGrid = null;
  }
}


export const getCurrentActiveGrid = () => {
  return _currentActiveGrid;
}


export const printDimension = (title, tag) => {
  const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = tag;

  console.log(title, offsetLeft, offsetTop, offsetWidth, offsetHeight);
}


// value의 값 형태를 추정하여 반환
// returns number, datetime, boolean, string
export const estimateValueType = (value) => {
  const vt = typeof value;

  if( vt === 'number' || vt === 'boolean' ) {
    return vt;
  }

  // TODO datetime 고려

  return isNaN(parseFloat(value)) ? 'string' : 'number';
}


export const tryParseNumber = (str) => {
  const n = parseFloat(str);
  return isNaN(n) ? null : n;
}


export const isDateTime = (typeStr) => {
  return 'datetime' === typeStr;
}


// 목록에서 최소/최대값을 계산하여 반환함
// returns [minimum, maximum]
export const extent = (list) => {
  list.reduce((a, d) => a === null ? [d, d] : [Math.min(a[0], d), Math.max(a[1], d)], null);
}


export const cp = (obj) => {
  return JSON.parse(JSON.stringify(obj));
}


export const yyymmddToHuman = (dt) => {
  if( isundef(dt) ) {
    return '-';
  }
  
  return dt.substring(0, 4) + '-' + dt.substring(4, 6) + '-' + dt.substring(6, 8);
}


// dt: Date
// 출처: https://jaimemin.tistory.com/1432
export const getDayName = (dt) => {
  return dt.toLocaleDateString('ko-KR', { weekday: 'long', }).substr(0, 1);
}

