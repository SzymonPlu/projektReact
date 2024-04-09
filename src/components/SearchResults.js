// components/SearchResults.js
import React from 'react';

function SearchResults({ results }) {
  return (
    <div>
      <h2>Search Results:</h2>
      <ul>
        {results.map((result, index) => (
          <li key={index}>{result}</li>
        ))}
      </ul>
    </div>
  );
}

export default SearchResults;
