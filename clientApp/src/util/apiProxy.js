import axios from 'axios';

import { makeid, isvalid } from '../util/tool.js';

// export const _serverBaseUrl_ = 'http://10.186.115.136:8080';
export const _serverBaseUrl_ = 'http://127.0.0.1:8080';

const _userToken = makeid(8);

const basicHeader = {
	'Content-Type': 'application/json;charset=utf-8',
	'x-user-token': _userToken
};


const GET = axios.create({
  baseURL: _serverBaseUrl_,
  timeout: 12000,
  headers: basicHeader
});


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

	test: (testString) => {
		GET.get('/test?testString=' + testString)
			.then(res => {
				// to do something with res
			})
			.catch(err => {
				// to do something with err
			});
	},

	getCountedData: (compCode, count, cbOk, cbErr) => {
		apiProxy.enterWaiting();

		axios.get(`${_serverBaseUrl_}/ctx?pCode=${compCode}&count=${count}`, {
			headers: {
				'Content-Type': 'application/json;charset=utf-8',
				'x-user-token': _userToken,
				'x-auth-code': `auth code here`
			}
		}).then(res => {
			apiProxy.leaveWaiting();
			if( cbOk ) { cbOk(typeof res.data === 'string' ? JSON.parse(res.data) : res.data); }
		}).catch(err => {
			apiProxy.leaveWaiting();
			// console.log('apiProxy ERR', err);
			if( cbErr ) { cbErr(err); }
		});
	},

	getYearlyData: (compCode, cbOk, cbErr) => {
		apiProxy.enterWaiting();

		axios.get(`${_serverBaseUrl_}/ytx?pCode=${compCode}`, {
			headers: {
				'Content-Type': 'application/json;charset=utf-8',
				'x-user-token': _userToken,
				'x-auth-code': `auth code here`
			}
		}).then(res => {
			apiProxy.leaveWaiting();
			if( cbOk ) { cbOk(typeof res.data === 'string' ? JSON.parse(res.data) : res.data); }
		}).catch(err => {
			apiProxy.leaveWaiting();
			// console.log('apiProxy ERR', err);
			if( cbErr ) { cbErr(err); }
		});
	},

	getCompData: (compCode, cbOk, cbErr) => {
		apiProxy.enterWaiting();

		axios.get(`${_serverBaseUrl_}/gtx?pCode=${compCode}`, {
			headers: {
				'Content-Type': 'application/json;charset=utf-8',
				'x-user-token': _userToken,
				'x-auth-code': `auth code here`
			}
		}).then(res => {
			apiProxy.leaveWaiting();
			if( cbOk ) { cbOk(typeof res.data === 'string' ? JSON.parse(res.data) : res.data); }
		}).catch(err => {
			apiProxy.leaveWaiting();
			// console.log('apiProxy ERR', err);
			if( cbErr ) { cbErr(err); }
		});
	},

	getMetaData: (cbSuccess, cbError) => {
		apiProxy.enterWaiting();
		
		axios({
			baseURL: _serverBaseUrl_,
			url: '/metadata',
			method: 'post',
			timeout: 24000,
			headers: basicHeader
		})
		.then(res => {
			apiProxy.leaveWaiting();
			if( isvalid(res.data) && res.data.returnCode === 0 ) {
				if( cbSuccess ) cbSuccess(res.data);
			} else if( cbError ) {
			  cbError(res);
      }
		})
		.catch(res => {
			apiProxy.leaveWaiting();
			if( cbError ) cbError(res);
		});
	},

	/**
	 * data: { dbIdx, query }
	 */
  executeQuery: (data, cbSuccess, cbError) => {
		apiProxy.enterWaiting();
		
		axios({
			baseURL: _serverBaseUrl_,
			url: '/executeSql',
			method: 'post',
			timeout: 60000,
			headers: basicHeader,
			data: data
		})
		.then(res => {
			apiProxy.leaveWaiting();
			if( isvalid(res.data) && res.data.returnCode === 0 ) {
				if( cbSuccess ) cbSuccess(res.data);
			} else if( cbError ) {
			  cbError(res);
      }
		})
		.catch(res => {
			apiProxy.leaveWaiting();
			if( cbError ) cbError(res);
		});
	},

	getMoreData: (data, cbSuccess, cbError) => {
		axios({
			baseURL: _serverBaseUrl_,
			url: '/moreData',
			method: 'post',
			timeout: 5000,
			headers: basicHeader,
			data: data // { qid, beginIdx, length }
		})
		.then(res => {
			if( isvalid(res.data) && res.data.returnCode === 0 ) {
				if( cbSuccess ) cbSuccess(res.data);
			} else if( cbError ) {
			  cbError(res);
      }
		})
		.catch(res => {
			if( cbError ) cbError(res);
		});
	},
};

export default apiProxy;
export { apiProxy };
