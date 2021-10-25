import axios from 'axios';

import { makeid, istrue, isundef, tickCount, SHA256, isvalid } from '../util/tool.js';

// export const _serverBaseUrl_ = 'http://10.186.115.136:8080';
export const _serverBaseUrl_ = 'https://gx.tool4.us';
// export const _serverBaseUrl_ = 'http://127.0.0.1:8080';

const _userToken = makeid(8);

const apiProxy = {
	_handleWait: null,
	_handleDone: null,

	setWaitHandle: (waiting, done) => {
		apiProxy._handleWait = waiting;
		apiProxy._handleDone = done;
	},

	enterWaiting: () => {
		if( apiProxy._handleWait ) {
			apiProxy._handleWait()
		}
	},

	leaveWaiting: () => {
		if( apiProxy._handleDone ) {
			apiProxy._handleDone()
		}
	},

	// 기본 헤더값 생성
	genHeader: () => {
		const tick = '' + tickCount();
		return {
			'Content-Type': 'application/json;charset=utf-8',
			'x-user-token': _userToken,
			'x-timestamp': tick,
			'x-auth-code': SHA256(tick + _userToken + tick)
		};
	},

	plugIn: (uid, pw, cbOk, cbErr) => {
		apiProxy.enterWaiting();

		axios({
			baseURL: _serverBaseUrl_,
			url: '/start',
			method: 'post',
			timeout: 5000,
			headers: apiProxy.genHeader(),
			data: { id: uid, pw: SHA256(SHA256(pw) + '/' + _userToken) }
		}).then(res => {
			// console.log('CHECK - SI', res);
			apiProxy.leaveWaiting();
			if( cbOk ) { cbOk(typeof res.data === 'string' ? JSON.parse(res.data) : res.data); }
		}).catch(err => {
			apiProxy.leaveWaiting();
			if( cbErr ) { cbErr(err); }
		});
	},

	getBuyPointData: (all, page, cbOk, cbErr) => {
		apiProxy.enterWaiting();

		axios.get(`${_serverBaseUrl_}/gbp?pageNo=${isundef(page) ? '0' : page}&count=20&all=${all}`, {
			headers: apiProxy.genHeader()
		}).then(res => {
			// console.log('CHECK - BP', res);
			apiProxy.leaveWaiting();
			if( cbOk ) { cbOk(typeof res.data === 'string' ? JSON.parse(res.data) : res.data); }
		}).catch(err => {
			apiProxy.leaveWaiting();
			if( cbErr ) { cbErr(err); }
		});
	},

	getCountedData: (compCode, count, cbOk, cbErr) => {
		apiProxy.enterWaiting();

		axios.get(`${_serverBaseUrl_}/ctx?pCode=${compCode}&count=${count}`, {
			headers: apiProxy.genHeader()
		}).then(res => {
			// console.log('CHECK - CNT', res);
			apiProxy.leaveWaiting();
			if( cbOk ) { cbOk(typeof res.data === 'string' ? JSON.parse(res.data) : res.data); }
		}).catch(err => {
			apiProxy.leaveWaiting();
			if( cbErr ) { cbErr(err); }
		});
	},

	getYearlyData: (compCode, cbOk, cbErr) => {
		apiProxy.enterWaiting();

		axios.get(`${_serverBaseUrl_}/ytx?pCode=${compCode}`, {
			headers: apiProxy.genHeader()
		}).then(res => {
			// console.log('CHECK - YEAR', res);
			apiProxy.leaveWaiting();
			if( cbOk ) { cbOk(typeof res.data === 'string' ? JSON.parse(res.data) : res.data); }
		}).catch(err => {
			apiProxy.leaveWaiting();
			// console.log('apiProxy ERR', err);
			if( cbErr ) { cbErr(err); }
		});
	},

	getCountedDataByCodes: (codes, count, cbOk, cbErr) => {
		apiProxy.enterWaiting();

		const codeStr = codes.reduce((p, c) => p + ',' + c);

		axios.get(`${_serverBaseUrl_}/dtx?codes=${codeStr}&count=${count}`, {
			headers: apiProxy.genHeader()
		}).then(res => {
			// console.log('CHECK - DXT', res);
			apiProxy.leaveWaiting();
			if( cbOk ) { cbOk(typeof res.data === 'string' ? JSON.parse(res.data) : res.data); }
		}).catch(err => {
			apiProxy.leaveWaiting();
			if( cbErr ) { cbErr(err); }
		});
	},

	getComment: (uid, compCode, cbOk, cbErr) => {
		apiProxy.enterWaiting();

		axios.get(`${_serverBaseUrl_}/comment?uid=${uid}&pCode=${compCode}`, {
			headers: apiProxy.genHeader()
		}).then(res => {
			apiProxy.leaveWaiting();
			const dt = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
			if( dt.returnCode === 0 && isvalid(dt.response) ) {
				if( cbOk ) cbOk( decodeURIComponent(dt.response.comment) );
			} else {
				if( cbErr ) cbErr(res);
			}
		}).catch(err => {
			apiProxy.leaveWaiting();
			// console.log('apiProxy ERR', err);
			if( cbErr ) { cbErr(err); }
		});
	},

	postComment: (uid, compCode, type, comment, cbOk, cbErr) => {
		apiProxy.enterWaiting();

		axios({
			baseURL: _serverBaseUrl_,
			url: '/edit',
			method: 'post',
			timeout: 5000,
			headers: apiProxy.genHeader(),
			data: { id: uid, code: compCode, act: type, comment: encodeURIComponent(comment) }
		}).then(res => {
			apiProxy.leaveWaiting();
			if( cbOk ) { cbOk(true); }
		}).catch(err => {
			apiProxy.leaveWaiting();
			if( cbErr ) { cbErr(err); }
		});
	},

	getFavorite: (uid, cbOk, cbErr) => {
		apiProxy.enterWaiting();

		axios.get(`${_serverBaseUrl_}/fav?uid=${uid}`, {
			headers: apiProxy.genHeader()
		}).then(res => {
			apiProxy.leaveWaiting();
			const dt = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
			console.log('CHECK - FAV', res);
			if( dt.returnCode === 0 && isvalid(dt.response) ) {
				if( cbOk ) cbOk(dt.response);
			} else {
				if( cbErr ) cbErr(res);
			}
		}).catch(err => {
			apiProxy.leaveWaiting();
			// console.log('apiProxy ERR', err);
			if( cbErr ) { cbErr(err); }
		});
	},

	postFavorite: (uid, compCode, values, isRetuen, cbOk, cbErr) => {
		apiProxy.enterWaiting();

		axios({
			baseURL: _serverBaseUrl_,
			url: '/set',
			method: 'post',
			timeout: 5000,
			headers: apiProxy.genHeader(),
			data: { id: uid, code: compCode, returnData: istrue(isRetuen), values }
		}).then(res => {
			apiProxy.leaveWaiting();
			const rdata = res.data;
			// console.log('postFavorite', res);

			if( rdata && rdata.returnCode === 0 ) {
				if( cbOk ) { cbOk(rdata); }
			} else if( cbErr ) {
				cbErr({ returnCode: 9999 });
			}
		}).catch(err => {
			// console.log('postFavorite', err);
			apiProxy.leaveWaiting();
			if( cbErr ) { cbErr( err ); }
		});
	}
};

export default apiProxy;
export { apiProxy };
