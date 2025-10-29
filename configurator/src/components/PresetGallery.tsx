import { FC } from 'react';
import { PRESETS } from '../data/presets';

export type PresetGalleryProps = {
  onLoad: (presetId: string) => void;
};

export const PresetGallery: FC<PresetGalleryProps> = ({ onLoad }) => {
  return (
    <section className="preset-gallery">
      <header>
        <h2>Gotowe układy</h2>
        <p>Skorzystaj z jednego z przykładowych projektów i dostosuj go do siebie.</p>
      </header>
      <div className="preset-gallery__list">
        {PRESETS.map((preset) => (
          <article key={preset.id} className="preset-card">
            <div className="preset-card__visual" aria-hidden>
              <span>{preset.layout.grid.columns}×{preset.layout.grid.rows}</span>
            </div>
            <div className="preset-card__content">
              <h3>{preset.name}</h3>
              <p>{preset.description}</p>
              <button className="secondary" type="button" onClick={() => onLoad(preset.id)}>
                Wczytaj układ
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
