import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { ThemeProvider } from './contexts/ThemeContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { WidgetSettingsProvider } from './contexts/WidgetSettingsContext';
import { VersionProvider } from './contexts/VersionContext';

function App() {
  return (
    <ThemeProvider>
      <WebSocketProvider>
        <WidgetSettingsProvider>
          <VersionProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                </Routes>
              </div>
            </Router>
          </VersionProvider>
        </WidgetSettingsProvider>
      </WebSocketProvider>
    </ThemeProvider>
  );
}

export default App;
