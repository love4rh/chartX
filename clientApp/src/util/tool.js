const isundef = function(o) {
  return o === null || typeof o === 'undefined';
}

exports.isundef = isundef;


exports.isvalid  = function(o) {
  return !isundef(o);
}


exports.makeMap = function(list, keyName) {
  let map = {};

  for (let i = 0; i < list.length; ++i) {
    const item = list[i];
    map[item[keyName]] = item;
  }

  return map;
}


exports.nvl = function(str, val) {
  return !isundef(str) ? str : val;
}


exports.nvl2 = function(str, val) {
  return (isundef(str) || '' === str) ? val : str;
}


exports.tickCount = function() {
  return new Date().getTime();
}


exports.istrue = function(v) {
  return !isundef(v) && v;
}


exports.hasKey = function(obj, key) {
  return obj ? hasOwnProperty.call(obj, key) : false;
}


exports.uuid4 = function() {
  // return uuid of form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  let uuid = '', ii;

  for (ii = 0; ii < 32; ii += 1) {
    switch (ii) {
      case 8:
      case 20:
        uuid += '-';
        uuid += (Math.random() * 16 | 0).toString(16);
        break;
      case 12:
        uuid += '-';
        uuid += '4';
        break;
      case 16:
        uuid += '-';
        uuid += (Math.random() * 4 | 8).toString(16);
        break;
      default:
        uuid += (Math.random() * 16 | 0).toString(16);
    }
  }

  return uuid;
}


const isIn = function(val, valList) {
  if (isundef(val) || isundef(valList)) return false;

  for (let i = 0; i < valList.length; ++i) {
    if (valList[i] === '' + val) return true;
  }

  return false;
}


exports.isIn = isIn;

exports.isInArray = function(valList1, valList2) {
  if (isundef(valList1) || isundef(valList2)) return false;

  for (let i = 0; i < valList1.length; ++i) {
    if (isIn(valList1[i], valList2)) {
      return true;
    }
  }

  return false;
}


const getIndexInList = function(val, valList) {
  if (isundef(val)) return -1;
  val = '' + val;

  for (let i = 0; i < valList.length; ++i) {
    if ('' + valList[i] === val) return i;
  }

  return -1;
}

exports.getIndexInList = getIndexInList;

exports.nextValueInList = function(val, valList) {
  if (valList.length < 1) {
    return null;
  } else if (valList.length === 1) {
    return valList[0];
  }

  const nextIdx = getIndexInList(val, valList) + 1;
  if (nextIdx < valList.length ) {
    return valList[nextIdx];
  }

  return valList[0];
}


exports.getIndexInListEx = function(val, valList, key) {
  if (isundef(val)) return -1;
  val = '' + val;

  for (let i = 0; i < valList.length; ++i) {
    if ('' + valList[i][key] === val) return i;
  }

  return -1;
}


exports.makeid = function(digitNum) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < digitNum; ++i) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}


// 1: true, false
// 2: numeric 0, 1
// 3: "true", "false"
// 4: "0", "1"
// 5: "on", "off"
// 6: "ON", "OFF"
exports.BoolTool = {
  checkType: function(val) {
    switch( typeof val ) {
      case 'boolean':
        return 1;
      case 'number':
        return 2;
      default:
        if (val === 'true' || val === 'false') {
          return 3;
        } else if (val === '0' || val === '1') {
          return 4;
        } else if (val === 'on' || val === 'off') {
          return 5;
        } else if (val === 'ON' || val === 'OFF') {
          return 6;
        }
    }

    return 1;
  },

  boolValue: function(value, type) {
    switch( type ) {
      case 2:
        return value !== 0;

      case 3: // fall-throught
      case 4: // fall-throught
      case 5: // fall-throught
      case 6: // fall-throught
        return value === '1' || value === 'true' || value === 'on' || value === 'ON';

      case 1: // fall-throught
      default: // fall-throught
        break;
    }

    return value;
  },

  originalValue: function(boolVal, type) {
    switch (type) {
      case 2:
        return boolVal ? 1 : 0;
      case 3:
        return boolVal ? 'true' : 'false';
      case 4:
        return boolVal ? '1' : '0';
      case 5:
        return boolVal ? 'on' : 'off';
      case 6:
        return boolVal ? 'ON' : 'OFF';
      default:
        break;
    }

    return boolVal;
  },

  anotherOriginal: function(boolVal, type) {
    switch (type) {
      case 2:
        return boolVal ? 0 : 1;
      case 3:
        return boolVal ? 'false' : 'true';
      case 4:
        return boolVal ? '0' : '1';
      case 5:
        return boolVal ? 'off' : 'on';
      case 6:
        return boolVal ? 'OFF' : 'ON';
      default:
        break;
    }

    return !boolVal;
  }
};


