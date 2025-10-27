interface HeaderProps {
  isRestoringSession: boolean;
  isWalletConnected: boolean;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  isLoading: boolean;
}

function Header({ isRestoringSession, isWalletConnected, onConnectWallet, onDisconnectWallet, isLoading }: HeaderProps) {
  return (
          <header className="header">
        <div className="header-content">
          <h1>BSV Micropayment Content</h1>
          <p className="tagline">
            Pay fractions of a cent, unlock premium content instantly
          </p>
        </div>
        <div className="wallet-section">
          {isRestoringSession ? (
            <div className="wallet-loading">
              <span>Checking wallet connection...</span>
            </div>
          ) : !isWalletConnected ? (
            <button 
              className="connect-wallet-btn" 
              onClick={onConnectWallet}
              disabled={isLoading}
            >
              {isLoading ? "Connecting..." : "Connect BSV Desktop Wallet"}
            </button>
          ) : (
            <div className="wallet-connected">
              <span className="status-indicator"></span>
              <span>Wallet Connected</span>
              <button 
                className="disconnect-btn" 
                onClick={onDisconnectWallet}
                title="Disconnect wallet"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </header>
  );
}

export default Header;
