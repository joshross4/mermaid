import { parser } from './parser/vennDiagram';
import vennRenderer from './vennRenderer';
import { log } from '../../logger';
import { getConfig } from '../../config';

export const diagram = {
  parser,
  renderer: vennRenderer,
  db: {},
};

export const vennStyles = getConfig().venn;

export const getStyles = () => vennStyles;

export const setConfig = function (config) {
  Object.keys(config).forEach((key) => {
    vennStyles[key] = config[key];
  });
};

export const draw = function (text, id, version) {
  log.info('Drawing venn diagram');
  const parser = diagram.parser;
  parser.yy = diagram.db;
  
  try {
    parser.parse(text);
  } catch (error) {
    log.error('Error while parsing venn diagram', error);
    throw error;
  }

  return diagram.renderer(diagram.db, id, version);
};

export default {
  diagram,
  getStyles,
  setConfig,
  draw,
};