exports.isInteger = function (value) {
  return (typeof value === 'number'
    && isFinite(value)
    && Math.round(value) === value
  );
}


exports.jsonParse = function(str) {
  if( typeof str !== 'string' ) {
    return typeof str === 'object' ? str : null;
  }

  var jsonObj = null;

  try {
    jsonObj = JSON.parse(str)
  } catch(e) {
    jsonObj = null;
  }

  return jsonObj;
}


// 객체를 똑같이 복사하여 생성한 객체 반환. (Deep Copy)
exports.copyObject = function(obj) {
  return JSON.parse(JSON.stringify(obj));
}


let _globalMsgHandler_ = null;
exports.setGlobalMessageHandle = function(handle) {
  _globalMsgHandler_ = handle;
}

exports.showGlobalMessage = function(msg) {
  if( _globalMsgHandler_ ) {
    _globalMsgHandler_(msg);
  }
}


// from: https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Math/random
exports.randomReal = (min, max) => {
  return Math.random() * (max - min) + min;
}


// 최대값, 최소값 모두 포함
// from: https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Math/random
exports.randomInteger = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.cp = (obj) => {
  return JSON.parse(JSON.stringify(obj));
}



/**
 *
 *  Secure Hash Algorithm (SHA256)
 *  http://www.webtoolkit.info/
 *
 *  Original code by Angel Marin, Paul Johnston.
 **/
      
exports.SHA256 = function(s) {
	var chrsz   = 8;
	var hexcase = 0;

	function safe_add (x, y) {
		var lsw = (x & 0xFFFF) + (y & 0xFFFF);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xFFFF);
	}

	function S (X, n) { return ( X >>> n ) | (X << (32 - n)); }
	function R (X, n) { return ( X >>> n ); }
	function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
	function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
	function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
	function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
	function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
	function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }

	function core_sha256 (m, l) {
		var K = [
			0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1,
			0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
			0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786,
			0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
			0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147,
			0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
			0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B,
			0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
			0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A,
			0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
			0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
		];

		var HASH = [
			0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 
			0x9B05688C, 0x1F83D9AB, 0x5BE0CD19
		];

		var W = new Array(64);
		var a, b, c, d, e, f, g, h, i, j;
		var T1, T2;

		m[l >> 5] |= 0x80 << (24 - l % 32);
		m[((l + 64 >> 9) << 4) + 15] = l;

		for ( i = 0; i<m.length; i+=16 ) {
			a = HASH[0];
			b = HASH[1];
			c = HASH[2];
			d = HASH[3];
			e = HASH[4];
			f = HASH[5];
			g = HASH[6];
			h = HASH[7];

			for ( j = 0; j<64; j++) {
				if (j < 16) W[j] = m[j + i];
				else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);

				T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
				T2 = safe_add(Sigma0256(a), Maj(a, b, c));

				h = g;
				g = f;
				f = e;
				e = safe_add(d, T1);
				d = c;
				c = b;
				b = a;
				a = safe_add(T1, T2);
			}

			HASH[0] = safe_add(a, HASH[0]);
			HASH[1] = safe_add(b, HASH[1]);
			HASH[2] = safe_add(c, HASH[2]);
			HASH[3] = safe_add(d, HASH[3]);
			HASH[4] = safe_add(e, HASH[4]);
			HASH[5] = safe_add(f, HASH[5]);
			HASH[6] = safe_add(g, HASH[6]);
			HASH[7] = safe_add(h, HASH[7]);
		}
		return HASH;
	}

	function str2binb (str) {
		var bin = [];
		var mask = (1 << chrsz) - 1;
		for(var i = 0; i < str.length * chrsz; i += chrsz) {
			bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);
		}
		return bin;
	}

	function Utf8Encode(string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}

		return utftext;
	}

	function binb2hex (binarray) {
		var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
		var str = "";
		for(var i = 0; i < binarray.length * 4; i++) {
			str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
			hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
		}
		return str;
	}

	s = Utf8Encode(s);

	return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
}
