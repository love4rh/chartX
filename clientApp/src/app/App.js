import { MainFrame } from '../view/MainFrame.js';
import './App.css';


function App() {
  const url = window.location.href;
  const code = url.substring(url.lastIndexOf('/') + 1);

  // console.log('url', url);

  return (
    <div className="App">
      <MainFrame appTitle="Chart X" compCode={code} />
    </div>
  );
}

export default App;
