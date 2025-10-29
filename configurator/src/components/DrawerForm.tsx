import { ChangeEvent, FC, FormEvent, useEffect, useState } from 'react';
import { DrawerSize } from '../lib/layout';

const sanitize = (value: number) => Math.max(100, Math.min(1200, Math.round(value)));

type DrawerFormProps = {
  value: DrawerSize;
  onSubmit: (value: DrawerSize) => void;
};

export const DrawerForm: FC<DrawerFormProps> = ({ value, onSubmit }) => {
  const [formValue, setFormValue] = useState(value);

  useEffect(() => {
    setFormValue(value);
  }, [value.widthMm, value.depthMm, value.heightMm]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value: next } = event.target;
    setFormValue((prev) => ({ ...prev, [name]: Number(next) }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const normalized: DrawerSize = {
      widthMm: sanitize(formValue.widthMm),
      depthMm: sanitize(formValue.depthMm),
      heightMm: sanitize(formValue.heightMm)
    };
    onSubmit(normalized);
  };

  return (
    <form className="drawer-form" onSubmit={handleSubmit}>
      <div className="drawer-form__fields">
        <label>
          <span>Szerokość szuflady (mm)</span>
          <input
            type="number"
            name="widthMm"
            value={formValue.widthMm}
            min={100}
            max={1200}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          <span>Głębokość szuflady (mm)</span>
          <input
            type="number"
            name="depthMm"
            value={formValue.depthMm}
            min={100}
            max={1200}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          <span>Wysokość wkładu (mm)</span>
          <input
            type="number"
            name="heightMm"
            value={formValue.heightMm}
            min={30}
            max={200}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <button className="primary" type="submit">
        Aktualizuj siatkę
      </button>
    </form>
  );
};
