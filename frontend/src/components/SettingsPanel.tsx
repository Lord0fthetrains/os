import React, { useState } from 'react';
import { X, RotateCcw, Eye, EyeOff, Settings as SettingsIcon } from 'lucide-react';
import { useWidgetSettings } from '../contexts/WidgetSettingsContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { widgetConfigs, toggleWidget, resetToDefaults } = useWidgetSettings();
  const [activeTab, setActiveTab] = useState<'widgets' | 'layout'>('widgets');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Dashboard Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-dark-700">
          <button
            onClick={() => setActiveTab('widgets')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'widgets'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Widgets
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'layout'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Layout
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'widgets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Widget Visibility
                </h3>
                <button
                  onClick={resetToDefaults}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Defaults
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {widgetConfigs.map((widget) => (
                  <div
                    key={widget.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {widget.enabled ? (
                        <Eye className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {widget.name}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleWidget(widget.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        widget.enabled
                          ? 'bg-blue-600 dark:bg-blue-500'
                          : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          widget.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Layout Settings
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Grid Behavior
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    • Drag widgets to rearrange them<br/>
                    • Hover over widgets to see resize handles<br/>
                    • Widgets automatically adjust to screen size<br/>
                    • Settings are saved automatically
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Responsive Breakpoints
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    • Large screens (1200px+): 12 columns<br/>
                    • Medium screens (996px+): 12 columns<br/>
                    • Small screens (768px+): 12 columns<br/>
                    • Extra small (480px+): 6 columns<br/>
                    • Mobile (0px+): 2 columns
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-dark-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
