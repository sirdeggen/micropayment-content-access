interface ConnectPromptProps {
  onConnectWallet: () => void;
  isLoading: boolean;
}

function ConnectPrompt({ onConnectWallet, isLoading }: ConnectPromptProps) {
  return (
    <div className="connect-prompt">
            <div className="prompt-card">
              <h2>Connect Your Wallet to Get Started</h2>
              <p>
                You'll need BSV Desktop to access premium content with micropayments.
              </p>
              <button 
                className="primary-btn" 
                onClick={onConnectWallet}
                disabled={isLoading}
              >
                {isLoading ? "Connecting..." : "Connect Wallet"}
              </button>
              <a
                href="https://desktop.bsvb.tech/"
                target="_blank"
                rel="noopener noreferrer"
                className="download-link"
              >
                Don't have BSV Desktop? Download here
              </a>
            </div>
          </div>
  );
}

export default ConnectPrompt;
