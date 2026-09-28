interface ColorSwatchPickerProps {
  value: string;
  onChange: (color: string) => void;
  title: string;
  styleType?: 'toolbar' | 'sidebar';
  borderColor?: string;
}

export default function ColorSwatchPicker({
  value,
  onChange,
  title,
  styleType = 'toolbar',
  borderColor,
}: ColorSwatchPickerProps) {
  const isToolbar = styleType === 'toolbar';
  const swatchSize = isToolbar ? 16 : 14;
  const containerSize = isToolbar ? undefined : 28;
  const border = borderColor || value;

  return (
    <div
      style={{
        position: 'relative',
        ...(isToolbar ? {} : { width: containerSize, height: containerSize, flexShrink: 0 }),
      }}
    >
      <button
        className={isToolbar ? 'tool-btn' : 'btn btn-secondary'}
        style={
          isToolbar
            ? {
                position: 'relative',
                border: `1px solid ${border}`,
                backgroundColor: 'var(--surface-2)',
                padding: 0,
              }
            : {
                width: containerSize,
                height: containerSize,
                padding: 0,
                border: `1px solid ${border}`,
                backgroundColor: 'var(--surface-2)',
                borderRadius: '4px',
                cursor: 'pointer',
              }
        }
        title={title}
      >
        <span
          style={{
            display: 'block',
            width: swatchSize,
            height: swatchSize,
            borderRadius: '2px',
            background: value,
            ...(isToolbar ? {} : { margin: 'auto' }),
          }}
        />
      </button>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer',
        }}
      />
    </div>
  );
}
