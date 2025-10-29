import { FC, FormEvent, useEffect, useState } from 'react';
import { PanelDefinition } from '../data/panels';
import { PanelInstance, mmToCm, GRID_UNIT_MM, getPanelFootprint } from '../lib/layout';

type PanelInspectorProps = {
  panel: PanelInstance | null;
  definition: PanelDefinition | null;
  onRotate: (panel: PanelInstance) => void;
  onRemove: (panel: PanelInstance) => void;
  onRename: (panel: PanelInstance, name: string) => void;
};

export const PanelInspector: FC<PanelInspectorProps> = ({
  panel,
  definition,
  onRotate,
  onRemove,
  onRename
}) => {
  const [name, setName] = useState(panel?.customLabel ?? '');

  useEffect(() => {
    setName(panel?.customLabel ?? '');
  }, [panel?.customLabel, panel?.instanceId]);

  if (!panel || !definition) {
    return (
      <aside className="panel-inspector">
        <p>Wybierz panel z siatki, aby zobaczyć szczegóły.</p>
      </aside>
    );
  }

  const footprint = getPanelFootprint(definition, panel.orientation);
  const widthMm = footprint.width * GRID_UNIT_MM;
  const heightMm = footprint.height * GRID_UNIT_MM;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onRename(panel, name);
  };

  return (
    <aside className="panel-inspector">
      <header>
        <h2>{panel.customLabel ?? definition.name}</h2>
        <p>
          Panel zajmuje {footprint.width}×{footprint.height} oczek w aktualnym ułożeniu.
        </p>
      </header>
      <div className="panel-inspector__media">
        {definition.previewModel ? (
          <model-viewer
            src={definition.previewModel}
            camera-controls
            disable-zoom
            ar
            ar-scale="fixed"
            environment-image="neutral"
            style={{ width: '100%', height: '220px' }}
          />
        ) : (
          <img src={definition.image} alt="Podgląd panelu" />
        )}
      </div>
      <dl className="panel-inspector__details">
        <div>
          <dt>Wymiary</dt>
          <dd>
            {mmToCm(widthMm)} × {mmToCm(heightMm)} cm
          </dd>
        </div>
        <div>
          <dt>Pozycja w siatce</dt>
          <dd>
            kolumna {panel.x + 1}, wiersz {panel.y + 1}
          </dd>
        </div>
        <div>
          <dt>Kierunek</dt>
          <dd>{panel.orientation === 'default' ? '0°' : '90°'}</dd>
        </div>
      </dl>
      <form className="panel-inspector__form" onSubmit={handleSubmit}>
        <label>
          <span>Nazwa własna (opcjonalnie)</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={definition.name}
          />
        </label>
        <div className="panel-inspector__actions">
          <button className="secondary" type="button" onClick={() => onRotate(panel)}>
            Obróć panel
          </button>
          <button className="danger" type="button" onClick={() => onRemove(panel)}>
            Usuń panel
          </button>
        </div>
        <button className="primary" type="submit">
          Zapisz nazwę
        </button>
      </form>
    </aside>
  );
};
