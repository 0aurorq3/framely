import { createContext, useContext, useCallback } from 'react';
import { useAppContext } from '../AppContext';
import { useBurstPack } from '../hooks/useBurstPack';
import { buildFramelyDocumentName } from '../../shared/documentNaming';

type BurstPackContextType = ReturnType<typeof useBurstPack>;

const BurstPackContext = createContext<BurstPackContextType | undefined>(undefined);

export function BurstPackProvider({ children }: { children: React.ReactNode }) {
  const {
    imageSrc,
    noImageMode,
    getCurrentConfig,
    documentName,
    setDocumentName,
    exportFormat,
    jpegQuality,
    compressionMode,
  } = useAppContext();

  const ensureDocumentName = useCallback(() => {
    if (documentName) return documentName;
    const name = buildFramelyDocumentName();
    setDocumentName(name);
    return name;
  }, [documentName, setDocumentName]);

  const burst = useBurstPack(
    imageSrc,
    noImageMode,
    getCurrentConfig,
    ensureDocumentName,
    exportFormat,
    jpegQuality,
    compressionMode
  );

  return (
    <BurstPackContext.Provider value={burst}>
      {children}
    </BurstPackContext.Provider>
  );
}

export function useBurstPackContext(): BurstPackContextType {
  const context = useContext(BurstPackContext);
  if (!context) {
    throw new Error('useBurstPackContext must be used within a BurstPackProvider');
  }
  return context;
}
