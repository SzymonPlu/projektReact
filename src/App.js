import React, { useState, useEffect } from 'react';
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
  const [mediaItems, setMediaItems] = useState([]);

  useEffect(() => {
    fetch('/api/videos', {
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN' // Upewnij się, że masz poprawny token
      }
    })
      .then(response => response.json())
      .then(data => setMediaItems(data))
      .catch(error => console.error('Error fetching videos:', error));
  }, []);

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
