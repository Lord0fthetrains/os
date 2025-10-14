import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { ThemeProvider } from './contexts/ThemeContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { WidgetSettingsProvider } from './contexts/WidgetSettingsContext';

function App() {
  return (
    <ThemeProvider>
      <WebSocketProvider>
        <WidgetSettingsProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors">
              <Routes>
                <Route path="/" element={<Dashboard />} />
              </Routes>
            </div>
          </Router>
        </WidgetSettingsProvider>
      </WebSocketProvider>
    </ThemeProvider>
  );
}

export default App;
