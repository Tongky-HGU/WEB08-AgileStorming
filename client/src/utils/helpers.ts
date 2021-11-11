interface ICoord {
  x: number;
  y: number;
}

interface IRect extends ICoord {
  width: number;
  height: number;
  type: QUATER_SPACE;
}

interface IGetTypeParams {
  parentCoord: TCoord;
  currentCoord: TCoord;
  gap: IGap;
}

interface IGap {
  leftGap: number;
  topGap: number;
}

interface ICalcRectParams {
  parentCoord: TCoord;
  currentCoord: TCoord;
  gap: TGap;
  type: QUATER_SPACE;
}

enum QUATER_SPACE {
  FIRST = 1,
  SECOND,
  THIRD,
  FOURTH,
}

enum MINDMAP_BG_SIZE {
  WIDTH = 5000,
  HEIGHT = 5000,
}

const pxToNum = (px: string): number => Number(px.slice(0, -2));
const numToPx = (num: number): string => num + 'px';
const getCenterCoord = (width: number, height: number): number[] => [
  (MINDMAP_BG_SIZE.WIDTH - width) / 2,
  (MINDMAP_BG_SIZE.HEIGHT - height) / 2,
];

const getKoreans = (str: string): [string, RegExpMatchArray] => [str, str.match(/[가-힣]/g) ?? []];
const splitEnAndKo = ([str, koreans]: [string, RegExpMatchArray]): [number, number] => [str.length - koreans.length, koreans.length];
const calculateWidth = ([en, ko]: [number, number]): number => en * 9 + ko * 18 + 20;
const getNodeWidth = (str: string) => calculateWidth(splitEnAndKo(getKoreans(str)));

const getRegexNumber = (nodeId: string) => {
  return Number(nodeId.replace(/[^0-9]/g, ''));
};

const getId = (nodeId: string): number => {
  const splitId = nodeId.split('#');
  return Number(splitId[1]);
};

export type Levels = 'ROOT' | 'EPIC' | 'STORY' | 'TASK';
type DictType = { [index: number]: string };
const LEVEL_DICT: DictType = { 0: 'ROOT', 1: 'EPIC', 2: 'STORY', 3: 'TASK' };
const idxToLevel = (idx: number) => LEVEL_DICT[idx] as Levels;
const levelToIdx = (level: string) => Object.values(LEVEL_DICT).findIndex((v) => level === v);

const getDrawShape = (rect: IRect): string =>
  'M' +
  (rect.type === 1 ? `0,${rect.height}` : `0,0`) +
  'Q' +
  (rect.type === 1 ? `0,0 ${rect.width},0` : `0,${rect.height} ${rect.width},${rect.height}`);

const getCurrentCoord = (currentNode: HTMLElement) => ({
  x: Math.floor(currentNode.offsetLeft + currentNode.offsetWidth / 2),
  y: Math.floor(currentNode.offsetTop + currentNode.offsetHeight / 2),
});

const getGap = (currentContainer: HTMLElement) => ({
  topGap: Math.floor(currentContainer.offsetTop),
  leftGap: Math.floor(currentContainer.offsetLeft),
});

const getType = ({ currentCoord, gap, parentCoord }: IGetTypeParams) =>
  currentCoord.y + gap.topGap > parentCoord.y ? QUATER_SPACE.FOURTH : QUATER_SPACE.FIRST;

const calcRect = ({ parentCoord, currentCoord, gap, type }: ICalcRectParams): IRect => ({
  x: currentCoord.x - Math.abs(currentCoord.x + gap.leftGap - parentCoord.x),
  y: type === 1 ? currentCoord.y : currentCoord.y - Math.abs(currentCoord.y + gap.topGap - parentCoord.y),
  width: Math.abs(currentCoord.x + gap.leftGap - parentCoord.x),
  height: Math.max(Math.abs(currentCoord.y + gap.topGap - parentCoord.y), 3),
  type: type,
});

const getNewNode = (id: number, level: Levels, content: string) => ({
  nodeId: id,
  backlogId: '',
  level: level,
  content: content,
  children: [],
  label: [],
  sprint: null,
  assignee: null,
  createdAt: new Date().toISOString(),
  expectedAt: null,
  closedAt: null,
  expectedTime: null,
  priority: null,
  comment: [],
});

export {
  getNewNode,
  calcRect,
  getType,
  getGap,
  getCurrentCoord,
  QUATER_SPACE,
  getDrawShape,
  getId,
  pxToNum,
  numToPx,
  getCenterCoord,
  getNodeWidth,
  MINDMAP_BG_SIZE,
  getRegexNumber,
  idxToLevel,
  levelToIdx,
};
export type TRect = IRect;
export type TCoord = ICoord;
export type TGap = IGap;
