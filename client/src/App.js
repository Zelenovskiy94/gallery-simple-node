import React from 'react';
import Gallery from './components/Gallery/Gallery';
import './App.css';
import Header from './components/Header/Header';

function App() {
  

  return (
    
    <div className="App">
      <Header/>
      <main>
          <div className='wrapper'>
            <Gallery/>
          </div>
      </main>
    </div>
  );
}

export default App;
