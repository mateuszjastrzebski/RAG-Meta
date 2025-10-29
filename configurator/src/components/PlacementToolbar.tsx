import { FC } from 'react';
import { PanelDefinition } from '../data/panels';
import { PanelOrientation, getPanelFootprint } from '../lib/layout';

type PlacementToolbarProps = {
  panel: PanelDefinition | null;
  orientation: PanelOrientation;
  onCancel: () => void;
  onToggleOrientation: () => void;
};

export const PlacementToolbar: FC<PlacementToolbarProps> = ({
  panel,
  orientation,
  onCancel,
  onToggleOrientation
}) => {
  if (!panel) return null;
  const footprint = getPanelFootprint(panel, orientation);

  return (
    <div className="placement-toolbar">
      <span>
        Dodajesz: <strong>{panel.name}</strong> ({footprint.width}×{footprint.height} oczek)
      </span>
      <div className="placement-toolbar__actions">
        <button className="secondary" type="button" onClick={onToggleOrientation}>
          Obróć ({orientation === 'default' ? '0°' : '90°'})
        </button>
        <button className="ghost" type="button" onClick={onCancel}>
          Anuluj
        </button>
      </div>
    </div>
  );
};
