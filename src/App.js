import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchForm from './components/SearchForm';
import SearchResults from './components/SearchResults';
import Home from './components/Home';
import './App.css';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [minDuration, setMinDuration] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  const [showDurationFilter, setShowDurationFilter] = useState(false);
  const [filteredMediaItems, setFilteredMediaItems] = useState([]);
  const mediaItems = [
    { type: 'video', src: '/assets/pexels-dronepilot-chile-20683835 (1080p).mp4', keywords: ['cat', 'funny'], duration: '2:30', name: 'Cat Video', fullPath: '/assets/pexels-dronepilot-chile-20683835 (1080p).mp4', dateAdded: '2024-03-12' },
    { type: 'video', src: '/assets/pexels-rahime-gül-9844511 (1080p).mp4', keywords: ['dog', 'cute'], duration: '1:45', name: 'Dog Video', fullPath: '/assets/pexels-rahime-gül-9844511 (1080p).mp4', dateAdded: '2024-03-12' },
  ];

  const handleSearch = (query) => {
    setSearchResults([`${query} result 1`, `${query} result 2`, `${query} result 3`]);
  };

  const handleFilterByDuration = () => {
    const filteredItems = mediaItems.filter(item => {
      if (item.type === 'video' && item.duration) {
        const durationInSeconds = getDurationInSeconds(item.duration);
        return (!minDuration || durationInSeconds >= parseInt(minDuration)) && (!maxDuration || durationInSeconds <= parseInt(maxDuration));
      }
      return false;
    });
    setFilteredMediaItems(filteredItems);
    setShowDurationFilter(false);
  };

  const getDurationInSeconds = (durationString) => {
    const durationParts = durationString.split(':');
    return parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);
  };

  return (
    <Router>
      <div className="app-container">
        <div className="content">
          <Routes>
            <Route path="/" element={<Home mediaItems={filteredMediaItems.length > 0 ? filteredMediaItems : mediaItems} />} />
            <Route
              path="/search"
              element={(
                <>
                  <SearchForm onSearch={handleSearch} />
                  <div className="filter-container">
                    <button className="filter-button" onClick={() => setShowDurationFilter(true)}>Filter</button>
                    {showDurationFilter && (
                      <div className="duration-filter">
                        <input
                          type="text"
                          value={minDuration}
                          onChange={(e) => setMinDuration(e.target.value)}
                          placeholder="Min"
                        />
                        <input
                          type="text"
                          value={maxDuration}
                          onChange={(e) => setMaxDuration(e.target.value)}
                          placeholder="Max"
                        />
                        <button onClick={handleFilterByDuration}>Apply</button>
                      </div>
                    )}
                  </div>
                  <div className="search-results-container">
                    <SearchResults results={searchResults} />
                  </div>
                </>
              )}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
