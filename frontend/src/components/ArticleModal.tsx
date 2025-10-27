import type { Article } from '../types/article';

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
  onUnlock: (articleId: string) => void;
}

function ArticleModal({ article, onClose, onUnlock }: ArticleModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h1>{article.title}</h1>
        <div className="article-meta">
          <span>By {article.author}</span>
          <span>•</span>
          <span>{article.subject}</span>
          <span>•</span>
          <span>{article.wordCount} words</span>
        </div>

        <div className="locked-content">
          <p className="preview-text">{article.preview}</p>
          <div className="paywall">
            <div className="paywall-message">
              <h3>🔒 This content is locked</h3>
              <p>
                Unlock this article for only {article.price}{" "}
                satoshis
              </p>
            </div>
            <button
              className="unlock-btn-large"
              onClick={() => {
                onUnlock(article.id);
                onClose();
              }}
            >
              Unlock for {article.price} sats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArticleModal;
