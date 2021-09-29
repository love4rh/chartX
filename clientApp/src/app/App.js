import { MainFrame } from '../view/MainFrame.js';
import './App.css';


function App() {
  const url = window.location.href;
  const path = url.substring(url.indexOf('/', 10) + 1);
  const params = path.split('/');

  const code = params.length > 1 ? params[params.length - 1] : '';
  const method = params[0] === '' ? 'count' : params[0];

  console.log('call', method, code);

  return (
    <div className="App">
      <MainFrame appTitle="Chart X" method={method} compCode={code} />
    </div>
  );
}

export default App;
