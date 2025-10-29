import { FC } from 'react';
import { PanelDefinition } from '../data/panels';
import { GRID_UNIT_MM, mmToCm } from '../lib/layout';

type PanelLibraryProps = {
  panels: PanelDefinition[];
  availability: Record<string, boolean>;
  onSelect: (panel: PanelDefinition) => void;
  activePanelId: string | null;
};

export const PanelLibrary: FC<PanelLibraryProps> = ({
  panels,
  availability,
  onSelect,
  activePanelId
}) => {
  return (
    <section className="panel-library" aria-label="Biblioteka paneli">
      <header>
        <h2>Dostępne panele</h2>
        <p>Przeciągnij na siatkę lub stuknij, aby dodać do projektu.</p>
      </header>
      <div className="panel-list" role="list">
        {panels.map((panel) => {
          const isAvailable = availability[panel.id];
          const widthCm = mmToCm(panel.gridWidth * GRID_UNIT_MM);
          const heightCm = mmToCm(panel.gridHeight * GRID_UNIT_MM);
          return (
            <button
              key={panel.id}
              type="button"
              className={`panel-card ${!isAvailable ? 'panel-card--disabled' : ''} ${
                activePanelId === panel.id ? 'panel-card--active' : ''
              }`}
              onClick={() => isAvailable && onSelect(panel)}
              disabled={!isAvailable}
            >
              <div className="panel-card__preview">
                <img src={panel.image} alt="Miniaturka panelu" loading="lazy" />
              </div>
              <div className="panel-card__content">
                <h3>{panel.name}</h3>
                <p className="panel-card__description">{panel.description}</p>
                <dl className="panel-card__meta">
                  <div>
                    <dt>Rozmiar siatki</dt>
                    <dd>
                      {panel.gridWidth}×{panel.gridHeight} oczek
                    </dd>
                  </div>
                  <div>
                    <dt>Wymiary</dt>
                    <dd>
                      {widthCm} × {heightCm} cm
                    </dd>
                  </div>
                  <div>
                    <dt>Przykładowe rzeczy</dt>
                    <dd>{panel.sampleItems.join(', ')}</dd>
                  </div>
                </dl>
                <footer className="panel-card__footer">
                  <span className="price">{panel.price} PLN</span>
                  <span className="chip">{panel.category}</span>
                </footer>
                {!isAvailable && <p className="panel-card__warning">Brak miejsca w aktualnym układzie</p>}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
