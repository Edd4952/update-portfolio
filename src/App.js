import './App.css';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import AddSkillPage from './Pages/AddSkillPage';
import AddProjectPage from './Pages/AddProjectPage';
import DownloadResumePage from './Pages/DownloadResumePage';

function Home() {
  return (
    <main className="page">
      <h1>Update Portfolio</h1>
      <p>Select what you would like to add.</p>
      <div className="button-row">
        <Link className="nav-button" to="/add-skill">
          Add Skill
        </Link>
        <Link className="nav-button" to="/add-project">
          Add Project
        </Link>
        <Link className="nav-button" to="/download-resume">
          Download Resume
        </Link>
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-skill" element={<AddSkillPage />} />
          <Route path="/add-project" element={<AddProjectPage />} />
          <Route path="/download-resume" element={<DownloadResumePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
