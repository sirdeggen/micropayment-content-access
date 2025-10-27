import type { Article } from '../types/article';

interface ArticleCard {
  article: Article;
  handleArticleClick: (article: Article) => void;
  handleUnlockArticle: (articleId: string) => void;
  isProcessing: boolean;
}

function ArticleCard({ article, handleArticleClick, handleUnlockArticle, isProcessing }: ArticleCard) {
  return (
        <article
                key={article.id}
                className={`article-card ${article.isPurchased ? "purchased" : "locked"}`}
                onClick={() => handleArticleClick(article)}
              >
                <div className="article-header">
                  <h2 className="article-title">{article.title}</h2>
                  {article.isPurchased ? (
                    <span className="badge badge-unlocked">Unlocked</span>
                  ) : (
                    <span className="badge badge-locked">🔒 Locked</span>
                  )}
                </div>

                <div className="article-meta">
                  <span className="meta-item">✍️ {article.author}</span>
                  <span className="meta-item">📚 {article.subject}</span>
                  <span className="meta-item">📝 {article.wordCount} words</span>
                </div>

                <p className="article-preview">{article.preview}</p>

                <div className="article-footer">
                  <div className="price-tag">
                    <span className="price">{article.price} sats</span>
                    <span className="price-usd">
                      ≈ ${(article.price * 0.00001).toFixed(4)}
                    </span>
                  </div>
                  {!article.isPurchased && (
                    <button
                      className="unlock-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlockArticle(article.id);
                      }}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Unlock Article"}
                    </button>
                  )}
                  {article.isPurchased && article.txid && (
                    <a
                      href={`https://whatsonchain.com/tx/${article.txid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tx-link"
                      title={article.txid}
                      onClick={(e) => e.stopPropagation()}
                    >
                      View TX on WhatsOnChain
                    </a>
                  )}
                </div>
              </article>
  );
}

export default ArticleCard;
