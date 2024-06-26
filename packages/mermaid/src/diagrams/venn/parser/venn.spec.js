import { parser } from './venn.jison';

describe('VennDiagram Parser', () => {
  it('should parse a basic venn diagram', () => {
    const input = `
      vennDiagram
        title Simple Venn Diagram
        set A
        set B
        intersect A B
    `;
    const result = parser.parse(input);
    expect(result).toEqual([
      { type: 'title', text: 'Simple Venn Diagram' },
      { type: 'set', id: 'A', size: null },
      { type: 'set', id: 'B', size: null },
      { type: 'intersect', sets: ['A', 'B'], size: null }
    ]);
  });

  it('should parse sets with sizes', () => {
    const input = `
      vennDiagram
        set A size:30
        set B size:40
    `;
    const result = parser.parse(input);
    expect(result).toEqual([
      { type: 'set', id: 'A', size: 30 },
      { type: 'set', id: 'B', size: 40 }
    ]);
  });

  it('should parse intersections with labels and sizes', () => {
    const input = `
      vennDiagram
        intersect A B : "Overlap" size:15
        intersect A B C : "All Three" size:5
    `;
    const result = parser.parse(input);
    expect(result).toEqual([
      { type: 'intersect', sets: ['A', 'B'], label: 'Overlap', size: 15 },
      { type: 'intersect', sets: ['A', 'B', 'C'], label: 'All Three', size: 5 }
    ]);
  });

  it('should parse style commands', () => {
    const input = `
      vennDiagram
        style A fill:#ff0000,opacity:0.5
        style B stroke:#00ff00,stroke-width:2
    `;
    const result = parser.parse(input);
    expect(result).toEqual([
      {
        type: 'style',
        id: 'A',
        attributes: [
          { key: 'fill', value: '#ff0000' },
          { key: 'opacity', value: 0.5 }
        ]
      },
      {
        type: 'style',
        id: 'B',
        attributes: [
          { key: 'stroke', value: '#00ff00' },
          { key: 'stroke-width', value: 2 }
        ]
      }
    ]);
  });

  it('should parse a complex venn diagram', () => {
    const input = `
      vennDiagram
        title Complex Venn Diagram
        set A size:30
        set B size:40
        set C size:35
        intersect A B : "A and B" size:10
        intersect B C : "B and C" size:15
        intersect A B C : "All Three" size:5
        style A fill:#ff0000,opacity:0.5
        style B fill:#00ff00,opacity:0.5
        style C fill:#0000ff,opacity:0.5
    `;
    const result = parser.parse(input);
    expect(result).toEqual([
      { type: 'title', text: 'Complex Venn Diagram' },
      { type: 'set', id: 'A', size: 30 },
      { type: 'set', id: 'B', size: 40 },
      { type: 'set', id: 'C', size: 35 },
      { type: 'intersect', sets: ['A', 'B'], label: 'A and B', size: 10 },
      { type: 'intersect', sets: ['B', 'C'], label: 'B and C', size: 15 },
      { type: 'intersect', sets: ['A', 'B', 'C'], label: 'All Three', size: 5 },
      {
        type: 'style',
        id: 'A',
        attributes: [
          { key: 'fill', value: '#ff0000' },
          { key: 'opacity', value: 0.5 }
        ]
      },
      {
        type: 'style',
        id: 'B',
        attributes: [
          { key: 'fill', value: '#00ff00' },
          { key: 'opacity', value: 0.5 }
        ]
      },
      {
        type: 'style',
        id: 'C',
        attributes: [
          { key: 'fill', value: '#0000ff' },
          { key: 'opacity', value: 0.5 }
        ]
      }
    ]);
  });

  it('should throw an error for invalid syntax', () => {
    const input = `
      vennDiagram
        set A
        invalid command
    `;
    expect(() => parser.parse(input)).toThrow();
  });
});