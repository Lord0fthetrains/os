# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2025-01-14

### Added
- **Widget Toggle System**: Users can now toggle widgets on/off through a settings panel
- **Enhanced Widget Resizing**: Improved resize handles with better visual feedback
- **Settings Panel**: Comprehensive settings interface with widget management and layout information
- **Widget Settings Context**: Persistent widget configuration with localStorage integration
- **Responsive Layout Generation**: Dynamic layout generation based on enabled widgets

### Fixed
- **Grid Overlap Issue**: Fixed grid overlapping with the top navigation bar
- **WebSocket Connection**: Resolved WebSocket events not being received by adding proper subscription calls
- **Docker Socket Permissions**: Fixed Docker monitoring by running backend container as root
- **Layout Spacing**: Improved padding and margins for better visual hierarchy
- **Scrolling Support**: Enhanced scrolling behavior for better mobile and desktop experience

### Improved
- **UI/UX**: Better visual feedback for widget interactions
- **Performance**: Optimized widget rendering to only show enabled widgets
- **Accessibility**: Improved keyboard navigation and screen reader support
- **Mobile Responsiveness**: Better layout adaptation for different screen sizes

### Technical Changes
- Added `WidgetSettingsContext` for centralized widget configuration
- Created `SettingsPanel` component for user preferences
- Enhanced `WidgetGrid` with dynamic widget rendering
- Updated CSS with better grid layout and hover effects
- Improved TypeScript type safety across components

## [1.1.1] - Previous Release
- Initial WebSocket implementation
- Basic widget system
- Docker container management
- System monitoring capabilities
