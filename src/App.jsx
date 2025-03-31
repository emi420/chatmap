import React, { useState, useEffect } from 'react';
import logo from './hot-logo.svg';
import './App.css';
import FileUpload from './components/FileUpload/index.jsx'
import Map from './components/Map/index.jsx'
import SaveButton from './components/SaveButton/index.jsx';
import NavBar from './components/NavBar';
import NavModal from './components/NavModal';
import Settings from "./components/Settings/index.jsx";
import useSettings from './hooks/useSettings';
import useFileManager from './hooks/useFileManager';
import useContentMerger from './hooks/useContentMerger';
import { FormattedMessage } from 'react-intl';

function App() {

  // Store for the modal window content
  const [modalContent, setModalContent] = useState(null);
  // Manage settings
  const [settings, handleSettingsChange] = useSettings({
    msgPosition: "closest"
  });
  // Manage files and data files
  const [handleFiles, handleDataFile, resetFileManager, dataFiles, files] = useFileManager();
  // Manage the map
  const [mapData, resetMerger] = useContentMerger({
    files: files,
    msgPosition: settings.msgPosition
  });

  // The user has uploaded a new file
  const handleNewUploadClick = () => {
    resetFileManager()
    resetMerger();
  }

  // The modal has been closed
  const handleModalClose = () => {
    setModalContent(null);
  }

  // If this settings option has change, close the modal window
  useEffect(() => {
    setModalContent(null);
  }, [settings.msgPosition])

  // There's data
  const dataAvailable = files && mapData && mapData.features.length > 0;
  // There's data but no locations
  const noLocations = files && mapData && mapData.features.length === 0;

  return (
    <div className="app">
      <header className="header">

        {/* Navigation var */}
        <div className="top">
          {!dataAvailable &&
          <NavBar onOptionClick={(option) => {
            if (option === "options") {
                // Display settings as a modal
                setModalContent(<Settings settings={settings} onChange={handleSettingsChange} />)
            }
          }} />
          }
          <NavModal isOpen={modalContent !== null} onClose={handleModalClose} content={modalContent} />
        </div>

        {/* Logo */}
        <h1 className={dataAvailable ? "titleSmall" : "title"} >
          <img src={logo} className="logo" alt="logo" />
          <span>ChatMap</span>
        </h1>

        {/* Options: upload new file, download */}
        { dataAvailable ?
        <div className="fileOptions">
            <SaveButton data={mapData} dataFiles={dataFiles} />
            <button onClick={handleNewUploadClick} className="secondaryButton">
              <FormattedMessage
                id = "app.uploadNewFile"
                defaultMessage="Upload new file"
              /> 
            </button>
        </div>
        :
        <>
          {/* Main legend */}
          <p className="subtitle">
            <FormattedMessage
              id = "app.subtitle"
              defaultMessage="Export and upload a chat to visualize locations, messages and media"
            />
          </p>
          <p className="highlighted">
            <FormattedMessage
              id = "app.supportedApps"
              defaultMessage="Now it works with WhatsApp, Telegram or Signal!"
            />
          </p>
        </>
      }
      </header>

      {/* If there're no files, show file upload options */}
      { !files &&
        <>
          <div className="fileUpload">
            <FileUpload onDataFileLoad={handleDataFile} onFilesLoad={handleFiles} />
          </div>
          <p className="configDesc">
            <strong>From chat to map</strong> check this quick <strong><a href="https://www.youtube.com/watch?v=ScHgVhyj1aw">video tutorial</a></strong>
            
          </p>
          <div className="infoLinks">
            <div className="copy">
            <a className="github" href="https://github.com/hotosm/chatmap"></a>
              <span>Free and Open Source Software</span>
            </div>
            <a href="https://www.hotosm.org/privacy">We collect zero data. https://www.hotosm.org/privacy</a>
          </div>
        </>
      }

      {/* If there's data available, show the map! */}
      { dataAvailable && 
        <div className="data">
          <div className="map">
            <Map data={mapData} dataFiles={dataFiles}/>
          </div>
        </div>
      }

      {/* If there are no locations */}
      { noLocations && 
        <>
          <h2>
            <FormattedMessage
              id = "app.nolocations"
              defaultMessage="No locations found in this file"
            />
          </h2>
          <button onClick={handleNewUploadClick} className="secondaryButton">
          <FormattedMessage
              id = "app.uploadNewFile"
              defaultMessage="Upload new file"
            /> 
          </button>
        </>
      }
    </div>
  );
}

export default App;
