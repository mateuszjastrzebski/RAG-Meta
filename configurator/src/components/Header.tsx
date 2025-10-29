import { FC } from 'react';

type HeaderProps = {
  totalPrice: number;
  onOpenSummary: () => void;
};

export const Header: FC<HeaderProps> = ({ totalPrice, onOpenSummary }) => {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Gridfinity</p>
        <h1>Konfigurator modułowych wkładów</h1>
      </div>
      <div className="header-actions">
        <span className="price-pill">
          Aktualny koszt <strong>{totalPrice.toFixed(2)} PLN</strong>
        </span>
        <button className="primary" onClick={onOpenSummary} type="button">
          Podsumowanie
        </button>
      </div>
    </header>
  );
};
