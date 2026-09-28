import { useAppContext } from '../AppContext';

export default function PromptModal() {
  const { promptConfig, setPromptConfig } = useAppContext();

  if (!promptConfig) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={promptConfig.message}>
        <div className="modal-title">{promptConfig.message}</div>
        <input
          type="text"
          defaultValue={promptConfig.defaultValue}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              promptConfig.resolve(e.currentTarget.value);
              setPromptConfig(null);
            } else if (e.key === 'Escape') {
              promptConfig.resolve(null);
              setPromptConfig(null);
            }
          }}
          id="custom-prompt-input"
          aria-label={promptConfig.message}
          style={{ width: '100%', marginBottom: '1.25rem' }}
        />
        <div className="modal-actions">
          <button
            className="btn btn-ghost"
            onClick={() => {
              promptConfig.resolve(null);
              setPromptConfig(null);
            }}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              const input = document.getElementById('custom-prompt-input') as HTMLInputElement;
              promptConfig.resolve(input ? input.value : null);
              setPromptConfig(null);
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
