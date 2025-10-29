import { FC } from 'react';
import { PanelDefinition } from '../data/panels';
import { LayoutState, calculatePanelPrice, getPanelFootprint } from '../lib/layout';

type SummarySheetProps = {
  layout: LayoutState;
  panelMap: Record<string, PanelDefinition>;
  open: boolean;
  onClose: () => void;
  onExportPdf: () => void;
  shareLink: string;
};

export const SummarySheet: FC<SummarySheetProps> = ({
  layout,
  panelMap,
  open,
  onClose,
  onExportPdf,
  shareLink
}) => {
  const total = calculatePanelPrice(layout.panels, (id) => panelMap[id]);

  return (
    <div
      className={`summary-sheet ${open ? 'summary-sheet--open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={open ? undefined : true}
    >
      <div className="summary-sheet__backdrop" onClick={onClose} aria-hidden />
      <div className="summary-sheet__content">
        <header>
          <h2>Podsumowanie projektu</h2>
          <button className="icon-button" onClick={onClose} aria-label="Zamknij">
            ×
          </button>
        </header>
        <section>
          <h3>Kosztorys</h3>
          <p>
            Łączny koszt wkładu wynosi <strong>{total.toFixed(2)} PLN</strong>.
          </p>
          <ul className="summary-sheet__list">
            {layout.panels.map((panel) => {
              const definition = panelMap[panel.definitionId];
              if (!definition) return null;
              const footprint = getPanelFootprint(definition, panel.orientation);
              return (
                <li key={panel.instanceId}>
                  <span>{panel.customLabel ?? definition.name}</span>
                  <span>
                    {footprint.width}×{footprint.height} oczek — {definition.price} PLN
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
        <section>
          <h3>Udostępnianie</h3>
          <label className="share-input">
            <span>Link do projektu</span>
            <input type="url" readOnly value={shareLink} onFocus={(event) => event.currentTarget.select()} />
          </label>
          <p className="help-text">Skopiuj link i wróć do konfiguracji w dowolnej chwili.</p>
        </section>
        <section>
          <h3>Eksport</h3>
          <button className="primary" type="button" onClick={onExportPdf}>
            Pobierz PDF z podsumowaniem
          </button>
        </section>
      </div>
    </div>
  );
};
