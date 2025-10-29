import type { PanelDefinition } from '../data/panels';

export type DrawerSize = {
  widthMm: number;
  depthMm: number;
  heightMm: number;
};

export type GridSize = {
  columns: number;
  rows: number;
};

export type PanelOrientation = 'default' | 'rotated';

export type PanelInstance = {
  instanceId: string;
  definitionId: string;
  x: number;
  y: number;
  orientation: PanelOrientation;
  customLabel?: string;
};

export type LayoutState = {
  drawer: DrawerSize;
  grid: GridSize;
  panels: PanelInstance[];
};

export const GRID_UNIT_MM = 42;

export const defaultDrawer: DrawerSize = {
  widthMm: 300,
  depthMm: 420,
  heightMm: 60
};

export const calculateGridSize = (drawer: DrawerSize): GridSize => ({
  columns: Math.max(1, Math.floor(drawer.widthMm / GRID_UNIT_MM)),
  rows: Math.max(1, Math.floor(drawer.depthMm / GRID_UNIT_MM))
});

export const getPanelFootprint = (panel: PanelDefinition, orientation: PanelOrientation) =>
  orientation === 'default'
    ? { width: panel.gridWidth, height: panel.gridHeight }
    : { width: panel.gridHeight, height: panel.gridWidth };

export const doesPanelFit = (
  grid: GridSize,
  panel: PanelDefinition,
  orientation: PanelOrientation,
  position: { x: number; y: number },
  occupied: PanelInstance[]
): boolean => {
  const footprint = getPanelFootprint(panel, orientation);
  if (position.x < 0 || position.y < 0) return false;
  if (position.x + footprint.width > grid.columns) return false;
  if (position.y + footprint.height > grid.rows) return false;

  return !occupied.some((existing) => {
    const existingDef = panelById(existing.definitionId);
    if (!existingDef) return false;
    const existingFootprint = getPanelFootprint(existingDef, existing.orientation);
    return rectanglesOverlap(
      position.x,
      position.y,
      footprint.width,
      footprint.height,
      existing.x,
      existing.y,
      existingFootprint.width,
      existingFootprint.height
    );
  });
};

const rectanglesOverlap = (
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number
) => {
  return !(
    x1 + w1 <= x2 ||
    x2 + w2 <= x1 ||
    y1 + h1 <= y2 ||
    y2 + h2 <= y1
  );
};

let panelRegistry: Map<string, PanelDefinition> | null = null;

export const registerPanels = (panels: PanelDefinition[]) => {
  panelRegistry = new Map(panels.map((panel) => [panel.id, panel]));
};

export const panelById = (id: string): PanelDefinition | undefined =>
  panelRegistry?.get(id);

export const layoutToQuery = (state: LayoutState): string => {
  const payload = JSON.stringify(state);
  return btoa(encodeURIComponent(payload));
};

export const layoutFromQuery = (value: string | null): LayoutState | null => {
  if (!value) return null;
  try {
    const decoded = decodeURIComponent(atob(value));
    const parsed = JSON.parse(decoded) as LayoutState;
    if (!parsed.drawer || !parsed.grid || !Array.isArray(parsed.panels)) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn('Nie udało się załadować konfiguracji z linku', error);
    return null;
  }
};

export const mmToCells = (millimeters: number) => millimeters / GRID_UNIT_MM;

export const mmToCm = (millimeters: number) => (millimeters / 10).toFixed(1);

export const calculatePanelPrice = (panels: PanelInstance[], getDefinition: (id: string) => PanelDefinition | undefined) =>
  panels.reduce((sum, panel) => {
    const def = getDefinition(panel.definitionId);
    if (!def) return sum;
    return sum + def.price;
  }, 0);

export const createPdf = (state: LayoutState, getDefinition: (id: string) => PanelDefinition | undefined) => {
  const lines: string[] = [];
  lines.push('Gridfinity Configurator');
  lines.push('-----------------------');
  lines.push(
    `Szuflada: ${state.drawer.widthMm}mm × ${state.drawer.depthMm}mm × ${state.drawer.heightMm}mm (${state.grid.columns}×${state.grid.rows} oczek)`
  );
  lines.push('');
  lines.push('Panele:');
  state.panels.forEach((panel, index) => {
    const def = getDefinition(panel.definitionId);
    if (!def) return;
    const footprint = getPanelFootprint(def, panel.orientation);
    lines.push(
      `${index + 1}. ${panel.customLabel ?? def.name} – ${footprint.width}×${footprint.height} oczek, orientacja: ${
        panel.orientation === 'default' ? '0°' : '90°'
      } (x: ${panel.x + 1}, y: ${panel.y + 1})`
    );
  });
  lines.push('');
  lines.push(`Łączny koszt: ${calculatePanelPrice(state.panels, getDefinition)} PLN`);

  const content = lines.join('\n');
  const pdf = minimalPdf(content);
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gridfinity-konfiguracja.pdf';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const minimalPdf = (text: string) => {
  const lines = text.split('\n');
  const objects: string[] = [];
  const offsets: number[] = [];
  const addObject = (content: string) => {
    offsets.push(objects.reduce((acc, obj) => acc + obj.length, 0) + `%PDF-1.4\n`.length);
    objects.push(`${objects.length + 1} 0 obj\n${content}\nendobj\n`);
  };

  addObject('<< /Type /Catalog /Pages 2 0 R >>');
  addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');

  const contentStream = createContentStream(lines);
  addObject('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>');
  addObject(`<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`);
  addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  let pdf = '%PDF-1.4\n';
  pdf += objects.join('');
  const xrefOffset = pdf.length;
  pdf += 'xref\n';
  pdf += `0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.forEach((offset) => {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });
  pdf += 'trailer\n';
  pdf += `<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += 'startxref\n';
  pdf += `${xrefOffset}\n`;
  pdf += '%%EOF';
  return pdf;
};

const createContentStream = (lines: string[]) => {
  const commands: string[] = [];
  let y = 800;
  commands.push('BT');
  commands.push('/F1 12 Tf');
  lines.forEach((line) => {
    commands.push(`72 ${y} Td (${escapePdfText(line)}) Tj`);
    y -= 18;
  });
  commands.push('ET');
  return commands.join('\n');
};

const escapePdfText = (value: string) => value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
