# Universal Chat Aggregator

A single desktop application that combines messages from WhatsApp, Telegram, Discord, Messenger, Slack, and more into a unified chat interface while preserving their features.

## Features

- **Unified Interface**: View and respond to all your messages in one place
- **Multi-Platform Support**: Integrates with WhatsApp, Telegram, Discord, Messenger, and Slack
- **Feature Preservation**: Maintains platform-specific features like reactions, replies, etc.
- **Universal Search**: Search across all your chats from different platforms
- **Notification Management**: Consolidated notifications from all platforms
- **Theme Support**: Light and dark mode with customizable UI
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Installation

### Prerequisites

- Node.js (v16+)
- npm or yarn
- For WhatsApp connectivity: WhatsApp Web accessible in your browser

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/NamoVize/universal-chat-aggregator.git
   cd universal-chat-aggregator
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or with yarn:
   ```
   yarn install
   ```

3. Set up platform connections:
   ```
   npm run setup
   ```
   This will guide you through connecting each platform.

4. Start the application:
   ```
   npm start
   ```

### Platform-Specific Setup

Each messaging platform requires specific authentication:

- **WhatsApp**: Scan QR code via WhatsApp Web protocol
- **Telegram**: Provide your phone number and authentication code
- **Discord**: Log in with Discord credentials or use a bot token
- **Messenger**: Authenticate with Facebook credentials
- **Slack**: Use OAuth to authorize workspaces

## Development

### Project Structure

- `/electron` - Electron main process code
- `/src` - React application code
- `/src/platforms` - Platform-specific integration code
- `/src/components` - Reusable UI components
- `/src/store` - State management

### Running in Development Mode

```
npm run dev
```

### Building for Production

```
npm run build
```

Distribution files will be generated in the `/dist` folder.

## Security Considerations

This application stores access tokens locally in an encrypted format. No messages or credentials are sent to any third-party servers. All communication happens directly between your computer and the respective messaging platforms.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.