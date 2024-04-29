import React, { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserCog } from '@fortawesome/free-solid-svg-icons';
import ReactPlayer from 'react-player';

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState('');
  

  const [searchQuery, setSearchQuery] = useState('');
  const [mediaItems, setMediaItems] = useState([]);
  const [filteredMediaItems, setFilteredMediaItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showAddMediaForm, setShowAddMediaForm] = useState(false);
  const [newMediaFile, setNewMediaFile] = useState(null);
  const [newMediaKeywords, setNewMediaKeywords] = useState('');
  const [newMediaName, setNewMediaName] = useState('');
  const [durationFilter, setDurationFilter] = useState({ min: 0, max: Infinity });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchBarVisible, setSearchBarVisible] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [approvalError, setApprovalError] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isArchivist, setIsArchivist] = useState(false);
  const [isProductionManager, setIsProductionManager] = useState(false);
  const [editedTranscription, setEditedTranscription] = useState('');

  const handleEditTranscription = (newTranscription) => {
    setEditedTranscription(newTranscription);
  };

  const handleSaveTranscription = async (movieId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/videos/transcription/${movieId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ transcription: editedTranscription }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const updatedMovie = await response.json();
      console.log(`Updated transcription for movie ${movieId}:`, updatedMovie);
  
      // Aktualizuj listę filmów z nową transkrypcją
      setMediaItems(mediaItems.map(item => item._id === movieId ? updatedMovie : item));
      setEditedTranscription('');  // Wyczyść edytowaną transkrypcję
    } catch (error) {
      console.error('Error saving transcription:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      const storedRole = localStorage.getItem('role');
      setUserRole(storedRole);
      setIsAdmin(storedRole === 'admin');
      setIsArchivist(storedRole === 'archiwista');
      setIsProductionManager(storedRole === 'kierownik produkcji');
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
      setIsArchivist(false);
      setIsProductionManager(false);
    }
    fetchMediaItems();
  }, []);

  const fetchMediaItems = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:3001/api/videos', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMediaItems(data);
      setFilteredMediaItems(data);
    } catch (error) {
      console.error('Error fetching media items:', error);
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
  
    const filteredItems = mediaItems.filter(item => {
      const keywords = item.keywords?.map(keyword => keyword.toLowerCase()) || [];
      const name = item.name?.toLowerCase() || '';
      const transcription = item.transcription?.toLowerCase() || '';
  
      return (
        (keywords.includes(query) || name.includes(query) || transcription.includes(query)) &&
        item.duration >= durationFilter.min &&
        item.duration <= durationFilter.max &&
        (isAdmin || ['do akceptacji', 'zaakceptowano'].includes(item.status))
      );
    });
  
    setFilteredMediaItems(filteredItems);
  };
  

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setIsFormVisible(false);
    handleSearch({ target: { value: searchQuery } });
  };

  const handleThumbnailClick = (src) => {
    const video = filteredMediaItems.find(item => item.src === src && item.type === 'video');
    setSelectedVideo(video);
  };

  const handleAddMedia = () => {
    setShowAddMediaForm(prevShowAddMediaForm => !prevShowAddMediaForm);
  };

  const handleMediaFormSubmit = async (event) => {
    event.preventDefault();

    if (!newMediaFile) {
      console.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('video', newMediaFile);
    formData.append('name', newMediaName);
    formData.append('keywords', newMediaKeywords);
    formData.append('status', 'niezaakceptowany');

    try {
      const response = await fetch('http://localhost:3001/api/videos/add', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error adding new media');
      }

      const data = await response.json();
      setMediaItems([...mediaItems, data]);
      setFilteredMediaItems([...filteredMediaItems, data]);
      setNewMediaFile(null);
      setNewMediaKeywords('');
      setNewMediaName('');
      setShowAddMediaForm(false);
    } catch (error) {
      console.error('Error adding new media:', error);
    }
  };

  const handleSelectItem = (_id) => {
    setSelectedItems(prevSelectedItems => {
      if (prevSelectedItems.includes(_id)) {
        return prevSelectedItems.filter(itemId => itemId !== _id);
      } else {
        return [...prevSelectedItems, _id];
      }
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      alert('No items selected for deletion');
      return;
    }

    const confirmation = window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`);
    if (!confirmation) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/videos/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: selectedItems })
      });

      if (!response.ok) {
        throw new Error('Error deleting selected items');
      }

      const data = await response.json();
      alert(data.message);
      setSelectedItems([]);
      fetchMediaItems();
    } catch (error) {
      console.error('Error deleting selected items:', error);
    }
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleSettingsClick = () => {
    setShowSettingsForm(prev => !prev);
  };

  const handleApproveVideo = async (videoId) => {
    const confirmApproval = window.confirm('Czy na pewno chcesz zmienić status wybranego wideo?');
    if (!confirmApproval) {
      return;
    }
  
    try {
      setIsApproving(true);
  
      const response = await fetch(`http://localhost:3001/api/videos/approve/${videoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Error changing video status');
      }
  
      const updatedVideo = await response.json();
      const updatedMediaItems = mediaItems.map(item =>
        item._id === updatedVideo._id ? updatedVideo : item
      );
  
      setMediaItems(updatedMediaItems);
      setFilteredMediaItems(updatedMediaItems);
      setIsApproving(false);
  
      alert(`Status wideo został zmieniony na "${updatedVideo.status}"`); // Update the alert message to reflect the new status
    } catch (error) {
      console.error('Error changing video status:', error);
      setApprovalError('Error changing video status. Please try again.');
      setIsApproving(false);
    }
  };

  useEffect(() => {
    console.log('IsLoggedIn:', isLoggedIn);
    console.log('IsAdmin:', isAdmin);
  }, [isLoggedIn, isAdmin]);

  const handleAddUser = async () => {
    const username = prompt('Enter username:');
    const password = prompt('Enter password:');
    const role = prompt('Enter role (admin/reporter/archiwista/kierownik produkcji):');

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3001/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, password, role })
      });

      if (!response.ok) {
        throw new Error('Error adding new user');
      }

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('Error adding new user:', error);
    }
  };

  const handleChangePassword = async () => {
    const username = prompt('Enter username:');
    const newPassword = prompt('Enter new password:');

    try {
      const response = await fetch('http://localhost:3001/api/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, newPassword })
      });

      if (!response.ok) {
        throw new Error('Error changing password');
      }

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const handleDeleteUser = async () => {
    const username = prompt('Enter username to delete:');

    try {
      const response = await fetch('http://localhost:3001/users/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
      });

      if (!response.ok) {
        throw new Error('Error deleting user');
      }

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const isReporter = userRole === 'reporter';

  return (
    <div>
      <div className="search-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '15px' }}>
        {!searchBarVisible && <FontAwesomeIcon icon={faSearch} className="search-icon" onClick={() => setSearchBarVisible(true)} />}
        {searchBarVisible && (
          <>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search for media..."
              style={{ fontSize: '16px', lineHeight: '1.5', padding: '8px', borderRadius: '5px', border: '1px solid #516c7d', marginRight: '10px' }}
            />
            <button
              onMouseOver={() => setIsFormVisible(true)}
              onMouseLeave={() => {
                setTimeout(() => {
                  if (!isInputFocused) {
                    setIsFormVisible(false);
                  }
                }, 200);
              }}
              style={{
                fontSize: '14px',
                lineHeight: '1.5',
                padding: '5px 10px',
                backgroundColor: '#516c7d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Filter
            </button>
            {isAdmin && isLoggedIn && (
              <>
                <button onClick={handleAddMedia} style={{ fontSize: '14px', lineHeight: '1.5', padding: '5px 10px', backgroundColor: '#516c7d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>Add Media</button>
                {selectedItems.length > 0 && <button onClick={handleDeleteSelected} style={{ fontSize: '14px', lineHeight: '1.5', padding: '5px 10px', backgroundColor: '#516c7d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>Delete Media</button>}
              </>
            )}
            {isLoggedIn ? (
              <button onClick={handleLogout} style={{ fontSize: '14px', lineHeight: '1.5', padding: '5px 10px', backgroundColor: '#516c7d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>Logout</button>
            ) : (
              <button onClick={handleLoginClick} style={{ fontSize: '14px', lineHeight: '1.5', padding: '5px 10px', backgroundColor: '#516c7d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>Login</button>
            )}
            {isAdmin && isLoggedIn && (
              <button onClick={handleSettingsClick} style={{ fontSize: '14px', lineHeight: '1.5', padding: '5px 10px', backgroundColor: '#516c7d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>
                <FontAwesomeIcon icon={faUserCog} /> Settings
              </button>
            )}
            {showLoginModal && <LoginModal onClose={handleCloseLoginModal} />}
          </>
        )}
      </div>
      {showSettingsForm && (
        <div className="settings-form" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', borderRadius: '5px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', zIndex: '9999' }}>
          <h2>Settings</h2>
          <button onClick={handleAddUser}>Add User</button>
          <button onClick={handleChangePassword}>Change Password</button>
          <button onClick={handleDeleteUser}>Delete User</button>
        </div>
      )}
      {isFormVisible && (
        <form onSubmit={handleFilterSubmit} style={{ marginBottom: '15px' }}>
          <label htmlFor="minDuration" style={{ marginRight: '10px' }}>Min Duration:</label>
          <input
            type="number"
            id="minDuration"
            value={durationFilter.min}
            onChange={(e) => setDurationFilter({ ...durationFilter, min: e.target.value })}
            style={{ fontSize: '14px', lineHeight: '1.5', padding: '8px', borderRadius: '5px', border: '1px solid #516c7d', marginRight: '10px' }}
          />
          <label htmlFor="maxDuration" style={{ marginRight: '10px' }}>Max Duration:</label>
          <input
            type="number"
            id="maxDuration"
            value={durationFilter.max}
            onChange={(e) => setDurationFilter({ ...durationFilter, max: e.target.value })}
            style={{ fontSize: '14px', lineHeight: '1.5', padding: '8px', borderRadius: '5px', border: '1px solid #516c7d', marginRight: '10px' }}
          />
          <button type="submit" style={{ fontSize: '14px', lineHeight: '1.5', padding: '5px 10px', backgroundColor: '#516c7d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Submit</button>
        </form>
      )}
      {showAddMediaForm && (
        <form onSubmit={handleMediaFormSubmit} style={{ marginBottom: '15px' }}>
          <input
            type="file"
            accept="video/*, image/*"
            onChange={(e) => setNewMediaFile(e.target.files[0])}
          />
          <input
            type="text"
            value={newMediaKeywords}
            onChange={(e) => setNewMediaKeywords(e.target.value)}
            placeholder="Enter keywords"
            style={{ fontSize: '14px', lineHeight: '1.5', padding: '8px', borderRadius: '5px', border: '1px solid #516c7d', marginRight: '10px' }}
          />
          <input
            type="text"
            value={newMediaName}
            onChange={(e) => setNewMediaName(e.target.value)}
            placeholder="Enter name"
            style={{ fontSize: '14px', lineHeight: '1.5', padding: '8px', borderRadius: '5px', border: '1px solid #516c7d', marginRight: '10px' }}
          />
          <button type="submit" style={{ fontSize: '14px', lineHeight: '1.5', padding: '5px 10px', backgroundColor: '#516c7d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Submit</button>
        </form>
      )}
      <div className="content-wrapper" style={{ display: 'flex' }}>
      <div className="left-panel" style={{ width: '30%', backgroundColor: '#D3D3D3', padding: '15px', marginRight: '15px', overflow: 'auto' }}>
          <div className="search-results">
            <table className="search-results-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
             
<tr>
  <th style={{ border: '1px solid #000', padding: '8px' }}>Thumbnail</th>
  <th style={{ border: '1px solid #000', padding: '8px' }}>Title</th>
  <th style={{ border: '1px solid #000', padding: '8px' }}>Description</th>
  {isReporter && (
    <th style={{ border: '1px solid #000', padding: '8px' }}>Request Approval</th>
  )}
  {isAdmin && (
    <th style={{ border: '1px solid #000', padding: '8px' }}>Delete</th>
  )}
  {(isAdmin || isArchivist || isProductionManager) && (
    <th style={{ border: '1px solid #000', padding: '8px' }}>Approve</th>
  )}
</tr>
</thead>
<tbody>
{filteredMediaItems.map(item => (
  <tr key={item._id}>
    <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'middle' }}>
      {item.type === 'video' && (
        <div onClick={() => handleThumbnailClick(item.src)}>
          <ReactPlayer
            url={`http://localhost:3001/${item.src}`}
            width="100px"
            height="100px"
            style={{ cursor: 'pointer' }}
            controls={false}
            playing={false}
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload'
                }
              }
            }}
          />
        </div>
      )}
    </td>
    <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'middle' }}>{item.name}</td>
    <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'middle' }}>
      <p>{`Duration: ${item.duration}, Type: ${item.type}, Date Added: ${item.dateAdded}`}</p>
    </td>
    {isReporter && (
      <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'middle' }}>
        <button onClick={() => handleApproveVideo(item._id)}>
          Approve
        </button>
      </td>
    )}
    {isAdmin && (
      <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'middle' }}>
        <input
          type="checkbox"
          onChange={() => handleSelectItem(item._id)}
          checked={selectedItems.includes(item._id)}
        />
      </td>
    )}
    {item.status === 'do akceptacji' && (
      <td style={{ border: '1px solid #000', padding: '8px', verticalAlign: 'middle' }}>
        <button onClick={() => handleApproveVideo(item._id)}>
          Approve
        </button>
      </td>
    )}
  </tr>
))}
</tbody>
</table>
  </div>
</div>
<div className="middle-panel" style={{ width: '40%', backgroundColor: '#A9A9A9' }}>
  <VideoPlayer selectedVideo={selectedVideo} />
</div>
<div className="right-panel" style={{ width: '30%', backgroundColor: '#808080', padding: '15px' }}>
  {selectedVideo && (
    <>
      <h3 style={{ fontSize: '24px', lineHeight: '1.6' }}>ID: {selectedVideo._id}</h3>
      <p style={{ fontSize: '16px', lineHeight: '1.5' }}><strong>Keywords:</strong> {selectedVideo.keywords.join(', ')}</p>
      {isArchivist && (
        <div>
          <h3>Transcription</h3>
          <textarea
            value={editedTranscription}
            onChange={(e) => handleEditTranscription(e.target.value)}
          />
          <button onClick={() => handleSaveTranscription(selectedVideo._id)}>
            Save
          </button>
        </div>
      )}
    </>
  )}
</div>
</div>
</div>
);
}

function VideoPlayer({ selectedVideo }) {
  return (
    <div style={{ position: 'relative', paddingTop: '56.25%' }}>
      <ReactPlayer
        url={selectedVideo ? `http://localhost:3001/${selectedVideo.src}` : ''}
        controls
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
    </div>
  );
}

export default Home;
